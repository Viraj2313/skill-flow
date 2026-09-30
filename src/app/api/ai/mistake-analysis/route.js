import { NextResponse } from 'next/server';

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { question, correctAnswer, explanation, topic } = body;
  if (!question) {
    return json({ error: 'Question is required.' }, 400);
  }

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return json({
      whyMistakeHappens: 'Candidates often rush into intuition without checking the specific edge condition or invariant that governs this problem.',
      howToAvoid: 'State the base conditions and constraints explicitly before selecting or writing your approach.',
      mentalAnchor: explanation ? explanation.slice(0, 160) : 'Always trace through a 3-element sample case before committing.',
    });
  }

  const prompt = `Analyze this DSA interview question that the student got wrong:
Question: ${question}
Correct Answer: ${correctAnswer || 'N/A'}
Topic: ${topic || 'DSA'}
Explanation: ${explanation || 'N/A'}

Provide a sharp, concise diagnosis in valid JSON format only:
{
  "whyMistakeHappens": "1-2 sentences on the exact conceptual misunderstanding or trap candidates fall into here.",
  "howToAvoid": "1 actionable interview heuristic or check to avoid making this error.",
  "mentalAnchor": "1 short rule of thumb or one-liner formula to remember."
}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'You are Alex, an expert DSA interview mentor. Output ONLY raw valid JSON with keys: whyMistakeHappens, howToAvoid, mentalAnchor. No markdown ticks, no preamble.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq returned ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return json({
      whyMistakeHappens: parsed.whyMistakeHappens || 'Commonly tripped up by edge case logic or index boundaries.',
      howToAvoid: parsed.howToAvoid || 'Trace with a small concrete test case before finalizing.',
      mentalAnchor: parsed.mentalAnchor || explanation || 'Remember the core invariant of the algorithm.',
    });
  } catch (err) {
    return json({
      whyMistakeHappens: 'Common misconception around pointer progression and boundary checks.',
      howToAvoid: 'Check loop termination conditions and step through one dry run.',
      mentalAnchor: explanation ? explanation.slice(0, 180) : 'Verify constraints and edge cases first.',
    });
  }
}
