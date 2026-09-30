import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const WINDOW_MS    = 120_000;
const MAX_REQUESTS = 3;
const requests     = new Map();

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

const DEBRIEF_PROMPT = `You are a senior software engineer who just finished a 45-minute technical phone screen with a candidate. You are writing your structured interview debrief.

Rules:
- Be direct, specific, and honest. Not harsh, not fluffy.
- Reference the actual questions and answers where relevant.
- Identify 1-2 genuine strengths and 1-2 concrete areas for improvement.
- The "verdict" field must be one of: "strong_yes" | "yes" | "lean_yes" | "lean_no" | "no"
- Keep feedback and each strength/weakness under 60 words each.
- Return valid JSON only with these exact keys:
  verdict, overall_feedback, strengths (array of 2 strings), weaknesses (array of 2 strings), study_focus (string: 1 concrete topic to practise), score (integer 1-10)`;

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Authentication required.' }, 401);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return json({ error: 'Authentication required.' }, 401);

  const now    = Date.now();
  const recent = (requests.get(user.id) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return json({ error: 'Please wait 2 minutes before another debrief.' }, 429);
  recent.push(now);
  requests.set(user.id, recent);

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return json({ error: 'AI has not been configured yet.' }, 503);
  }

  const { answers, topic, totalTime } = await request.json();
  if (!answers || !Array.isArray(answers)) return json({ error: 'Missing answers.' }, 400);

  const transcript = answers.map((a, i) =>
    `Q${i + 1}: ${a.question}\nCandidate answered: "${a.selectedAnswer}" (${a.isCorrect ? 'CORRECT' : 'WRONG'}, correct was: "${a.correctAnswer}")`
  ).join('\n\n');

  const userMessage = `Topic: ${topic}\nTime taken: ${totalTime} seconds\n\nInterview transcript:\n${transcript}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      temperature: 0.3,
      max_tokens: 600,
      messages: [
        { role: 'system', content: DEBRIEF_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) return json({ error: 'AI debrief service is unavailable.' }, 502);

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content?.trim() || '';

  try {
    const cleaned = content.replace(/```json|```/g, '').trim();
    return json({ debrief: JSON.parse(cleaned) });
  } catch {
    return json({ error: 'AI returned an invalid debrief. Please try again.' }, 502);
  }
}
