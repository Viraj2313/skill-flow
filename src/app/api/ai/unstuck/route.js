import { NextResponse } from 'next/server';

const STEP_LABELS = [
  'Restate the problem in your own words',
  'Write a concrete example',
  'State the brute-force approach',
  'Identify the bottleneck and what to improve',
  'Connect to a known pattern or algorithm',
];

export async function POST(req) {
  const { problem, steps } = await req.json();
  if (!problem || !steps || steps.length !== 5) {
    return NextResponse.json({ error: 'Missing problem or steps.' }, { status: 400 });
  }
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
  }

  const stepsText = STEP_LABELS.map((label, i) => `Step ${i + 1} (${label}): "${steps[i] || '[left blank]'}"`).join('\n');

  const prompt = `You are a senior engineer coaching a candidate on their problem-solving process.

Problem: "${problem}"

The candidate practiced the Unstuck Protocol. Their responses:
${stepsText}

Grade each step 1-3 (3 = strong, 2 = needs work, 1 = missing or off). Give one sentence of honest, specific feedback per step. End with a 1-2 sentence overall assessment.

Respond ONLY with valid JSON in this exact format with no extra text:
{"steps":[{"grade":3,"feedback":"..."},{"grade":2,"feedback":"..."},{"grade":1,"feedback":"..."},{"grade":2,"feedback":"..."},{"grade":3,"feedback":"..."}],"overall":"..."}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) return NextResponse.json({ error: 'AI service unavailable.' }, { status: 502 });
  const payload = await response.json();
  let raw = payload.choices?.[0]?.message?.content?.trim() || '';
  raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: 'AI returned malformed response.' }, { status: 502 });
  }
}
