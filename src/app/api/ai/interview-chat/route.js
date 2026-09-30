import { NextResponse } from 'next/server';

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

function buildSystemPrompt(problem, code, phase) {
  return `You are Alex, an elite Principal Staff Engineer and Senior Technical Interviewer conducting a realistic live coding interview.

PROBLEM CURRENTLY BEING SOLVED:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Optimal Time Complexity: ${problem.expectedTime || 'O(n)'}
Optimal Space Complexity: ${problem.expectedSpace || 'O(1) or O(n)'}

CANDIDATE'S CURRENT CODE:
\`\`\`
${code || '(No code written yet)'}
\`\`\`

CURRENT INTERVIEW PHASE: ${phase}

YOUR GOAL & PERSONA:
- Realistic, sharp, encouraging yet demanding senior interviewer.
- DO NOT just hand out the answer or code. Guide with Socratic questions, edge case checks, or subtle hints.
- If the candidate asks clarifying questions, answer like an interviewer (e.g. "Good question — yes, the input array can contain negative numbers", "No, assume it fits in memory").
- If the candidate explains an approach, assess whether it's brute force or optimal, and challenge them on time/space trade-offs.
- If the candidate asks for a hint, give a tiered hint that pushes them to think about data structures (hash maps, pointers, binary search, etc.) without revealing the whole algorithm.
- Keep responses concise (2 to 4 sentences). Speak conversationally and directly. Never say "Great job!" or fake corporate platitudes.`;
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

  const { message, problem = {}, code = '', phase = 'approach', history = [] } = body;
  if (!message?.trim()) {
    return json({ error: 'Message required.' }, 400);
  }

  const trimmedHistory = (Array.isArray(history) ? history : []).slice(-8).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content || '').slice(0, 1500),
  }));

  const messages = [
    { role: 'system', content: buildSystemPrompt(problem, code, phase) },
    ...trimmedHistory,
    { role: 'user', content: message.slice(0, 2000) },
  ];

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages,
        temperature: 0.65,
        max_tokens: 400,
      }),
    });

    if (!groqRes.ok) {
      return json({ error: 'Interviewer AI unavailable.' }, 502);
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Let us continue with the problem. How are you approaching this?';
    return json({ reply });
  } catch (err) {
    return json({ error: 'Internal interview error.' }, 500);
  }
}
