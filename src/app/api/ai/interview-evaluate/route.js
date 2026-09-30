import { NextResponse } from 'next/server';

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'replace_with_your_groq_api_key') {
    return json({ error: 'AI not configured.' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const { problem = {}, code = '', transcript = [], durationSeconds = 0, topic = 'dsa' } = body;

  const conversationSummary = transcript
    .map(t => `${t.role === 'user' ? 'Candidate' : 'Interviewer Alex'}: ${t.content}`)
    .join('\n');

  const systemPrompt = `You are a Principal Engineering Director calibrating a technical coding interview.

Analyze the candidate's interview session and code submission. You must respond ONLY with a valid JSON object (no markdown fences, no raw text outside JSON).

EVALUATION RUBRIC:
1. problemSolving (0-100): Did they grasp constraints, handle edge cases, and devise a valid algorithmic logic?
2. codeQuality (0-100): Clean variable naming, idiomatic syntax, modularity, and structure.
3. complexity (0-100): Did they reach the target optimal time and space complexity?
4. communication (0-100): Did they ask clarifying questions, explain their trade-offs, and respond well to hints?

VERDICT RULES:
- "strong_hire": overallScore >= 88 with optimal solution and great communication
- "hire": overallScore >= 74 with correct optimal/near-optimal solution
- "lean_hire": overallScore >= 62 with working solution but suboptimal complexity or minor flaws
- "lean_no": overallScore >= 45 with partial or brute-force solution with gaps
- "no_hire": overallScore < 45 with incomplete code or fundamental misconceptions

JSON FORMAT REQUIREMENT:
{
  "overallScore": 82,
  "verdict": "hire",
  "rubricScores": {
    "problemSolving": 85,
    "codeQuality": 80,
    "complexity": 80,
    "communication": 85
  },
  "summary": "Concise 2-sentence summary of interview performance.",
  "strengths": ["Clear communication of time complexity upfront", "Clean handling of empty input edge case"],
  "improvements": ["Could avoid auxiliary space by doing an in-place traversal", "Remember to validate index bounds"],
  "codeReview": "Specific feedback on their written code snippet."
}`;

  const userPrompt = `PROBLEM:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Expected Time: ${problem.expectedTime || 'O(n)'}
Expected Space: ${problem.expectedSpace || 'O(1)'}

DURATION TAKEN: ${Math.round(durationSeconds / 60)} minutes

CANDIDATE'S WRITTEN CODE:
\`\`\`
${code || '(No code submitted)'}
\`\`\`

CONVERSATION TRANSCRIPT:
${conversationSummary.slice(0, 3500) || '(No conversation)'}`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      return json({ error: 'Interview evaluation AI unavailable.' }, 502);
    }

    const data = await groqRes.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '{}';
    const parsed = JSON.parse(rawContent);

    return json({ evaluation: parsed });
  } catch (err) {
    return json({ error: 'Failed to generate interview evaluation.' }, 500);
  }
}
