'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TRACE_PROBLEMS } from '@/data/practiceData';

function CodeBlock({ code, highlightLine }) {
  const lines = code.split('\n');
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 font-mono text-[13px]">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </div>
      <div className="bg-slate-950 p-4 overflow-x-auto">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const active  = lineNum === highlightLine;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 px-2 py-0.5 rounded transition-colors ${active ? 'bg-amber-400/15' : ''}`}
            >
              <span className="text-slate-600 select-none w-4 text-right shrink-0 text-[11px] mt-0.5">{lineNum}</span>
              <span className={`${active ? 'text-amber-300' : 'text-slate-300'} whitespace-pre`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TracePage() {
  const [problemIdx, setProblemIdx] = useState(0);
  const [stepIdx, setStepIdx]       = useState(0);
  const [answers, setAnswers]       = useState({});
  const [checked, setChecked]       = useState({});
  const [done, setDone]             = useState(false);

  const problem  = TRACE_PROBLEMS[problemIdx];
  const step     = problem.steps[stepIdx];
  const isLast   = stepIdx === problem.steps.length - 1;
  const question = problem.questions.find(q => q.afterStep === stepIdx + 1);

  function handleCheck(qIdx) {
    const q   = problem.questions[qIdx];
    const ans = (answers[qIdx] || '').toLowerCase().trim();
    const correct = q.answer.toLowerCase().split(' or ').some(a => ans.includes(a.trim()));
    setChecked(prev => ({ ...prev, [qIdx]: correct }));
  }

  function handleNext() {
    if (isLast) {
      if (problemIdx + 1 < TRACE_PROBLEMS.length) {
        setProblemIdx(i => i + 1);
        setStepIdx(0);
        setAnswers({});
        setChecked({});
      } else {
        setDone(true);
      }
    } else {
      setStepIdx(i => i + 1);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-6">
        <div className="w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[40px] text-sky-700 filled">task_alt</span>
        </div>
        <h1 className="font-sans font-bold text-[26px] text-slate-900">Trace complete</h1>
        <p className="font-sans text-[14px] text-slate-500">You stepped through {TRACE_PROBLEMS.length} algorithms line by line.</p>
        <Link href="/practice" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-sky-600 text-white hover:bg-sky-700 transition-colors">
          Back to Practice
        </Link>
      </div>
    );
  }

  const qIdx = problem.questions.findIndex(q => q.afterStep === stepIdx + 1);

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4">
      <div className="flex items-center gap-3 py-6">
        <Link href="/practice" className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-sans font-bold text-[18px] text-slate-900">{problem.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${((stepIdx) / problem.steps.length) * 100}%` }} />
            </div>
            <span className="font-mono text-[11px] text-slate-400 shrink-0">Step {stepIdx + 1}/{problem.steps.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-5 py-3">
          <span className="font-mono text-[10px] font-bold tracking-widest text-sky-600 uppercase block mb-1">Input</span>
          <code className="font-mono text-[13px] text-slate-800">{problem.input}</code>
        </div>

        <CodeBlock code={problem.code} highlightLine={step.line} />

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="font-mono text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3">
            Current step: <span className="text-slate-700">{step.description}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(step.variables).map(([name, val]) => (
              <div key={name} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <p className="font-mono text-[10px] text-slate-400 mb-0.5">{name}</p>
                <p className="font-mono text-[13px] font-bold text-slate-900 truncate">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {question && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[16px] text-amber-600">help</span>
              <span className="font-mono text-[11px] font-bold tracking-widest text-amber-700 uppercase">Check your understanding</span>
            </div>
            <p className="font-sans text-[14px] font-semibold text-slate-800 mb-3">{question.question}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={answers[qIdx] || ''}
                onChange={e => setAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                placeholder="Your answer..."
                className="flex-1 px-3 py-2 rounded-lg border border-amber-300 font-mono text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                onKeyDown={e => e.key === 'Enter' && handleCheck(qIdx)}
              />
              <button
                onClick={() => handleCheck(qIdx)}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white font-mono text-[12px] font-bold hover:bg-amber-700 transition-colors"
              >
                Check
              </button>
            </div>
            {checked[qIdx] !== undefined && (
              <div className={`mt-2 flex items-center gap-2 ${checked[qIdx] ? 'text-emerald-700' : 'text-red-600'}`}>
                <span className="material-symbols-outlined text-[15px] filled">{checked[qIdx] ? 'check_circle' : 'cancel'}</span>
                <span className="font-sans text-[13px] font-semibold">
                  {checked[qIdx] ? 'Correct' : `Expected: ${question.answer}`}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase text-white bg-sky-600 hover:bg-sky-700 transition-colors"
        >
          {isLast ? (problemIdx + 1 < TRACE_PROBLEMS.length ? 'Next Algorithm →' : 'Finish') : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
