'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getUserProfile, getUserLessonProgress, getTopics, getAllLessons } from '@/lib/db';
import { Card } from '@/components/ui';

const CAT_COLOR = {
  dsa:              '#059669',
  python:           '#2563eb',
  'cs-fundamentals':'#d97706',
};

function ActivityHeatmap({ progress }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const WEEKS = 26;
  const dayMs = 86_400_000;

  const activityMap = new Map();
  for (const p of progress) {
    if (!p.completed) continue;
    const d = p.completed_at ? new Date(p.completed_at) : new Date();
    d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    activityMap.set(key, (activityMap.get(key) || 0) + 1);
  }

  const startDay = new Date(today);
  startDay.setDate(today.getDate() - (WEEKS * 7 - 1));
  const startDayOfWeek = startDay.getDay();
  startDay.setDate(startDay.getDate() - startDayOfWeek);

  const cells = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDay.getTime() + (w * 7 + d) * dayMs);
      cellDate.setHours(0, 0, 0, 0);
      if (cellDate > today) { cells.push(null); continue; }
      const count = activityMap.get(cellDate.getTime()) || 0;
      cells.push({ date: cellDate, count });
    }
  }

  function cellColor(count) {
    if (count === 0) return '#f1f5f9';
    if (count === 1) return '#a7f3d0';
    if (count === 2) return '#34d399';
    if (count === 3) return '#10b981';
    return '#059669';
  }

  const totalActive = Math.max([...activityMap.values()].filter(v => v > 0).length, progress.filter(p => p.completed).length > 0 ? 1 : 0);
  const totalLessons = progress.filter(p => p.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Activity</span>
        <span className="font-sans text-[12px] text-slate-400">{totalLessons} lessons · {totalActive} active days</span>
      </div>
      <div className="overflow-x-auto">
        <div style={{ display: 'grid', gridTemplateRows: `repeat(7, 11px)`, gridAutoFlow: 'column', gridAutoColumns: '11px', gap: '3px' }}>
          {Array.from({ length: WEEKS }, (_, w) =>
            Array.from({ length: 7 }, (_, d) => {
              const cell = cells[w * 7 + d];
              if (cell === null) return (
                <div key={`${w}-${d}`} style={{ width: 11, height: 11, borderRadius: 2 }} />
              );
              return (
                <div
                  key={`${w}-${d}`}
                  title={`${cell.date.toDateString()}: ${cell.count} lesson${cell.count !== 1 ? 's' : ''}`}
                  style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: cellColor(cell.count), cursor: 'default' }}
                />
              );
            })
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="font-mono text-[10px] text-slate-400">Less</span>
        {[0, 1, 2, 3, 4].map(n => (
          <div key={n} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: cellColor(n) }} />
        ))}
        <span className="font-mono text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}

function MistakeBreakdown({ progress, topics, lessons }) {
  const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));
  const lessonMap = Object.fromEntries(lessons.map(l => [l.id, l]));

  const byTopic = {};
  for (const p of progress) {
    if (!p.completed || !p.lesson_id) continue;
    const lesson = lessonMap[p.lesson_id] || p.lessons;
    if (!lesson) continue;
    const topicId = lesson.topic_id;
    if (!topicId) continue;
    if (!byTopic[topicId]) byTopic[topicId] = { correct: 0, total: 0, topicId };
    byTopic[topicId].correct += p.correct_count || 0;
    byTopic[topicId].total   += p.total_count  || 0;
  }

  const rows = Object.values(byTopic)
    .filter(r => r.total > 0)
    .map(r => {
      const topic = topicMap[r.topicId];
      return {
        name: topic?.name || r.topicId,
        catId: topic?.category_id || 'dsa',
        pct: Math.round((r.correct / r.total) * 100),
        correct: r.correct,
        total: r.total,
      };
    })
    .sort((a, b) => a.pct - b.pct);

  if (!rows.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => {
        const color = CAT_COLOR[row.catId] || '#059669';
        const bad   = row.pct < 60;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bad ? '#ef4444' : color }} />
            <span className="font-sans text-[13px] text-slate-700 w-32 truncate shrink-0">{row.name}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${row.pct}%`, backgroundColor: bad ? '#ef4444' : color }}
              />
            </div>
            <span className="font-mono text-[11px] text-slate-400 w-10 text-right shrink-0">{row.pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [progress, setProgress] = useState([]);
  const [topics, setTopics]     = useState([]);
  const [lessons, setLessons]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) { router.push('/login'); return; }
      setUser(authUser);
      const [prof, prog, t, l] = await Promise.all([
        getUserProfile(),
        getUserLessonProgress(authUser.id),
        getTopics(),
        getAllLessons(),
      ]);
      setProfile(prof);
      setProgress(prog || []);
      setTopics(t || []);
      setLessons(l || []);
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

  let localCached = [];
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('aq_completed_lessons') : null;
    localCached = raw ? JSON.parse(raw) : [];
  } catch {}
  const localSet = new Set(localCached.map(String));

  const completed = progress.filter(p => p.completed === true || p.completed === 'true' || p.completed === 1 || Boolean(p.completed_at) || localSet.has(String(p.lesson_id)));
  const completedLessonIds = new Set([
    ...completed.map(p => String(p.lesson_id)),
    ...localCached.map(String),
  ]);
  const totalCompletedCount = Math.max(completed.length, completedLessonIds.size);

  const totalProgressXp = progress.reduce((s, p) => s + (Number(p.xp_earned) || 0), 0);
  const xp = (profile?.xp && Number(profile.xp) > 0)
    ? Number(profile.xp)
    : (totalProgressXp > 0 ? totalProgressXp : totalCompletedCount * 25);

  const streak = (profile?.streak_current && Number(profile.streak_current) > 0)
    ? Number(profile.streak_current)
    : (totalCompletedCount > 0 ? 1 : 0);

  const bestStreak = Math.max(Number(profile?.streak_best) || 0, streak);

  const metaName = user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name;
  const emailPrefix = user?.email ? user.email.split('@')[0] : '';
  const name = (profile?.display_name && profile.display_name !== 'User' && profile.display_name !== 'Engineer')
    ? profile.display_name
    : (metaName || emailPrefix || profile?.display_name || 'Engineer');

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'E';

  const memberSinceDate = profile?.created_at || user?.created_at;
  const memberSince = memberSinceDate
    ? new Date(memberSinceDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '—';

  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((s, p) => s + (p.total_count > 0 ? p.correct_count / p.total_count : 1), 0) / completed.length * 100)
    : (totalCompletedCount > 0 ? 100 : 0);

  const stats = [
    { label: 'Total XP',       value: xp.toLocaleString(),   mono: true,  color: 'text-emerald-700' },
    { label: 'Lessons Done',   value: totalCompletedCount,   mono: true,  color: 'text-slate-900' },
    { label: 'Avg Score',      value: `${avgScore}%`,         mono: true,  color: avgScore >= 80 ? 'text-emerald-700' : 'text-amber-600' },
    { label: 'Current Streak', value: `${streak}d`,           mono: true,  color: 'text-amber-600' },
    { label: 'Best Streak',    value: `${bestStreak}d`,       mono: true,  color: 'text-slate-900' },
    { label: 'Member Since',   value: memberSince,            mono: false, color: 'text-slate-500' },
  ];

  const totalExercisesSeen    = progress.reduce((s, p) => s + (p.exercises_seen    || p.total_count   || 0), 0);
  const totalExercisesCorrect = progress.reduce((s, p) => s + (p.exercises_correct || p.correct_count || 0), 0);
  const overallAccuracy       = totalExercisesSeen > 0 ? Math.round((totalExercisesCorrect / totalExercisesSeen) * 100) : 0;

  const lessonMap2 = {};
  lessons.forEach(l => { lessonMap2[l.id] = l; });
  const topicMap2 = {};
  topics.forEach(t => { topicMap2[t.id] = t; });

  const topicBuckets = {};
  progress.forEach(p => {
    const lesson = lessonMap2[p.lesson_id];
    if (!lesson) return;
    const tid = lesson.topic_id;
    if (!topicBuckets[tid]) topicBuckets[tid] = { correct: 0, total: 0 };
    topicBuckets[tid].correct += p.exercises_correct || p.correct_count || 0;
    topicBuckets[tid].total   += p.exercises_seen    || p.total_count   || 0;
  });

  const topicScores = Object.entries(topicBuckets)
    .filter(([, v]) => v.total >= 3)
    .map(([tid, v]) => ({ name: topicMap2[tid]?.name || tid, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  const strongestTopic = topicScores[0] || null;
  const weakestTopic   = topicScores[topicScores.length - 1] || null;

  const completionRate = progress.length > 0
    ? Math.round((completed.length / progress.length) * 100)
    : 100;

  const daysOnPlatform = memberSinceDate
    ? Math.max(1, Math.floor((Date.now() - new Date(memberSinceDate)) / 86400000))
    : 1;

  const storyItems = [
    totalExercisesSeen > 0 && {
      icon: 'quiz', color: '#6366f1',
      headline: `${totalExercisesSeen.toLocaleString()} exercises answered`,
      sub: overallAccuracy > 0 ? `${overallAccuracy}% overall accuracy` : 'Keep going to see your accuracy',
    },
    strongestTopic && {
      icon: 'star', color: '#059669',
      headline: `Strongest: ${strongestTopic.name}`,
      sub: `${strongestTopic.pct}% accuracy — you know this well`,
    },
    completed.length > 0 && {
      icon: 'check_circle', color: '#0891b2',
      headline: `${completed.length} lesson${completed.length !== 1 ? 's' : ''} completed`,
      sub: completionRate >= 80 ? `${completionRate}% completion rate — you finish what you start` : `${completionRate}% of started lessons completed`,
    },
    daysOnPlatform >= 3 && {
      icon: 'calendar_month', color: '#d97706',
      headline: `${daysOnPlatform} day${daysOnPlatform !== 1 ? 's' : ''} of prep`,
      sub: `Member since ${memberSince}`,
    },
    weakestTopic && weakestTopic !== strongestTopic && {
      icon: 'trending_up', color: '#dc2626',
      headline: `Next frontier: ${weakestTopic.name}`,
      sub: `${weakestTopic.pct}% accuracy — this is where the growth is`,
    },
  ].filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
          <span className="font-sans font-bold text-[28px] text-emerald-700">{initials}</span>
        </div>
        <div className="text-center">
          <h1 className="font-sans font-bold text-[22px] text-slate-900">{name}</h1>
          <p className="font-sans text-[13px] text-slate-400 mt-0.5">Member since {memberSince}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
            <span className="material-symbols-outlined text-[14px] text-amber-600 filled">local_fire_department</span>
            <span className="font-mono text-[12px] font-bold text-amber-700">{streak} day streak</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="material-symbols-outlined text-[14px] text-emerald-600 filled">workspace_premium</span>
            <span className="font-mono text-[12px] font-bold text-emerald-700">{xp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, mono, color }) => (
          <Card key={label} className="p-4 flex flex-col gap-1">
            <p className="font-sans text-[11px] text-slate-400">{label}</p>
            <span className={`${mono ? 'font-mono' : 'font-sans'} font-bold text-[20px] ${color}`}>{value}</span>
          </Card>
        ))}
      </div>

      {storyItems.length > 0 && (
        <Card className="p-5">
          <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-4">Your Story</p>
          <div className="space-y-3">
            {storyItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: item.color + '08', border: `1px solid ${item.color}20` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: item.color + '15' }}>
                  <span className="material-symbols-outlined text-[18px] filled" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div>
                  <p className="font-sans font-semibold text-[14px] text-slate-900">{item.headline}</p>
                  <p className="font-sans text-[12px] text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <ActivityHeatmap progress={progress} />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Performance by Topic</span>
          <span className="font-sans text-[11px] text-slate-400">lower = needs work</span>
        </div>
        <MistakeBreakdown progress={progress} topics={topics} lessons={lessons} />
        {progress.filter(p => p.completed).length === 0 && (
          <p className="font-sans text-[13px] text-slate-400 text-center py-4">Complete some lessons to see your breakdown.</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[16px] text-violet-600">verified</span>
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-slate-400">Certificates</span>
        </div>
        {(() => {
          const topicLessonCount = {};
          for (const l of lessons) {
            if (!l.topic_id) continue;
            topicLessonCount[l.topic_id] = (topicLessonCount[l.topic_id] || 0) + 1;
          }
          let localCached = [];
          try {
            const raw = localStorage.getItem('aq_completed_lessons');
            localCached = raw ? JSON.parse(raw) : [];
          } catch {}
          const completedSet = new Set([
            ...progress.filter(p => p.completed === true || p.completed === 'true' || p.completed === 1 || Boolean(p.completed_at)).map(p => String(p.lesson_id)),
            ...localCached.map(String),
          ]);
          const earned = topics.filter(t => {
            const total = topicLessonCount[t.id] || 0;
            if (total === 0) return false;
            const done  = lessons.filter(l => l.topic_id === t.id && (completedSet.has(String(l.id)) || completedSet.has(String(l.slug)))).length;
            return done === total;
          });

          if (!earned.length) {
            return (
              <div className="flex flex-col items-center py-6 gap-3">
                <span className="material-symbols-outlined text-[36px] text-slate-300">verified</span>
                <p className="font-sans text-[13px] text-slate-400 text-center">Complete all lessons in a topic to earn its certificate.</p>
                <Link href="/skills" className="font-mono text-[11px] text-emerald-700 hover:underline tracking-wide">View topics →</Link>
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-3">
              {earned.map(t => {
                const color = CAT_COLOR[t.category_id] || '#059669';
                return (
                  <Link key={t.id} href={`/certificate/${t.id}`} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
                      <span className="material-symbols-outlined text-[22px] filled" style={{ color }}>verified</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-[14px] text-slate-800 group-hover:text-violet-700 transition-colors">{t.name}</p>
                      <p className="font-mono text-[11px] text-slate-400">Interview Ready</p>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-violet-500 transition-colors">open_in_new</span>
                  </Link>
                );
              })}
            </div>
          );
        })()}
      </Card>
    </div>
  );
}
