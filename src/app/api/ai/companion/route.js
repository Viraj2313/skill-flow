import { NextResponse } from 'next/server';

const WINDOW_MS    = 60_000;
const MAX_REQUESTS = 20;
const requests     = new Map();

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function buildSystem(topic) {
  return `You are Alex, an expert DSA and technical interview coach embedded in AlgoQuest, a coding interview prep app.

CONTEXT: The user is currently studying "${topic}".

PERSONALITY:
- Sharp, direct, no filler words
- Genuinely helpful — you make people better, not just feel good
- Conversational but precise
- You use code ONLY when it adds real clarity (short inline snippets, not blocks)

RESPONSE RULES:
- Keep responses to 3–5 sentences MAX (unless the user explicitly asks for more)
- Never start with "Great question!" or any affirmation fluff
- When asked to quiz: give ONE sharp interview-style question. Wait for the answer before explaining.
- When asked about common mistakes: list exactly 3, numbered, specific and honest
- When asked to explain differently: use an analogy, mental model, or story — not the same definition rephrased
- When asked for interview tips: give 3 actionable bullets — what to say, what to avoid
- If someone's off-topic, answer briefly then gently redirect to ${topic}
- Plain text only — no markdown headers, no bold, no bullet symbols (use "1." "2." "3." for lists)

You are not a generic chatbot. You are a specialist focused on making this user genuinely expert in ${topic}.`;
}

export async function POST(request) {
  const now = Date.now();

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return json({ error: 'AI not configured.' }, 503);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid request.' }, 400); }

  const { message, topic = 'DSA & CS Fundamentals', history = [], userId } = body;
  if (!message?.trim()) return json({ error: 'Message required.' }, 400);

  // Simple rate limit per userId (or IP fallback)
  const key = userId || request.headers.get('x-forwarded-for') || 'anon';
  const recent = (requests.get(key) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return json({ error: 'Slow down — you\'re sending messages too fast.' }, 429);
  recent.push(now);
  requests.set(key, recent);

  // Keep last 6 turns (3 exchanges) of history
  const trimmedHistory = (Array.isArray(history) ? history : []).slice(-6).map(m => ({
    role:    m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content || '').slice(0, 1000),
  }));

  const messages = [
    { role: 'system', content: buildSystem(topic) },
    ...trimmedHistory,
    { role: 'user',   content: message.slice(0, 2000) },
  ];

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      messages,
      temperature: 0.72,
      max_tokens:  350,
    }),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text().catch(() => '');
    console.error('Groq error:', groqRes.status, err);
    return json({ error: 'AI request failed.' }, 502);
  }

  const data = await groqRes.json();
  const reply = data.choices?.[0]?.message?.content?.trim() || 'No response.';
  return json({ reply });
}
