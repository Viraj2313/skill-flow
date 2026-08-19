import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const requests = new Map();

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Authentication required.' }, 401);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return json({ error: 'Authentication required.' }, 401);

  const now = Date.now();
  const recent = (requests.get(user.id) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return json({ error: 'Please wait a minute before requesting another review.' }, 429);
  recent.push(now);
  requests.set(user.id, recent);

  const { code, language, problem } = await request.json();
  if (!code || typeof code !== 'string' || code.length > 20_000) return json({ error: 'Provide code up to 20,000 characters.' }, 400);
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') return json({ error: 'Groq has not been configured yet.' }, 503);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: 'system', content: 'You are a concise, encouraging programming coach. Return valid JSON only with keys summary, time_complexity, space_complexity, suggestions. Suggestions must be an array of at most three short strings.' },
        { role: 'user', content: JSON.stringify({ problem, language, code }) },
      ],
    }),
  });

  if (!response.ok) return json({ error: 'The AI review service is unavailable.' }, 502);
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content || '';
  try {
    return json({ review: JSON.parse(content) });
  } catch {
    return json({ error: 'The AI returned an invalid review. Please try again.' }, 502);
  }
}
