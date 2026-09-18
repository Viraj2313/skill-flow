import { NextResponse } from 'next/server';

const SYSTEM = `You are a Socratic programming teacher. You never give answers directly. You ask pointed questions that lead students to discover insights themselves. Keep responses concise — 2-3 sentences max. Plain text only.`;

export async function POST(req) {
  const { mode, heading, body, questions, questionIndex, userAnswer } = await req.json();

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
  }

  if (mode === 'generate') {
    if (!heading || !body) return NextResponse.json({ error: 'Missing heading or body.' }, { status: 400 });

    const prompt = `A student is about to learn this programming concept:
Heading: "${heading}"
Explanation: "${body}"

Generate 3 Socratic questions that lead them to DISCOVER this concept themselves — without ever stating the answer.

Rules:
- Question 1: Start with something they definitely know (concrete, everyday)
- Question 2: Bridge toward the technical insight
- Question 3: The "aha" — they should arrive at the concept on their own

Questions must be short (one sentence each), conversational, and genuinely lead to the concept.

Return ONLY valid JSON: {"questions":["...","...","..."]}`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.6,
        max_tokens: 300,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'AI service unavailable.' }, { status: 502 });
    const payload = await res.json();
    let raw = payload.choices?.[0]?.message?.content?.trim() || '';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      return NextResponse.json(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: 'AI returned malformed response.' }, { status: 502 });
    }
  }

  if (mode === 'respond') {
    if (!heading || !body || !questions || questionIndex === undefined || !userAnswer) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const isLast = questionIndex === questions.length - 1;
    const question = questions[questionIndex];

    const prompt = `Concept the student is discovering:
Heading: "${heading}"
Body: "${body}"

Socratic question asked: "${question}"
Student's answer: "${userAnswer}"

Respond as a Socratic teacher:
- If they're right or close: affirm specifically what's correct (1 sentence), then either ask a natural follow-up OR (if last question) say "Exactly — you've just worked out the core idea."
- If they're off: don't reveal the answer. Ask one short redirecting question that nudges them toward the insight.
- Never state the full concept outright.
- ${isLast ? 'This is the LAST question. If they got it right, confirm warmly and tell them they can now read the full explanation.' : 'Keep it brief — this leads to the next question.'}

2-3 sentences max. Conversational, encouraging, precise.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 150,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'AI service unavailable.' }, { status: 502 });
    const payload = await res.json();
    const response = payload.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ response });
  }

  return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 });
}
