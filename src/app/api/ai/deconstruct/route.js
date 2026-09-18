import { NextResponse } from 'next/server';

export async function POST(req) {
  const { title, concept, code, questions, answers } = await req.json();

  if (!title || !code || !questions?.length || !answers?.length) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return NextResponse.json({ error: 'AI not configured.' }, { status: 503 });
  }

  const TYPE_LABELS = {
    insight:   'Key Insight',
    invariant: 'Loop Invariant',
    break:     'Break It',
    assumption: 'Assumption',
  };

  const questionBlock = questions.map((q, i) => {
    const type = TYPE_LABELS[q.type] || q.type;
    return `Question ${i + 1} [${type}]: ${q.prompt}\nCandidate's answer: "${answers[i] || '[left blank]'}"`;
  }).join('\n\n');

  const prompt = `You are a senior engineer evaluating a candidate's deep understanding of an algorithm.

Problem: "${title}" (${concept})

Code:
\`\`\`
${code}
\`\`\`

${questionBlock}

For each answer, grade it 1–3:
- 3 = Correct, specific, shows genuine understanding
- 2 = Partially right — missing a key detail or slightly imprecise
- 1 = Incorrect, vague, or left blank

Give ONE concrete sentence of feedback per answer. Be direct and specific — say what's right or wrong about their reasoning.
End with a 1–2 sentence overall assessment focused on the quality of their reasoning, not just correctness.

Return ONLY valid JSON, no extra text:
{"feedback":[{"grade":3,"response":"..."},{"grade":2,"response":"..."},{"grade":1,"response":"..."}],"overall":"..."}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
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
