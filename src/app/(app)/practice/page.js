'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

const MODES = [
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
];

export default function PracticePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="font-sans font-bold text-[24px] sm:text-[28px] text-slate-900 tracking-tight">Practice Modes</h1>
        <p className="font-sans text-[14px] text-slate-500 mt-1">
          Deeper exercises you can do any time — not tied to a lesson, no pressure.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {MODES.map(mode => (
          <Link key={mode.href} href={mode.href} className="block group">
            <Card
              className="h-full overflow-hidden hover:shadow-md transition-all duration-200 border-slate-200 hover:border-slate-300"
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
