'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EVOLUTIONS } from '@/data/evolutions';

const COMPLEXITY_COLOR = {
  'O(1)':    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'O(log n)':{ bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-300' },
  'O(n)':    { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  'O(n·k)':  { bg: 'bg-amber-100',  text: 'text-amber-800',  border: 'border-amber-300' },
  'O(n log n)':{ bg:'bg-orange-100',text: 'text-orange-800', border: 'border-orange-300' },
  'O(n²)':   { bg: 'bg-red-100',   text: 'text-red-800',    border: 'border-red-300' },
  'O(2ⁿ)':   { bg: 'bg-red-200',   text: 'text-red-900',    border: 'border-red-400' },
  'O(n) → O(n)':      { bg: 'bg-blue-100',  text: 'text-blue-800',  border: 'border-blue-300' },
  'O(n²) → O(n)':     { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'O(n·k) → O(n)':    { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'O(n) → O(1)':      { bg: 'bg-emerald-100',text:'text-emerald-800',border:'border-emerald-300' },
  'O(n²) → O(n log n)':{ bg:'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  'O(2ⁿ) → O(n)':     { bg: 'bg-teal-100',  text: 'text-teal-800',  border: 'border-teal-300' },
};

function ComplexityBadge({ label }) {
  const c = COMPLEXITY_COLOR[label] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {label}
    </span>
  );
}

function CodeBlock({ code, highlightLines = [] }) {
  const lines = code.split('\n');
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 text-[13px] font-mono">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-amber-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
      </div>
      <div className="bg-slate-950 overflow-x-auto">
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isHighlighted = highlightLines.includes(i);
          return (
            <div
              key={i}
              className={`flex leading-6 ${isHighlighted ? 'bg-blue-500/10 border-l-2 border-blue-400' : ''}`}
            >
              <span className="select-none w-8 text-right text-slate-600 shrink-0 px-2 py-0.5 text-[11px]">{lineNum}</span>
              <span className={`px-3 py-0.5 whitespace-pre ${isHighlighted ? 'text-blue-200' : 'text-slate-300'}`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepIndicator({ steps, current, onSelect }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="flex items-center gap-2 group"
        >
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            i === current
              ? 'bg-slate-900 border-slate-900 text-white'
              : i < current
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-400'
          }`}>
            {i < current ? (
              <span className="material-symbols-outlined text-[14px] filled text-emerald-600">check_circle</span>
            ) : (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                i === current ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-500'
              }`}>{i + 1}</span>
            )}
            <span className="font-mono text-[11px] font-bold tracking-wide hidden sm:block">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-px ${i < current ? 'bg-emerald-300' : 'bg-slate-200'}`} />
          )}
        </button>
      ))}
    </div>
  );
}

function EvolutionView({ slug }) {
  const data = EVOLUTIONS[slug];
  const [step, setStep] = useState(0);

  if (!data) return null;

  const current = data.steps[step];
  const isLast  = step === data.steps.length - 1;
  const isFirst = step === 0;

  return (
    <div>
      <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[18px] text-slate-500 mt-0.5">help_outline</span>
          <div>
            <p className="font-sans text-[14px] font-semibold text-slate-800 mb-1">Problem</p>
            <p className="font-sans text-[14px] text-slate-600 leading-relaxed mb-3">{data.problem}</p>
            <div className="flex flex-wrap gap-3">
              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Input</span>
                <code className="font-mono text-[13px] text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">{data.example.input}</code>
              </div>
              <div>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Output</span>
                <code className="font-mono text-[13px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">{data.example.output}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StepIndicator steps={data.steps} current={step} onSelect={setStep} />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className={`px-6 py-4 flex items-center justify-between border-b ${current.bad ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-[20px] filled ${current.bad ? 'text-red-500' : 'text-emerald-600'}`}>
              {current.bad ? 'cancel' : step === 1 ? 'lightbulb' : 'check_circle'}
            </span>
            <div>
              <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-slate-400 block">Step {step + 1} of {data.steps.length}</span>
              <h2 className={`font-sans font-bold text-[18px] ${current.bad ? 'text-red-900' : 'text-slate-900'}`}>{current.label}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-right">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Time</span>
              <ComplexityBadge label={current.complexity.time} />
            </div>
            <div className="text-right">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-1">Space</span>
              <ComplexityBadge label={current.complexity.space} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-100">
          <div className={`flex items-start gap-2 p-4 rounded-xl ${current.bad ? 'bg-red-50 border border-red-100' : step === 1 ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'}`}>
            <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${current.bad ? 'text-red-500' : step === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {current.bad ? 'warning' : step === 1 ? 'lightbulb' : 'auto_awesome'}
            </span>
            <p className="font-sans text-[14px] text-slate-700 leading-relaxed">{current.insight}</p>
          </div>
        </div>

        <div className="p-5">
          <CodeBlock code={current.code} highlightLines={current.highlight} />
        </div>
      </div>

      <div className="flex gap-3">
        {!isFirst && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase border-2 border-slate-300 text-slate-700 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Previous
          </button>
        )}
        {!isLast ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2"
          >
            {step === 0 ? 'Show the Insight →' : 'See Optimised →'}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        ) : (
          <div className="flex-1 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase bg-emerald-600 text-white flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px] filled">check_circle</span>
            Optimised!
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvolutionsPage() {
  const slugs   = Object.keys(EVOLUTIONS);
  const [active, setActive] = useState(slugs[0]);

  const labels = {
    'two-sum-think-it-through': 'Two Sum',
    'sliding-window-intro':     'Sliding Window',
    'strings-palindrome':       'Palindrome',
    'linked-list-reverse':      'Reverse List',
    'recursion-fibonacci':      'Fibonacci',
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="mb-8 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="font-mono text-[11px] tracking-wide">Dashboard</span>
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-200 rounded-full mb-3">
          <span className="material-symbols-outlined text-[14px] text-orange-700">trending_up</span>
          <span className="font-mono text-[10px] font-bold tracking-widest text-orange-700 uppercase">Code Evolution</span>
        </div>
        <h1 className="font-sans font-bold text-[28px] text-slate-900 leading-tight mb-2">
          From Brute Force to Optimal
        </h1>
        <p className="font-sans text-[15px] text-slate-500 leading-relaxed max-w-xl">
          Most sites show you the answer. This shows you the <em>journey</em> — the exact moment of insight that transforms a slow solution into an elegant one.
        </p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {slugs.map(slug => (
          <button
            key={slug}
            onClick={() => setActive(slug)}
            className={`shrink-0 px-4 py-2 rounded-lg font-mono text-[11px] font-bold tracking-wider uppercase border transition-all ${
              active === slug
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {labels[slug] || slug}
          </button>
        ))}
      </div>

      <EvolutionView key={active} slug={active} />
    </div>
  );
}
