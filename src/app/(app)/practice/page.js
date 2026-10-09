'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

const MODES = [
  {
    href: '/practice/speed',
    icon: 'timer',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    label: 'Speed Round',
    tagline: '10 questions · 30 seconds each · no hints',
    description: 'Race against the clock on MCQ questions from your chosen topic. Lock in your answer fast — no hints, no explanations until after. Score by accuracy, broken by speed.',
    pills: ['10 questions', 'Timed', 'Leaderboard'],
  },
  {
    href: '/practice/patterns',
    icon: 'pattern',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    label: 'Pattern Recognition',
    tagline: 'Read a problem — identify the approach',
    description: 'Given a raw problem statement, pick the right algorithm pattern before seeing any code. The skill most interviews actually test.',
    pills: ['12 problems', 'No code needed', 'Instant feedback'],
  },
  {
    href: '/practice/trace',
    icon: 'track_changes',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    label: 'Code Trace',
    tagline: 'Step through code — track every variable',
    description: 'Follow a real algorithm line by line and answer what each variable holds at key points. Builds genuine understanding, not just pattern memory.',
    pills: ['Step by step', 'Variable tracking', 'No guessing'],
  },
  {
    href: '/practice/debug',
    icon: 'bug_report',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    label: 'Debug This',
    tagline: 'Find and fix the bug in broken code',
    description: 'Read an intentionally buggy algorithm, identify the broken line, and type the fix. Mirrors exactly what interviewers ask when they show you broken code.',
    pills: ['5 problems', 'Find + fix', 'Real interview style'],
  },
  {
    href: '/practice/teach',
    icon: 'school',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    label: 'Teach It Back',
    tagline: 'Explain a concept to a confused junior dev',
    description: 'Pick a concept you just learned and explain it out loud (in text). The AI plays a junior developer who asks follow-up questions until your explanation is airtight.',
    pills: ['AI-powered', 'Feynman technique', 'Scored'],
  },
  {
    href: '/practice/complexity',
    icon: 'speed',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    label: 'Complexity Predictor',
    tagline: 'Click the bottleneck line · pick the Big O',
    description: 'Read real code, click the line that dominates time complexity, then select the Big O. Two-step challenge that mirrors how interviewers actually ask complexity questions.',
    pills: ['12 problems', 'O(1) to O(2^n)', 'Line-level analysis'],
  },
  {
    href: '/practice/visualizer',
    icon: 'animation',
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#e9d5ff',
    label: 'Algorithm Visualizer',
    tagline: 'Watch algorithms animate step by step',
    description: 'Step through Binary Search, Two Pointer, Sliding Window, Linked List Reversal, Tree DFS, and Graph BFS. See exactly what each variable holds at every step.',
    pills: ['6 algorithms', 'Step-by-step', 'Auto-play mode'],
  },
  {
    href: '/practice/deconstruct',
    icon: 'code_blocks',
    color: '#0f172a',
    bg: '#f8fafc',
    border: '#cbd5e1',
    label: 'Problem Deconstruction',
    tagline: 'WHY does this solution work?',
    description: 'Read a complete working solution, then answer 3 deep questions: the key insight, the loop invariant, and what input would break it. AI evaluates your reasoning — not just correctness.',
    pills: ['6 problems', 'Key Insight · Invariant · Break It', 'AI graded'],
  },
];

export default function PracticePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="pb-2 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-[24px] sm:text-[28px] text-slate-900 tracking-tight">Practice Modes</h1>
          <p className="font-sans text-[14px] text-slate-500 mt-1">
            Deeper exercises you can do any time — not tied to a lesson, no pressure.
          </p>
        </div>
        <Link
          href="/focus?tab=weak-spots"
          className="btn-tactile px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[15px] filled">my_location</span>
          <span>Where I Lack Hub</span>
        </Link>
      </div>

      {/* Where I Lack Quick Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50/50 to-white border border-red-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] text-red-600 filled">flag_circle</span>
          </div>
          <div>
            <h2 className="font-sans font-bold text-[14.5px] text-slate-900">
              Target Your Personal Weak Spots
            </h2>
            <p className="font-sans text-[12.5px] text-slate-600">
              See what topics you&apos;re getting wrong, read the concepts, and retest them in 1 click.
            </p>
          </div>
        </div>
        <Link
          href="/focus?tab=weak-spots"
          className="btn-tactile btn-tactile-primary px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider text-white shrink-0 flex items-center gap-1.5 self-end sm:self-auto shadow-xs"
        >
          <span>View Weak Spots</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {MODES.map(mode => (
          <Link key={mode.href} href={mode.href} className="block group">
            <Card
              className="h-full overflow-hidden"
              style={{ transition: 'box-shadow 200ms ease, border-color 200ms ease' }}
            >
              <div className="px-5 py-4 border-b" style={{ backgroundColor: mode.bg, borderColor: mode.border }}>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: mode.color + '20' }}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color: mode.color }}>{mode.icon}</span>
                  </div>
                  <div>
                    <p className="font-sans font-bold text-[15px] text-slate-900 group-hover:text-inherit transition-colors" style={{ '--tw-text-opacity': 1 }}>{mode.label}</p>
                    <p className="font-mono text-[10px] text-slate-500">{mode.tagline}</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="font-sans text-[13px] text-slate-600 leading-relaxed mb-4">{mode.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {mode.pills.map(pill => (
                    <span
                      key={pill}
                      className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: mode.color + '12', color: mode.color }}
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
        <p className="font-sans text-[13px] text-slate-500">
          These modes work on any concept — come back after any lesson or whenever you have 10 minutes.
        </p>
      </div>
    </div>
  );
}
