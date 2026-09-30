import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const WINDOW_MS   = 60_000;
const MAX_REQUESTS = 5;
const requests    = new Map();

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

const SYSTEM_PROMPT = `You are a senior software engineer at a top tech company conducting a technical interview. 
Your job is to give sharp, honest, actionable feedback on a candidate's answer to a conceptual question.

Rules:
- Be direct but encouraging. Not harsh, not fluffy.
- If wrong: explain WHY it's wrong, what the correct reasoning is, and what an interviewer would actually be thinking.
- If correct: acknowledge it, then push further — mention a follow-up question or edge case a real interviewer would raise next.
- Always end with one concrete thing to remember or practise.
- Keep it under 120 words.
- No bullet points. Write in natural sentences like you're actually talking to the candidate.
- Return valid JSON only with keys: verdict ("correct"|"wrong"|"partial"), feedback (string), follow_up (string, one short question the interviewer would ask next).`;

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
  if (recent.length >= MAX_REQUESTS) return json({ error: 'Please wait a minute before requesting another review.' }, 429);
  recent.push(now);
  requests.set(user.id, recent);

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return json({ error: 'AI review has not been configured yet.' }, 503);
  }

  const body = await request.json();
  const { question, selectedAnswer, correctAnswer, isCorrect, lessonTitle } = body;

  const userMessage = JSON.stringify({ question, selectedAnswer, correctAnswer, isCorrect, lessonTitle });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      temperature: 0.35,
      max_tokens: 350,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) return json({ error: 'AI review service is unavailable.' }, 502);

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || '';

  try {
    const cleaned = content.replace(/```json|```/g, '').trim();
    return json({ review: JSON.parse(cleaned) });
  } catch {
    return json({ error: 'AI returned an invalid response. Please try again.' }, 502);
  }
}
