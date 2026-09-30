import { NextResponse } from 'next/server';

const ANGLE_SYSTEM = `You are a gifted programming teacher. Explain concepts clearly and memorably. Plain text only — no markdown, no bullet points, no headers.`;

const ANGLE_PROMPTS = {
  analogy:   'Give a memorable real-world analogy for this concept. No code. 3-4 sentences. Make it visual and concrete — something the reader will remember tomorrow.',
  visual:    'Describe exactly how you would draw this on a whiteboard. Be specific: shapes, arrows, labels. Walk through the diagram step by step as if explaining to someone watching you draw. 4-6 sentences.',
  derive:    'Lead the reader to derive this concept from first principles through questions and reasoning. Walk them to the insight so they feel they discovered it themselves. 4-6 sentences. No code.',
  interview: 'Frame this as an interviewer would. What core question are they really testing? What key phrase do they want to hear? What common mistake do candidates make? 3-5 sentences, direct and practical.',
};

export async function POST(req) {
  const { heading, body, angle } = await req.json();
  if (!heading || !body || !angle) {
    return NextResponse.json({ error: 'Missing heading, body, or angle.' }, { status: 400 });
  }
  const task = ANGLE_PROMPTS[angle];
  if (!task) {
    return NextResponse.json({ error: 'Unknown angle type.' }, { status: 400 });
  }
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      temperature: 0.65,
      max_tokens: 200,
      messages: [
        { role: 'system', content: ANGLE_SYSTEM },
        { role: 'user', content: `Concept heading: "${heading}"\nConcept body: "${body}"\n\nTask: ${task}` },
      ],
    }),
  });

  if (!response.ok) return NextResponse.json({ error: 'AI service unavailable.' }, { status: 502 });
  const payload = await response.json();
  const text = payload.choices?.[0]?.message?.content?.trim() || '';
  if (!text) return NextResponse.json({ error: 'AI returned empty response.' }, { status: 502 });
  return NextResponse.json({ text });
}
