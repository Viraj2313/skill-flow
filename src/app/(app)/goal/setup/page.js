'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getTopics, getAllLessons, getUserLessonProgress, saveGoal } from '@/lib/db';

const COMPANIES = [
  { id: 'google',    name: 'Google',    emoji: '🔵' },
  { id: 'meta',      name: 'Meta',      emoji: '🟦' },
  { id: 'amazon',    name: 'Amazon',    emoji: '🟠' },
  { id: 'microsoft', name: 'Microsoft', emoji: '🪟' },
  { id: 'apple',     name: 'Apple',     emoji: '🍎' },
  { id: 'netflix',   name: 'Netflix',   emoji: '🔴' },
  { id: 'openai',    name: 'OpenAI',    emoji: '🤖' },
  { id: 'stripe',    name: 'Stripe',    emoji: '💳' },
  { id: 'startup',   name: 'Startup',   emoji: '🚀' },
  { id: 'general',   name: 'General Prep', emoji: '🎯' },
];

function generatePlan(topics, lessons, progress) {
  const lessonMap = {};
  lessons.forEach(l => { lessonMap[l.id] = l; });

  const progressByTopic = {};
  progress.forEach(p => {
    const lesson = lessonMap[p.lesson_id];
    if (!lesson) return;
    const tid = lesson.topic_id;
    if (!progressByTopic[tid]) progressByTopic[tid] = { correct: 0, total: 0, completed: 0 };
    progressByTopic[tid].total    += p.exercises_seen  || 0;
    progressByTopic[tid].correct  += p.exercises_correct || 0;
    progressByTopic[tid].completed += p.completed ? 1 : 0;
  });

  const topicLessonCount = {};
  lessons.forEach(l => {
    topicLessonCount[l.topic_id] = (topicLessonCount[l.topic_id] || 0) + 1;
  });

  const scored = topics.map(t => {
    const p = progressByTopic[t.id] || { correct: 0, total: 0, completed: 0 };
    const accuracy = p.total > 0 ? (p.correct / p.total) * 100 : null;
    const totalLessons = topicLessonCount[t.id] || 0;
    const completionPct = totalLessons > 0 ? (p.completed / totalLessons) * 100 : 0;

    let priority;
    if (p.total === 0)                          priority = 2;
    else if (accuracy < 60 && p.total >= 3)     priority = 0;
    else if (completionPct < 100)               priority = 1;
    else                                        priority = 3;

    return { id: t.id, name: t.name, priority, accuracy };
  });

  scored.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.accuracy !== null && b.accuracy !== null) return a.accuracy - b.accuracy;
    return 0;
  });

  return scored.map(t => t.id);
}

export default function GoalSetupPage() {
  const router = useRouter();
  const [company, setCompany]     = useState(null);
  const [dateStr, setDateStr]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [authed, setAuthed]       = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login');
      else setAuthed(true);
    });
  }, [router]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateStr = minDate.toISOString().split('T')[0];

  async function handleSave() {
    if (!company) { setError('Pick a company target.'); return; }
    if (!dateStr) { setError('Set your interview date.'); return; }
    const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (days < 3) { setError('Pick a date at least 3 days away.'); return; }

    setSaving(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const [topics, lessons, progress] = await Promise.all([
        getTopics(),
        getAllLessons(),
        getUserLessonProgress(user.id),
      ]);
      const topicPlan = generatePlan(topics, lessons, progress);
      await saveGoal({ company, interviewDate: dateStr, topicPlan });
      router.push('/goal');
    } catch (e) {
      setError('Failed to save goal. Try again.');
      setSaving(false);
    }
  }

  if (!authed) return null;

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4">
      <div className="py-8 border-b border-slate-200/80 mb-8">
        <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-1">Interview Prep</p>
        <h1 className="font-sans font-bold text-[26px] text-slate-900 tracking-tight">Set Your Interview Goal</h1>
        <p className="font-sans text-[14px] text-slate-500 mt-1">
          We'll build a personalised daily study plan based on your weak spots and time remaining.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
            1 · Where are you interviewing?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {COMPANIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCompany(c.id)}
                style={{
                  border:     company === c.id ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                  background: company === c.id ? '#eef2ff' : '#fff',
                  color:      company === c.id ? '#4338ca' : '#374151',
                }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl font-sans font-semibold text-[14px] transition-all"
              >
                <span className="text-[20px]">{c.emoji}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-3">
            2 · When is your interview?
          </p>
          <input
            type="date"
            min={minDateStr}
            value={dateStr}
            onChange={e => setDateStr(e.target.value)}
            className="w-full sm:w-72 border-2 border-slate-200 rounded-xl px-4 py-3 font-sans text-[15px] text-slate-800 focus:outline-none focus:border-indigo-400 transition-colors"
          />
          {dateStr && (
            <p className="font-mono text-[12px] text-slate-400 mt-2">
              {Math.ceil((new Date(dateStr) - new Date()) / 86400000)} days from today
            </p>
          )}
        </div>

        {error && (
          <p className="font-sans text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-xl font-mono text-[13px] font-bold tracking-widest uppercase text-white transition-all"
          style={{ background: saving ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          {saving ? 'Building your plan…' : 'Build My Study Plan →'}
        </button>
      </div>
    </div>
  );
}
