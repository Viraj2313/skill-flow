'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEBUG_PROBLEMS } from '@/data/practiceData';

export default function DebugPage() {
  const [index, setIndex]       = useState(0);
  const [selectedLine, setLine] = useState(null);
  const [fix, setFix]           = useState('');
  const [submitted, setSubmit]  = useState(false);
  const [hintShown, setHint]    = useState(false);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  const problem = DEBUG_PROBLEMS[index];
  const lines   = problem.buggyCode.split('\n');
  const correct = selectedLine === problem.bugLine;

  function handleSubmit() {
    if (selectedLine === null) return;
    setSubmit(true);
    if (correct) setScore(s => s + 1);
  }

  function handleNext() {
    if (index + 1 >= DEBUG_PROBLEMS.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setLine(null);
      setFix('');
      setSubmit(false);
      setHint(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[40px] text-red-600 filled">bug_report</span>
        </div>
        <h1 className="font-sans font-bold text-[26px] text-slate-900">{score}/{DEBUG_PROBLEMS.length} bugs found</h1>
        <p className="font-sans text-[14px] text-slate-500">
          {score === DEBUG_PROBLEMS.length ? 'Flawless. You spot bugs like a senior engineer.' : 'Keep practising — reading broken code is a real interview skill.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setIndex(0); setLine(null); setFix(''); setSubmit(false); setHint(false); setScore(0); setDone(false); }}
            className="px-5 py-2.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase border-2 border-red-400 text-red-700 hover:bg-red-50 transition-colors"
          >
            Try Again
          </button>
          <Link href="/practice" className="px-5 py-2.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-red-600 text-white hover:bg-red-700 transition-colors">
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
          <h1 className="font-sans font-bold text-[18px] text-slate-900">Debug This</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(index / DEBUG_PROBLEMS.length) * 100}%` }} />
            </div>
            <span className="font-mono text-[11px] text-slate-400 shrink-0">{index + 1}/{DEBUG_PROBLEMS.length}</span>
          </div>
        </div>
        <span className="font-mono text-[13px] font-bold text-red-700">{score} found</span>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <p className="font-sans font-bold text-[16px] text-slate-900 mb-1">{problem.title}</p>
            <p className="font-sans text-[13px] text-slate-600">{problem.description}</p>
          </div>

          <div className="p-4">
            <p className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
              Click the line with the bug
            </p>
            <div className="rounded-xl overflow-hidden border border-slate-800">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="bg-slate-950 p-3">
                {lines.map((line, i) => {
                  const lineNum = i + 1;
                  const isSelected = selectedLine === lineNum;
                  const isBug = submitted && lineNum === problem.bugLine;
                  const isWrong = submitted && isSelected && !correct;

                  let rowClass = 'hover:bg-slate-800/50 cursor-pointer';
                  if (isBug) rowClass = 'bg-emerald-500/20 cursor-pointer';
                  else if (isWrong) rowClass = 'bg-red-500/20 cursor-pointer';
                  else if (isSelected) rowClass = 'bg-amber-400/20 cursor-pointer';

                  return (
                    <div
                      key={i}
                      onClick={() => !submitted && setLine(lineNum)}
                      className={`flex items-start gap-3 px-2 py-1 rounded transition-colors ${rowClass}`}
                    >
                      <span className="font-mono text-[11px] text-slate-600 select-none w-4 text-right shrink-0 mt-0.5">{lineNum}</span>
                      <span className={`font-mono text-[13px] whitespace-pre ${isBug ? 'text-emerald-300' : isWrong ? 'text-red-300' : isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                        {line}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedLine && !submitted && (
            <div className="px-5 pb-4 space-y-3">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Your fix for line {selectedLine}</p>
                <input
                  type="text"
                  value={fix}
                  onChange={e => setFix(e.target.value)}
                  placeholder="Type the corrected line..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              {!hintShown && (
                <button onClick={() => setHint(true)} className="font-mono text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                  Show hint
                </button>
              )}
              {hintShown && (
                <p className="font-sans text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {problem.hint}
                </p>
              )}
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Submit
              </button>
            </div>
          )}

          {submitted && (
            <div className={`mx-5 mb-5 p-4 rounded-xl border ${correct ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[16px] filled ${correct ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {correct ? 'check_circle' : 'info'}
                </span>
                <span className={`font-mono text-[11px] font-bold tracking-widest uppercase ${correct ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {correct ? 'Correct line!' : `Bug was on line ${problem.bugLine}`}
                </span>
              </div>
              <p className="font-sans text-[13px] text-slate-700 leading-relaxed mb-2">{problem.bugDescription}</p>
              <div className="bg-slate-900 rounded-lg px-3 py-2 mt-2">
                <p className="font-mono text-[11px] text-slate-400 mb-1">Fix:</p>
                <code className="font-mono text-[13px] text-emerald-300">{problem.fix}</code>
              </div>
            </div>
          )}
        </div>

        {submitted && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {index + 1 < DEBUG_PROBLEMS.length ? 'Next Bug →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
