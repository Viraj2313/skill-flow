'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COMPLEXITY_PROBLEMS, COMPLEXITY_OPTIONS } from '@/data/complexityProblems';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFF_COLOR = { easy: '#059669', medium: '#d97706', hard: '#dc2626' };

export default function ComplexityPage() {
  const [problems]          = useState(() => shuffle(COMPLEXITY_PROBLEMS));
  const [idx, setIdx]       = useState(0);
  const [phase, setPhase]   = useState('line');
  const [lineSelected, setLineSelected] = useState(null);
  const [complexity, setComplexity]     = useState(null);
  const [submitted, setSubmitted]       = useState(false);
  const [score, setScore]   = useState(0);
  const [results, setResults] = useState([]);
  const [done, setDone]     = useState(false);

  const prob = problems[idx];
  const lines = prob.code.split('\n');

  function handleLineClick(lineIdx) {
    if (submitted) return;
    setLineSelected(lineIdx);
    setPhase('complexity');
  }

  function handleSubmit() {
    if (complexity === null) return;
    const lineCorrect = lineSelected + 1 === prob.bottleneckLine;
    const bigOCorrect = complexity === prob.correct;
    const both = lineCorrect && bigOCorrect;
    if (both) setScore(s => s + 1);
    setResults(r => [...r, { prob, lineSelected, complexity, lineCorrect, bigOCorrect }]);
    setSubmitted(true);
  }

  function handleNext() {
    if (idx + 1 >= problems.length) { setDone(true); return; }
    setIdx(i => i + 1);
    setPhase('line');
    setLineSelected(null);
    setComplexity(null);
    setSubmitted(false);
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto pb-16 px-4">
        <div className="py-16 text-center">
          <p className="text-[56px] mb-4">{score >= 9 ? '🔥' : score >= 6 ? '👍' : '📚'}</p>
          <h2 className="font-sans font-black text-[32px] text-slate-900 mb-2">{score} / {problems.length}</h2>
          <p className="font-sans text-[15px] text-slate-500 mb-8">
            {score >= 9 ? 'Exceptional. You think like an engineer.' : score >= 6 ? 'Solid. Keep sharpening your analysis.' : 'Good start — revisit Big O fundamentals.'}
          </p>
          <div className="space-y-3 text-left mb-10">
            {results.map((r, i) => (
              <div key={i} className={`p-4 rounded-xl border ${r.lineCorrect && r.bigOCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-sans font-semibold text-[13px] text-slate-800">{r.prob.title}</p>
                  <span className="font-mono text-[11px] font-bold" style={{ color: r.lineCorrect && r.bigOCorrect ? '#059669' : '#dc2626' }}>
                    {r.lineCorrect && r.bigOCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-500">
                  Line: {r.lineCorrect ? '✓' : `✗ (expected line ${r.prob.bottleneckLine})`} · Big O: {r.bigOCorrect ? '✓' : `✗ (answer: ${COMPLEXITY_OPTIONS[r.prob.correct]})`}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setIdx(0); setPhase('line'); setLineSelected(null); setComplexity(null); setSubmitted(false); setScore(0); setResults([]); setDone(false); }}
              className="flex-1 py-3 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              Try Again
            </button>
            <Link href="/practice" className="flex-1 py-3 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-center border-2 border-slate-200 text-slate-600">
              Back to Practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lineOk  = submitted && lineSelected + 1 === prob.bottleneckLine;
  const bigOOk  = submitted && complexity === prob.correct;

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4">
      <div className="py-6 border-b border-slate-200/80 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Complexity Predictor</p>
            <h1 className="font-sans font-bold text-[20px] text-slate-900 mt-0.5">{prob.title}</h1>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] text-slate-400">{idx + 1} / {problems.length}</p>
            <p className="font-mono text-[13px] font-bold text-slate-700">{score} pts</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((idx) / problems.length) * 100}%` }} />
        </div>
      </div>

      <div
        className="p-4 rounded-xl mb-5 border"
        style={{ background: '#0f172a', borderColor: '#1e293b' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{ background: DIFF_COLOR[prob.difficulty] + '20', color: DIFF_COLOR[prob.difficulty] }}
          >
            {prob.difficulty}
          </span>
          {phase === 'line' && !submitted && (
            <span className="font-mono text-[10px] text-slate-400">👆 Click the line that dominates time complexity</span>
          )}
          {phase === 'complexity' && !submitted && (
            <span className="font-mono text-[10px] text-amber-400">Now pick the Big O below ↓</span>
          )}
        </div>

        <div className="font-mono text-[13px] leading-relaxed">
          {lines.map((line, i) => {
            const isSelected  = lineSelected === i;
            const isBottleneck = prob.bottleneckLine === i + 1;

            let bg = 'transparent';
            let color = '#94a3b8';
            let border = 'transparent';

            if (submitted) {
              if (isBottleneck) { bg = '#14532d40'; color = '#4ade80'; border = '#16a34a'; }
              else if (isSelected && !isBottleneck) { bg = '#7f1d1d40'; color = '#f87171'; border = '#dc2626'; }
            } else if (isSelected) {
              bg = '#312e8140'; color = '#a5b4fc'; border = '#6366f1';
            }

            return (
              <div
                key={i}
                onClick={() => !submitted && handleLineClick(i)}
                className="flex gap-3 px-3 py-1 rounded-lg transition-all"
                style={{
                  background:   bg,
                  borderLeft:   `3px solid ${border || 'transparent'}`,
                  cursor:       submitted ? 'default' : 'pointer',
                }}
              >
                <span className="text-slate-600 select-none w-4 shrink-0 text-right">{i + 1}</span>
                <span style={{ color, whiteSpace: 'pre' }}>{line}</span>
              </div>
            );
          })}
        </div>
      </div>

      {(phase === 'complexity' || submitted) && (
        <div className="mb-5">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
            Overall Time Complexity
          </p>
          <div className="flex flex-wrap gap-2">
            {COMPLEXITY_OPTIONS.map((opt, i) => {
              let bg = '#f8fafc', border = '#e2e8f0', color = '#374151';
              if (submitted) {
                if (i === prob.correct) { bg = '#dcfce7'; border = '#16a34a'; color = '#15803d'; }
                else if (i === complexity && complexity !== prob.correct) { bg = '#fee2e2'; border = '#dc2626'; color = '#dc2626'; }
              } else if (complexity === i) {
                bg = '#eef2ff'; border = '#6366f1'; color = '#4338ca';
              }
              return (
                <button
                  key={opt}
                  onClick={() => !submitted && setComplexity(i)}
                  disabled={submitted}
                  className="px-4 py-2 rounded-xl font-mono text-[13px] font-bold border-2 transition-all"
                  style={{ background: bg, borderColor: border, color }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {submitted ? (
        <div
          className="p-4 rounded-xl mb-5 border"
          style={{
            background: lineOk && bigOOk ? '#f0fdf4' : '#fff7ed',
            borderColor: lineOk && bigOOk ? '#86efac' : '#fed7aa',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[18px]">{lineOk && bigOOk ? '✅' : lineOk ? '⚠️' : '❌'}</span>
            <p className="font-sans font-bold text-[14px] text-slate-800">
              {lineOk && bigOOk ? 'Correct!' : !lineOk ? `Bottleneck is line ${prob.bottleneckLine}` : `Right line — but it's ${COMPLEXITY_OPTIONS[prob.correct]}`}
            </p>
          </div>
          <p className="font-sans text-[13px] text-slate-600 leading-relaxed">{prob.explanation}</p>
          <p className="font-mono text-[11px] text-slate-400 mt-2">Space: {prob.spaceComplexity}</p>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={complexity === null}
          className="w-full py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase text-white transition-all mb-4"
          style={{ background: complexity === null ? '#c7d2fe' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          Submit Answer
        </button>
      )}

      {submitted && (
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          {idx + 1 >= problems.length ? 'See Results →' : 'Next Problem →'}
        </button>
      )}
    </div>
  );
}
