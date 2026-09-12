'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getGoal, deleteGoal, getTopics } from '@/lib/db';

const COMPANY_META = {
  google:    { name: 'Google',       emoji: '🔵', color: '#4285f4' },
  meta:      { name: 'Meta',         emoji: '🟦', color: '#0866ff' },
  amazon:    { name: 'Amazon',       emoji: '🟠', color: '#ff9900' },
  microsoft: { name: 'Microsoft',    emoji: '🪟', color: '#00a4ef' },
  apple:     { name: 'Apple',        emoji: '🍎', color: '#555555' },
  netflix:   { name: 'Netflix',      emoji: '🔴', color: '#e50914' },
  openai:    { name: 'OpenAI',       emoji: '🤖', color: '#10a37f' },
  stripe:    { name: 'Stripe',       emoji: '💳', color: '#635bff' },
  startup:   { name: 'Startup',      emoji: '🚀', color: '#f59e0b' },
  general:   { name: 'General Prep', emoji: '🎯', color: '#6366f1' },
};

function computeProgress(goal) {
  const created  = new Date(goal.created_at);
  const interview = new Date(goal.interview_date);
  const today    = new Date();
  today.setHours(0,0,0,0);

  const totalDays   = Math.max(1, Math.ceil((interview - created) / 86400000));
  const daysElapsed = Math.max(0, Math.floor((today - created) / 86400000));
  const daysLeft    = Math.max(0, Math.ceil((interview - today) / 86400000));
  const plan        = goal.topic_plan || [];
  const N           = plan.length;

  const currentTopicIdx = N > 0
    ? Math.min(Math.floor(daysElapsed * N / totalDays), N - 1)
    : 0;

  return { totalDays, daysElapsed, daysLeft, currentTopicIdx, plan, N };
}

export default function GoalPage() {
  const router = useRouter();
  const [goal, setGoal]       = useState(null);
  const [topics, setTopics]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return; }
      Promise.all([getGoal(), getTopics()]).then(([g, t]) => {
        if (!g) { router.replace('/goal/setup'); return; }
        setGoal(g);
        setTopics(t);
        setLoading(false);
      });
    });
  }, [router]);

  async function handleAbandon() {
    await deleteGoal();
    router.push('/dashboard');
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="material-symbols-outlined text-[32px] text-slate-300 animate-spin">progress_activity</span>
    </div>
  );

  const topicMap = {};
  topics.forEach(t => { topicMap[t.id] = t; });

  const { daysLeft, currentTopicIdx, plan, N, daysElapsed, totalDays } = computeProgress(goal);
  const company = COMPANY_META[goal.company] || COMPANY_META.general;
  const todayTopic = topicMap[plan[currentTopicIdx]];
  const pct = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

  const isOver = daysLeft === 0;

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4">
      <div className="py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[22px]">{company.emoji}</span>
            <span className="font-mono text-[12px] font-bold tracking-widest uppercase" style={{ color: company.color }}>
              {company.name} Prep
            </span>
          </div>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400 hover:text-red-500 transition-colors"
            >
              Abandon Goal
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-sans text-[12px] text-slate-500">Sure?</span>
              <button onClick={handleAbandon} className="font-sans text-[12px] font-bold text-red-600">Yes</button>
              <button onClick={() => setConfirming(false)} className="font-sans text-[12px] text-slate-400">No</button>
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-6 mb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${company.color}dd, ${company.color}99)` }}
        >
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase opacity-75 mb-1">
            {isOver ? 'Interview day!' : 'Days remaining'}
          </p>
          <p className="font-sans font-black text-[72px] leading-none mb-1">
            {isOver ? '🎯' : daysLeft}
          </p>
          <p className="font-sans text-[14px] opacity-80">
            Interview: {new Date(goal.interview_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="font-mono text-[10px] opacity-60 mt-1">{pct}% of prep time used</p>
        </div>

        {todayTopic && !isOver && (
          <div className="border-2 border-slate-200 rounded-2xl p-5 mb-6 bg-white">
            <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">Today's Focus</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans font-bold text-[18px] text-slate-900">{todayTopic.name}</p>
                <p className="font-sans text-[13px] text-slate-500 mt-0.5">{todayTopic.description}</p>
              </div>
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#eef2ff' }}
              >
                <span className="material-symbols-outlined text-[20px] text-indigo-600">{todayTopic.icon}</span>
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                href={`/skills`}
                className="flex-1 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-center text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                Study Now →
              </Link>
              <Link
                href="/focus"
                className="flex-1 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-center border-2 border-slate-200 text-slate-600 hover:border-indigo-300 transition-colors"
              >
                View Focus
              </Link>
            </div>
          </div>
        )}

        <div>
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
            Full Study Plan ({N} topics)
          </p>
          <div className="space-y-2">
            {plan.map((tid, idx) => {
              const t = topicMap[tid];
              if (!t) return null;
              const isPast    = idx < currentTopicIdx;
              const isCurrent = idx === currentTopicIdx;
              const isFuture  = idx > currentTopicIdx;

              const dayStart = Math.round(idx * totalDays / N) + 1;
              const dayEnd   = Math.round((idx + 1) * totalDays / N);

              return (
                <div
                  key={tid}
                  className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                  style={{
                    background: isCurrent ? '#eef2ff' : '#f8fafc',
                    border:     isCurrent ? '2px solid #a5b4fc' : '1.5px solid #e2e8f0',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono text-[11px] font-bold"
                    style={{
                      background: isPast ? '#dcfce7' : isCurrent ? '#6366f1' : '#f1f5f9',
                      color:      isPast ? '#15803d' : isCurrent ? 'white' : '#94a3b8',
                    }}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-[13px] text-slate-800 truncate">{t.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">Day {dayStart}–{dayEnd}</p>
                  </div>
                  {isCurrent && (
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">Today</span>
                  )}
                  {isPast && (
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Done</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <Link
            href="/goal/setup"
            className="font-mono text-[11px] font-semibold tracking-widest uppercase text-slate-400 hover:text-indigo-600 transition-colors"
          >
            ↺ Change Company or Date
          </Link>
        </div>
      </div>
    </div>
  );
}
