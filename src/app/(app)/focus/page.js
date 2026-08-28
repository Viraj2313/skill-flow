'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getTopics, getAllLessons, getUserLessonProgress } from '@/lib/db';

const CAT_COLOR = {
  dsa:              '#059669',
  python:           '#2563eb',
  'cs-fundamentals':'#d97706',
};

const PRIORITY = {
  struggling:  { label: 'Needs Work',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: 'warning', order: 0 },
  inprogress:  { label: 'In Progress',   color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: 'pending', order: 1 },
  notstarted:  { label: 'Not Started',   color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: 'circle',  order: 2 },
  strong:      { label: 'Strong',        color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: 'check_circle', order: 3 },
};

export default function FocusPage() {
  const router = useRouter();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }

      const [topics, allLessons, userProgress] = await Promise.all([
        getTopics(),
        getAllLessons(),
        getUserLessonProgress(user.id),
      ]);

      const lessonMap   = Object.fromEntries(allLessons.map(l => [l.id, l]));
      const progressMap = {};
      for (const p of userProgress) {
        if (!p.lesson_id) continue;
        if (!progressMap[p.lesson_id]) progressMap[p.lesson_id] = p;
      }

      const topicItems = topics.map(topic => {
        const topicLessons = allLessons.filter(l => l.topic_id === topic.id);
        const attempted    = topicLessons.filter(l => progressMap[l.id]);
        const completed    = topicLessons.filter(l => progressMap[l.id]?.completed);

        let totalCorrect = 0, totalAnswered = 0;
        for (const l of topicLessons) {
          const p = progressMap[l.id];
          if (p && p.total_count > 0) {
            totalCorrect  += p.correct_count || 0;
            totalAnswered += p.total_count;
          }
        }

        const accuracy    = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;
        const completionPct = topicLessons.length > 0 ? Math.round((completed.length / topicLessons.length) * 100) : 0;

        const lastActive = attempted.reduce((best, l) => {
          const d = progressMap[l.id]?.completed_at;
          if (!d) return best;
          return (!best || new Date(d) > new Date(best)) ? d : best;
        }, null);

        const daysSince = lastActive
          ? Math.floor((Date.now() - new Date(lastActive).getTime()) / 86_400_000)
          : null;

        let status;
        if (attempted.length === 0) {
          status = 'notstarted';
        } else if (completed.length === topicLessons.length && accuracy !== null && accuracy >= 70) {
          status = 'strong';
        } else if (accuracy !== null && accuracy < 60 && totalAnswered >= 3) {
          status = 'struggling';
        } else {
          status = 'inprogress';
        }

        const firstLesson = topicLessons.sort((a, b) => a.sort_order - b.sort_order)[0];
        const nextLesson  = topicLessons.find(l => !progressMap[l.id]?.completed) || firstLesson;

        return {
          topic,
          topicLessons,
          completed:    completed.length,
          total:        topicLessons.length,
          completionPct,
          accuracy,
          totalAnswered,
          daysSince,
          status,
          nextLesson,
          catColor: CAT_COLOR[topic.category_id] || '#059669',
        };
      });

      topicItems.sort((a, b) => PRIORITY[a.status].order - PRIORITY[b.status].order || a.accuracy - b.accuracy);
      setItems(topicItems);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-slate-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  const filters = ['all', 'struggling', 'inprogress', 'notstarted', 'strong'];
  const shown = filter === 'all' ? items : items.filter(i => i.status === filter);

  const counts = {
    struggling: items.filter(i => i.status === 'struggling').length,
    inprogress: items.filter(i => i.status === 'inprogress').length,
    notstarted: items.filter(i => i.status === 'notstarted').length,
    strong:     items.filter(i => i.status === 'strong').length,
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4 space-y-6">
      <div className="pt-6 pb-2 border-b border-slate-200/80">
        <h1 className="font-sans font-bold text-[24px] text-slate-900 tracking-tight">Where to Focus</h1>
        <p className="font-sans text-[14px] text-slate-500 mt-1">
          Topics ranked by how much attention they need, based on your actual answers.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { key: 'struggling', label: 'Needs Work', val: counts.struggling, color: '#dc2626' },
          { key: 'inprogress', label: 'In Progress', val: counts.inprogress, color: '#d97706' },
          { key: 'notstarted', label: 'Not Started', val: counts.notstarted, color: '#64748b' },
          { key: 'strong',     label: 'Strong',      val: counts.strong,     color: '#059669' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${filter === s.key ? 'border-opacity-100' : 'border-slate-200 bg-white'}`}
            style={filter === s.key ? { borderColor: s.color, backgroundColor: s.color + '10' } : {}}
          >
            <p className="font-mono font-bold text-[20px]" style={{ color: s.color }}>{s.val}</p>
            <p className="font-sans text-[10px] text-slate-500 mt-0.5 leading-tight">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map(item => {
          const p = PRIORITY[item.status];
          return (
            <div
              key={item.topic.id}
              className="bg-white border rounded-2xl overflow-hidden transition-all hover:shadow-sm"
              style={{ borderColor: p.border }}
            >
              <div className="px-5 py-3 border-b flex items-center justify-between" style={{ backgroundColor: p.bg, borderColor: p.border }}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[15px] filled" style={{ color: p.color }}>{p.icon}</span>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: p.color }}>{p.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.daysSince !== null && (
                    <span className="font-sans text-[11px] text-slate-400">
                      {item.daysSince === 0 ? 'active today' : `${item.daysSince}d ago`}
                    </span>
                  )}
                  <span
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: item.catColor + '15', color: item.catColor }}
                  >
                    {item.topic.category_id}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-sans font-bold text-[16px] text-slate-900">{item.topic.name}</h3>
                    <p className="font-sans text-[12px] text-slate-500 mt-0.5">{item.topic.description}</p>
                  </div>
                  {item.accuracy !== null && (
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-[22px]" style={{ color: item.accuracy < 60 ? '#dc2626' : item.accuracy < 80 ? '#d97706' : '#059669' }}>
                        {item.accuracy}%
                      </p>
                      <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">accuracy</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.completionPct}%`, backgroundColor: item.catColor }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">{item.completed}/{item.total} done</span>
                </div>

                <div className="flex gap-2">
                  {item.nextLesson && (
                    <Link
                      href={`/lesson/${item.nextLesson.slug}`}
                      className="flex-1 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase text-center text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: p.color }}
                    >
                      {item.status === 'strong' ? 'Review' : item.status === 'notstarted' ? 'Start' : 'Continue'}
                    </Link>
                  )}
                  <Link
                    href={`/practice/speed`}
                    className="px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-widest uppercase border-2 text-slate-600 hover:bg-slate-50 transition-colors"
                    style={{ borderColor: p.border }}
                  >
                    Speed Round
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {shown.length === 0 && (
          <div className="text-center py-12">
            <p className="font-sans text-[14px] text-slate-400">No topics in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
