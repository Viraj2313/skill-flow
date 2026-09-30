import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

const SYSTEM_PROMPT = `You are a junior developer who genuinely doesn't understand a concept yet. The user is trying to explain it to you.

Your job:
- Read their explanation carefully.
- Respond as a confused but curious junior: ask ONE specific follow-up question about something they left vague, skipped, or got slightly wrong.
- If their explanation is complete and correct, tell them so enthusiastically and ask one extension question (an edge case or "what if" that goes slightly deeper).
- If their explanation has a factual error, gently point out you're confused by that part and ask them to clarify.
- Keep your response short: 2-4 sentences max.
- Never give the answer yourself. Only probe with questions.
- End every response with a score out of 10 for clarity and accuracy in this format on a new line: Score: X/10

Be warm, not intimidating. You're a junior dev, not an interviewer.`;

export async function POST(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) return json({ error: 'Unauthorised' }, 401);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return json({ error: 'Unauthorised' }, 401);

  const { concept, explanation, history } = await req.json();
  if (!concept || !explanation) return json({ error: 'Missing fields' }, 400);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(history || []),
    {
      role: 'user',
      content: `I want to explain: "${concept}"\n\nHere is my explanation:\n${explanation}`,
    },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages,
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!res.ok) return json({ error: 'AI unavailable' }, 502);
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || '';

  const scoreMatch = reply.match(/Score:\s*(\d+)\/10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
  const text = reply.replace(/Score:\s*\d+\/10/i, '').trim();

  return json({ reply: text, score });
}
