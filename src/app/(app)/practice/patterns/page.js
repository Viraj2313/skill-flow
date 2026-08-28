'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PATTERN_PROBLEMS } from '@/data/practiceData';

const DIFFICULTY_COLOR = { easy: '#059669', medium: '#d97706', hard: '#dc2626' };

export default function PatternsPage() {
  const [index, setIndex]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  const problem  = PATTERN_PROBLEMS[index];
  const answered = selected !== null;
  const correct  = selected === problem?.answer;

  function handleSelect(option) {
    if (answered) return;
    setSelected(option);
    if (option === problem.answer) setScore(s => s + 1);
  }

  function handleNext() {
    if (index + 1 >= PATTERN_PROBLEMS.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  }

  if (done) {
    const pct = Math.round((score / PATTERN_PROBLEMS.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[40px] text-violet-700 filled">emoji_events</span>
        </div>
        <div>
          <h1 className="font-sans font-bold text-[28px] text-slate-900">{score}/{PATTERN_PROBLEMS.length} correct</h1>
          <p className="font-sans text-[14px] text-slate-500 mt-1">
            {pct >= 80 ? 'Strong pattern intuition.' : pct >= 50 ? 'Getting there — keep practising.' : 'Review the algorithm patterns and try again.'}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setIndex(0); setSelected(null); setScore(0); setDone(false); }}
            className="px-5 py-2.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase border-2 border-violet-400 text-violet-700 hover:bg-violet-50 transition-colors"
          >
            Try Again
          </button>
          <Link href="/practice" className="px-5 py-2.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-violet-600 text-white hover:bg-violet-700 transition-colors">
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4">
      <div className="flex items-center gap-3 py-6">
        <Link href="/practice" className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-sans font-bold text-[18px] text-slate-900">Pattern Recognition</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${((index) / PATTERN_PROBLEMS.length) * 100}%` }} />
            </div>
            <span className="font-mono text-[11px] text-slate-400 shrink-0">{index + 1}/{PATTERN_PROBLEMS.length}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-mono text-[13px] font-bold text-violet-700">{score} correct</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="font-mono text-[10px] font-semibold tracking-widest text-slate-400 uppercase">What pattern is this?</span>
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: DIFFICULTY_COLOR[problem.difficulty] + '15', color: DIFFICULTY_COLOR[problem.difficulty] }}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="p-6">
          <p className="font-sans text-[16px] text-slate-800 leading-relaxed mb-8">{problem.statement}</p>

          <div className="grid grid-cols-2 gap-3">
            {problem.options.map(option => {
              let bg = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50';
              if (answered) {
                if (option === problem.answer) bg = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                else if (option === selected) bg = 'bg-red-50 border-red-400 text-red-700';
                else bg = 'bg-slate-50 border-slate-200 text-slate-400';
              } else if (selected === option) {
                bg = 'bg-violet-50 border-violet-400 text-violet-800';
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  disabled={answered}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-sans text-[14px] font-medium text-left transition-all ${bg}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`mt-6 p-4 rounded-xl border ${correct ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[16px] filled ${correct ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {correct ? 'check_circle' : 'info'}
                </span>
                <span className={`font-mono text-[11px] font-bold tracking-widest uppercase ${correct ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {correct ? 'Correct' : `Answer: ${problem.answer}`}
                </span>
              </div>
              <p className="font-sans text-[14px] text-slate-700 leading-relaxed">{problem.explanation}</p>
            </div>
          )}
        </div>

        {answered && (
          <div className="px-6 pb-6">
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase text-white bg-violet-600 hover:bg-violet-700 transition-colors"
            >
              {index + 1 < PATTERN_PROBLEMS.length ? 'Next Problem →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
