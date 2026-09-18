'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DECONSTRUCT_PROBLEMS } from '@/data/deconstructProblems';
import { savePracticeResult } from '@/lib/db';

const GRADE_CFG = {
  3: { label: 'Correct',   color: '#059669', bg: '#f0fdf4', border: '#86efac' },
  2: { label: 'Close',     color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  1: { label: 'Rethink',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const TYPE_ICONS = {
  insight:   { icon: 'lightbulb',   color: '#7c3aed', label: 'Key Insight'     },
  invariant: { icon: 'loop',        color: '#0891b2', label: 'Loop Invariant'  },
  break:     { icon: 'bug_report',  color: '#dc2626', label: 'Break It'        },
};

const DIFF_COLORS = { easy: '#059669', medium: '#d97706', hard: '#dc2626' };
const DIFF_BG     = { easy: '#dcfce7', medium: '#fef3c7', hard: '#fee2e2' };

function CodeBlock({ code }) {
  const lines = code.trim().split('\n');
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="font-mono text-[10px] text-slate-400 ml-2">solution.py</span>
      </div>
      <div className="overflow-x-auto p-4">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="font-mono text-[12px] text-slate-600 w-5 shrink-0 select-none text-right">{i + 1}</span>
            <span className="font-mono text-[13px] text-slate-200 whitespace-pre">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DeconstructPage() {
  const [probIdx, setProbIdx]     = useState(0);
  const [answers, setAnswers]     = useState(['', '', '']);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [codeVisible, setCodeVisible] = useState(true);

  const prob = DECONSTRUCT_PROBLEMS[probIdx];

  function setAnswer(i, val) {
    setAnswers(prev => { const n = [...prev]; n[i] = val; return n; });
  }

  function nextProblem() {
    setProbIdx(i => (i + 1) % DECONSTRUCT_PROBLEMS.length);
    setAnswers(['', '', '']);
    setResult(null);
    setError('');
  }

  async function handleAnalyse() {
    const filled = answers.filter(a => a.trim().length > 0).length;
    if (filled < 2) { setError('Answer at least 2 questions before getting feedback.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:     prob.title,
          concept:   prob.concept,
          code:      prob.code,
          questions: prob.questions,
          answers,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
      const correct = (data.feedback || []).filter(f => f.grade === 3).length;
      savePracticeResult({ mode: 'deconstruct', correct, total: prob.questions.length }).catch(() => {});
    } catch {
      setError('Could not reach AI. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const totalScore = result?.feedback ? result.feedback.reduce((s, f) => s + f.grade, 0) : 0;
  const maxScore   = prob.questions.length * 3;

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      <div className="py-6 border-b border-slate-200/80 mb-6">
        <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Deep Understanding</p>
        <h1 className="font-sans font-bold text-[22px] text-slate-900 mt-0.5 mb-1">Problem Deconstruction</h1>
        <p className="font-sans text-[14px] text-slate-500">
          Don't just recognise patterns — understand WHY they work. Read the solution, then answer 3 deep questions.
        </p>
      </div>

      <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: DIFF_BG[prob.difficulty], color: DIFF_COLORS[prob.difficulty] }}
            >
              {prob.difficulty}
            </span>
            <span className="font-mono text-[9px] font-bold text-slate-400 tracking-widest uppercase">{prob.concept}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400">{probIdx + 1}/{DECONSTRUCT_PROBLEMS.length}</span>
            {result && (
              <button onClick={nextProblem} className="font-mono text-[10px] text-indigo-500 hover:text-indigo-700 tracking-widest uppercase">Next →</button>
            )}
          </div>
        </div>
        <p className="font-sans font-bold text-[18px] text-slate-900">{prob.title}</p>
        <p className="font-sans text-[13px] text-slate-500 mt-1 mb-4">{prob.intro}</p>

        <button
          onClick={() => setCodeVisible(v => !v)}
          className="flex items-center gap-1.5 mb-3 font-mono text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-slate-700"
        >
          <span className="material-symbols-outlined text-[14px]">{codeVisible ? 'expand_less' : 'code'}</span>
          {codeVisible ? 'Hide code' : 'Show code'}
        </button>

        {codeVisible && <CodeBlock code={prob.code} />}
      </div>

      {result && (
        <div
          className="p-4 rounded-2xl border-2 mb-5 text-center"
          style={{
            borderColor: totalScore >= maxScore * 0.8 ? '#86efac' : totalScore >= maxScore * 0.5 ? '#fde68a' : '#fecaca',
            background:  totalScore >= maxScore * 0.8 ? '#f0fdf4' : totalScore >= maxScore * 0.5 ? '#fffbeb' : '#fef2f2',
          }}
        >
          <p className="text-[32px] mb-1">{totalScore >= maxScore * 0.8 ? '🔥' : totalScore >= maxScore * 0.5 ? '👍' : '📚'}</p>
          <p className="font-mono font-bold text-[24px] text-slate-900">{totalScore} / {maxScore}</p>
          <p className="font-sans text-[13px] text-slate-600 mt-1">{result.overall}</p>
        </div>
      )}

      <div className="space-y-4 mb-5">
        {prob.questions.map((q, i) => {
          const typeInfo = TYPE_ICONS[q.type] || { icon: 'help', color: '#94a3b8', label: q.type };
          const fb = result?.feedback?.[i];
          const gc = fb ? GRADE_CFG[fb.grade] : null;
          return (
            <div
              key={q.id}
              className="rounded-2xl border-2 overflow-hidden transition-all"
              style={{ borderColor: gc ? gc.border : answers[i].trim() ? typeInfo.color + '40' : '#e2e8f0' }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: typeInfo.color + '08' }}>
                <span className="material-symbols-outlined text-[15px]" style={{ color: typeInfo.color }}>{typeInfo.icon}</span>
                <span className="font-mono text-[9px] font-bold tracking-widest uppercase flex-1" style={{ color: typeInfo.color }}>
                  Q{i + 1}: {typeInfo.label}
                </span>
                {gc && (
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: gc.bg, color: gc.color, border: `1px solid ${gc.border}` }}>
                    {gc.label}
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="font-sans text-[14px] text-slate-700 leading-relaxed mb-3">{q.prompt}</p>
                <textarea
                  value={answers[i]}
                  onChange={e => setAnswer(i, e.target.value)}
                  disabled={!!result}
                  rows={3}
                  placeholder="Write your reasoning here..."
                  className="w-full font-sans text-[14px] text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-indigo-300 transition-colors placeholder:text-slate-300 disabled:opacity-60"
                />
                {fb && (
                  <p className="font-sans text-[13px] mt-2 leading-relaxed" style={{ color: gc.color }}>
                    {fb.response}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="font-sans text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      {!result ? (
        <button
          onClick={handleAnalyse}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-mono text-[12px] font-bold tracking-widest uppercase text-white"
          style={{ background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          {loading ? 'Analysing your reasoning…' : 'Analyse My Reasoning →'}
        </button>
      ) : (
        <button
          onClick={nextProblem}
          className="w-full py-4 rounded-2xl font-mono text-[12px] font-bold tracking-widest uppercase text-white"
          style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
        >
          Next Problem →
        </button>
      )}
    </div>
  );
}
