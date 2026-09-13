'use client';

import { useState } from 'react';
import Link from 'next/link';

const STEPS = [
  {
    n: 1,
    label: 'Restate the problem',
    icon: 'edit_note',
    color: '#6366f1',
    prompt: 'Write the problem in your own words in one sentence. Don\'t copy the original.',
    why: 'Forces grounding. Your brain stops panicking and starts understanding.',
  },
  {
    n: 2,
    label: 'Write a concrete example',
    icon: 'data_array',
    color: '#0891b2',
    prompt: 'Make up a small input (3–4 elements) and write what the output should be.',
    why: 'Moves you from abstract to concrete. Unblocks visual thinkers immediately.',
  },
  {
    n: 3,
    label: 'State the brute force',
    icon: 'bolt',
    color: '#d97706',
    prompt: 'Describe the O(n²) or obvious naive solution, even if it\'s terrible.',
    why: 'Interviewers respect candidates who can reason incrementally. Never start with silence.',
  },
  {
    n: 4,
    label: 'Identify the bottleneck',
    icon: 'speed',
    color: '#dc2626',
    prompt: 'What\'s the slowest part of your brute force? What if you could skip or precompute it?',
    why: 'Most optimal solutions eliminate one bottleneck from brute force. This is the key insight step.',
  },
  {
    n: 5,
    label: 'Connect to a known pattern',
    icon: 'hub',
    color: '#059669',
    prompt: 'Does this resemble Two Pointer, BFS, DP, Hash Map, Binary Search, or Sliding Window?',
    why: 'Pattern recognition is learnable. Ask yourself which technique eliminates the bottleneck.',
  },
];

const PRACTICE_PROBLEMS = [
  {
    id: 'p1',
    title: 'Pair Sum',
    statement: 'Given an unsorted array of integers and a target, find all unique pairs that sum to the target. Return an array of [index1, index2] pairs.',
    difficulty: 'easy',
  },
  {
    id: 'p2',
    title: 'Cycle Detection',
    statement: 'Given the head of a linked list, determine if the list contains a cycle. Return true if it does, false otherwise.',
    difficulty: 'medium',
  },
  {
    id: 'p3',
    title: 'Longest Substring Without Repeating Characters',
    statement: 'Given a string, find the length of the longest substring that contains no repeated characters.',
    difficulty: 'medium',
  },
  {
    id: 'p4',
    title: 'Max Depth of Binary Tree',
    statement: 'Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from root to a leaf.',
    difficulty: 'easy',
  },
];

const GRADE_CONFIG = {
  3: { label: 'Strong',       color: '#059669', bg: '#f0fdf4', border: '#86efac' },
  2: { label: 'Needs work',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  1: { label: 'Missing',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export default function UnstuckPage() {
  const [mode, setMode]         = useState('learn');
  const [problemIdx, setProblemIdx] = useState(0);
  const [inputs, setInputs]     = useState(['', '', '', '', '']);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const problem = PRACTICE_PROBLEMS[problemIdx];

  function setInput(i, val) {
    setInputs(prev => { const n = [...prev]; n[i] = val; return n; });
  }

  async function handleGetFeedback() {
    const filled = inputs.filter(s => s.trim().length > 0).length;
    if (filled < 3) { setError('Fill in at least 3 steps before getting feedback.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/unstuck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: problem.statement, steps: inputs }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); } else { setResult(data); }
    } catch {
      setError('Could not reach AI. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleNewProblem() {
    setProblemIdx(i => (i + 1) % PRACTICE_PROBLEMS.length);
    setInputs(['', '', '', '', '']);
    setResult(null);
    setError('');
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="py-6 border-b border-slate-200/80 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Mindset Training</p>
            <h1 className="font-sans font-bold text-[22px] text-slate-900 mt-0.5">The Unstuck Protocol</h1>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {['learn', 'practice'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-widest uppercase transition-all"
                style={{
                  background: mode === m ? 'white' : 'transparent',
                  color:      mode === m ? '#374151' : '#94a3b8',
                  boxShadow:  mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <p className="font-sans text-[14px] text-slate-500 mt-2">
          5 steps to run when your mind goes blank in an interview. Memorise them until they're automatic.
        </p>
      </div>

      {mode === 'learn' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
            <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-amber-700 mb-1">The situation</p>
            <p className="font-sans text-[14px] text-amber-900 leading-relaxed">
              You read the problem. Silence. Your interviewer is waiting. Your mind is blank. You know this material — so what do you do?
            </p>
            <p className="font-sans text-[14px] font-bold text-amber-900 mt-2">You run the protocol. In order. Out loud.</p>
          </div>

          {STEPS.map((step, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border-2 bg-white"
              style={{ borderColor: step.color + '30' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: step.color + '15' }}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ color: step.color }}>{step.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: step.color }}>Step {step.n}</span>
                  </div>
                  <p className="font-sans font-bold text-[16px] text-slate-900 mb-1">{step.label}</p>
                  <p className="font-sans text-[14px] text-slate-600 mb-2 italic">"{step.prompt}"</p>
                  <div className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-slate-400 mt-0.5">lightbulb</span>
                    <p className="font-sans text-[12px] text-slate-500">{step.why}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-8 p-5 rounded-2xl bg-slate-900 text-white">
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">Quick Reference Card</p>
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-mono text-[11px] font-bold w-5 shrink-0" style={{ color: s.color }}>{s.n}.</span>
                  <span className="font-sans text-[14px] text-slate-200">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-slate-500 mt-4">Say each step out loud. Silence is the enemy.</p>
          </div>

          <button
            onClick={() => setMode('practice')}
            className="w-full py-4 rounded-2xl font-mono text-[12px] font-bold tracking-widest uppercase text-white mt-4"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            Practice It Now →
          </button>
        </div>
      )}

      {mode === 'practice' && (
        <div>
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-white mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-slate-400">Problem</span>
                <span
                  className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: problem.difficulty === 'easy' ? '#dcfce7' : '#fef3c7',
                    color:      problem.difficulty === 'easy' ? '#15803d' : '#92400e',
                  }}
                >
                  {problem.difficulty}
                </span>
              </div>
              <button onClick={handleNewProblem} className="font-mono text-[10px] text-indigo-500 hover:text-indigo-700 tracking-widest uppercase">Next →</button>
            </div>
            <p className="font-sans font-bold text-[17px] text-slate-900 mb-1">{problem.title}</p>
            <p className="font-sans text-[14px] text-slate-600 leading-relaxed">{problem.statement}</p>
          </div>

          <div className="space-y-4 mb-6">
            {STEPS.map((step, i) => {
              const stepResult = result?.steps?.[i];
              const gc = stepResult ? GRADE_CONFIG[stepResult.grade] : null;
              return (
                <div
                  key={i}
                  className="rounded-2xl border-2 overflow-hidden transition-all"
                  style={{ borderColor: inputs[i].trim() ? step.color + '40' : '#e2e8f0' }}
                >
                  <div className="flex items-center gap-3 px-4 py-3" style={{ background: step.color + '08' }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: step.color }}>{step.icon}</span>
                    <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: step.color }}>Step {step.n}: {step.label}</span>
                    {gc && (
                      <span className="ml-auto font-mono text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: gc.bg, color: gc.color, border: `1px solid ${gc.border}` }}>
                        {gc.label}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-sans text-[12px] text-slate-400 mb-2 italic">{step.prompt}</p>
                    <textarea
                      value={inputs[i]}
                      onChange={e => setInput(i, e.target.value)}
                      disabled={!!result}
                      rows={2}
                      placeholder="Type your answer..."
                      className="w-full font-sans text-[14px] text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-indigo-300 transition-colors placeholder:text-slate-300 disabled:opacity-60"
                    />
                    {gc && (
                      <p className="font-sans text-[13px] mt-2 leading-relaxed" style={{ color: gc.color }}>
                        {stepResult.feedback}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {result?.overall && (
            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 mb-5">
              <p className="font-mono text-[10px] font-bold tracking-widest uppercase text-indigo-600 mb-2">Overall Feedback</p>
              <p className="font-sans text-[14px] text-indigo-900 leading-relaxed">{result.overall}</p>
            </div>
          )}

          {error && (
            <p className="font-sans text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>
          )}

          {!result ? (
            <button
              onClick={handleGetFeedback}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-mono text-[12px] font-bold tracking-widest uppercase text-white transition-all"
              style={{ background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {loading ? 'Analysing your thinking…' : 'Get AI Feedback →'}
            </button>
          ) : (
            <button
              onClick={handleNewProblem}
              className="w-full py-4 rounded-2xl font-mono text-[12px] font-bold tracking-widest uppercase text-white"
              style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
            >
              Try Another Problem →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
