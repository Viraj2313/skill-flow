import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const WINDOW_MS    = 60_000;
const MAX_REQUESTS = 8;
const requests     = new Map();

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

const SYSTEM_PROMPT = `You are a gifted programming teacher. A student is struggling to understand a concept and has asked you to explain it differently.

Rules:
- Use a completely different analogy than the one in the original explanation.
- Be concrete and vivid. Real-world analogies work best.
- Keep it under 80 words.
- End with one short sentence that crystallises the core insight.
- Plain text only. No markdown, no bullet points, no headers.`;

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
  if (recent.length >= MAX_REQUESTS) return json({ error: 'Please wait a minute.' }, 429);
  recent.push(now);
  requests.set(user.id, recent);

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return json({ error: 'AI has not been configured yet.' }, 503);
  }

  const { heading, body } = await request.json();
  if (!heading || !body) return json({ error: 'Missing concept content.' }, 400);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 180,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Concept: "${heading}"\n\nOriginal explanation: "${body}"\n\nExplain this differently using a new analogy.` },
      ],
    }),
  });

  if (!response.ok) return json({ error: 'AI service is unavailable.' }, 502);

  const payload    = await response.json();
  const alternative = payload.choices?.[0]?.message?.content?.trim() || '';

  if (!alternative) return json({ error: 'AI returned an empty response.' }, 502);

  return json({ alternative });
}
