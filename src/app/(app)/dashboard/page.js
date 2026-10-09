'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getUserProfile,
  getRecentActivity,
  getNextLesson,
  getWeekActivity,
  getDailyChallenge,
  getLeaderboard,
  getTopics,
  getAllLessons,
  getUserLessonProgress,
} from '@/lib/db';
import { Card, StatChip } from '@/components/ui';

const CAT_THEME = {
  dsa: {
    label: 'DSA',
    name: 'Data Structures & Algorithms',
    color: '#059669',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
  },
  python: {
    label: 'Prog. Languages',
    name: 'Programming Languages',
    color: '#2563eb',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100/80 text-blue-800 border-blue-200',
  },
  'cs-fundamentals': {
    label: 'CS Fund.',
    name: 'CS Fundamentals',
    color: '#d97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100/80 text-amber-800 border-amber-200',
  },
};

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function Sk({ w = '100%', h = 14, r = 8, mb = 0 }) {
  return (
    <div className="skeleton-pulse" style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: '#f1f5f9' }} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-slate-200/80 space-y-2">
        <Sk w={220} h={26} />
        <Sk w={180} h={14} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e8edf2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="px-6 py-4 border-b border-slate-100" style={{ background: '#f8fafc' }}>
              <Sk w={80} h={12} />
            </div>
            <div className="p-6 space-y-3">
              <Sk w={'55%'} h={20} />
              <Sk w={'88%'} h={13} />
              <Sk w={'72%'} h={13} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="p-4 rounded-xl" style={{ background: '#fff', border: '1px solid #e8edf2' }}>
                <Sk w={'65%'} h={13} mb={8} />
                <Sk w={'45%'} h={11} mb={12} />
                <Sk h={4} r={4} />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid #e8edf2' }}>
            <Sk w={70} h={11} mb={16} />
            <div className="grid grid-cols-7 gap-1.5">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Sk w={12} h={10} />
                  <Sk w={32} h={32} r={8} />
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid #e8edf2' }}>
            <Sk w={100} h={11} mb={16} />
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <Sk w={'52%'} h={13} />
                <Sk w={'20%'} h={11} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);
  const [weekDone, setWeekDone]   = useState(Array(7).fill(false));
  const [nextLesson, setNext]     = useState(null);
  const [activity, setActivity]   = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLB]      = useState([]);
  const [trackStats, setTrackStats] = useState([]);
  const [weakSpots, setWeakSpots] = useState([]);
  const [reviewDue, setReviewDue] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);

      const [prof, week, next, act, ch, lb, topics, lessons, userProgress] = await Promise.all([
        getUserProfile(),
        getWeekActivity(u.id),
        getNextLesson(u.id),
        getRecentActivity(u.id, 5),
        getDailyChallenge(),
        getLeaderboard(5),
        getTopics(),
        getAllLessons(),
        getUserLessonProgress(u.id),
      ]);

      const completedSet = new Set((userProgress || []).filter(p => p.completed).map(p => p.lesson_id));
      
      const tracks = ['dsa', 'python', 'cs-fundamentals'].map((catId) => {
        const catTopics = (topics || []).filter(t => t.category_id === catId);
        const catLessons = (lessons || []).filter(l => catTopics.some(t => t.id === l.topic_id));
        const done = catLessons.filter(l => completedSet.has(l.id)).length;
        const total = catLessons.length;
        return {
          id: catId,
          ...CAT_THEME[catId],
          done,
          total,
          pct: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      });

      const spots = (userProgress || [])
        .filter(p => p.total_count > 0 && p.correct_count / p.total_count < 0.75)
        .sort((a, b) => (a.correct_count / a.total_count) - (b.correct_count / b.total_count))
        .slice(0, 3)
        .map(p => ({
          lessonId:  p.lesson_id,
          title:     p.lessons?.title || 'Unknown Lesson',
          slug:      p.lessons?.slug,
          topicId:   p.lessons?.topic_id,
          topicName: p.lessons?.topics?.name || p.lessons?.title,
          pct:       Math.round((p.correct_count / p.total_count) * 100),
          wrongCount: (p.total_count || 0) - (p.correct_count || 0),
          catId:     p.lessons?.topics?.category_id || 'dsa',
        }));

      const now = Date.now();
      const due = (userProgress || [])
        .filter(p => p.completed && p.completed_at && p.lessons?.slug)
        .map(p => {
          const score = p.total_count > 0 ? p.correct_count / p.total_count : 0;
          const intervalDays = score < 0.8 ? 1 : score < 1 ? 3 : 7;
          const completedMs  = new Date(p.completed_at).getTime();
          const dueMs        = completedMs + intervalDays * 86_400_000;
          return { ...p, dueMs, intervalDays, score };
        })
        .filter(p => p.dueMs <= now)
        .sort((a, b) => a.dueMs - b.dueMs)
        .slice(0, 4)
        .map(p => ({
          title:    p.lessons?.title || 'Lesson',
          slug:     p.lessons?.slug,
          score:    Math.round(p.score * 100),
          catId:    p.lessons?.topics?.category_id || 'dsa',
          daysAgo:  Math.floor((now - new Date(p.completed_at).getTime()) / 86_400_000),
        }));

      setProfile(prof);
      setWeekDone(week);
      setNext(next);
      setActivity(act);
      setChallenge(ch);
      setLB(lb);
      setTrackStats(tracks);
      setWeakSpots(spots);
      setReviewDue(due);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <DashboardSkeleton />;

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Engineer';
  const xp          = profile?.xp ?? 0;
  const streak      = profile?.streak_current ?? 0;
  const nextCatId   = nextLesson?.topics?.category_id || 'dsa';
  const nextTheme   = CAT_THEME[nextCatId] || CAT_THEME.dsa;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="font-sans font-bold text-[24px] sm:text-[28px] text-slate-900 tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="font-sans text-[14px] text-slate-500 mt-1">
            {streak > 0 ? `${streak} day streak. Keep building momentum.` : 'Start your streak with a quick lesson today.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <StatChip icon="local_fire_department" value={`${streak} days`} gold />
          <StatChip icon="workspace_premium" value={`${xp.toLocaleString()} XP`} gold />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {nextLesson && (
            <Card className="overflow-hidden border-slate-200 bg-white">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: nextTheme.color }} />
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Up Next
                  </span>
                </div>
                <span className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${nextTheme.badge}`}>
                  {nextTheme.name}
                </span>
              </div>
              <div className="p-6">
                <h2 className="font-sans font-bold text-[20px] text-slate-900 mb-2">
                  {nextLesson.title}
                </h2>
                <p className="font-sans text-[14px] text-slate-600 mb-6 leading-relaxed">
                  {nextLesson.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 font-mono text-[12px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600 filled">bolt</span>
                      +{nextLesson.xp_reward || 25} XP
                    </span>
                    <span>•</span>
                    <span>{nextLesson.exercises?.length || 4} Exercises</span>
                  </div>

                  <Link
                    href={`/lesson/${nextLesson.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-sans text-[13px] font-semibold text-white transition-all shadow-sm hover:shadow-md"
                    style={{ backgroundColor: nextTheme.color }}
                  >
                    <span>Start Lesson</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {reviewDue.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600 filled">replay</span>
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Due for Review</span>
                </div>
                <span className="font-sans text-[11px] text-slate-400">Spaced repetition</span>
              </div>
              <div className="divide-y divide-slate-100">
                {reviewDue.map((item, i) => {
                  const theme = CAT_THEME[item.catId] || CAT_THEME.dsa;
                  return (
                    <Link
                      key={i}
                      href={`/lesson/${item.slug}`}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: theme.color + '15' }}>
                        <span className="material-symbols-outlined text-[16px]" style={{ color: theme.color }}>replay</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[14px] font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{item.title}</p>
                        <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {item.daysAgo === 0 ? 'Completed today' : `${item.daysAgo}d ago`}
                          {' \u00b7 '}scored {item.score}%
                        </p>
                      </div>
                      <span className="font-sans text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">Review</span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          {challenge && (
            <Card className="overflow-hidden border-amber-200/80 bg-linear-to-r from-amber-50/30 via-white to-white">
              <div className="px-6 py-3.5 border-b border-amber-100 bg-amber-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-600 filled">bolt</span>
                  <span className="font-mono text-[11px] font-bold tracking-wider text-amber-900 uppercase">
                    Daily Challenge
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  +{challenge.bonus_xp} XP Bonus
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-sans font-bold text-[17px] text-slate-900 mb-1.5">
                  {challenge.lessons?.title}
                </h3>
                <p className="font-sans text-[14px] text-slate-600 mb-4 leading-relaxed">
                  {challenge.lessons?.description}
                </p>
                <div className="flex justify-end">
                  <Link
                    href={`/lesson/${challenge.lessons?.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sans text-[13px] font-semibold shadow-xs transition-colors"
                  >
                    <span>Solve Challenge</span>
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          <Link href="/interview" className="block">
            <Card className="overflow-hidden border-violet-200/80 hover:border-violet-300 transition-all bg-gradient-to-r from-violet-50/40 via-white to-white cursor-pointer group">
              <div className="px-6 py-3.5 border-b border-violet-100 bg-violet-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-violet-600 filled">psychology</span>
                  <span className="font-mono text-[11px] font-bold tracking-wider text-violet-900 uppercase">Interview Mode</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-800 border border-violet-200">AI Debrief</span>
              </div>
              <div className="p-6">
                <h3 className="font-sans font-bold text-[17px] text-slate-900 mb-1.5 group-hover:text-violet-800 transition-colors">
                  45-min Mock Technical Interview
                </h3>
                <p className="font-sans text-[14px] text-slate-600 mb-4 leading-relaxed">
                  Timed questions from your chosen topic. Get a real interviewer-style debrief: verdict, strengths, weaknesses, and what to study next.
                </p>
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white font-sans text-[13px] font-semibold shadow-sm group-hover:bg-violet-700 transition-colors">
                    <span>Begin Interview</span>
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/evolutions" className="block">
            <Card className="overflow-hidden border-orange-200/80 hover:border-orange-300 transition-all bg-gradient-to-r from-orange-50/40 via-white to-white cursor-pointer group">
              <div className="px-6 py-3.5 border-b border-orange-100 bg-orange-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-orange-600">trending_up</span>
                  <span className="font-mono text-[11px] font-bold tracking-wider text-orange-900 uppercase">Code Evolution</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">5 Problems</span>
              </div>
              <div className="p-6">
                <h3 className="font-sans font-bold text-[17px] text-slate-900 mb-1.5 group-hover:text-orange-800 transition-colors">
                  Brute Force → Optimal: See the Journey
                </h3>
                <p className="font-sans text-[14px] text-slate-600 mb-4 leading-relaxed">
                  Step through Two Sum, Sliding Window, Palindrome and more. Watch exactly how the naive O(n²) solution evolves into the elegant O(n) one — with the key insight explained at each step.
                </p>
                <div className="flex justify-end">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-sans text-[13px] font-semibold shadow-sm group-hover:bg-orange-700 transition-colors">
                    <span>Explore</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="overflow-hidden border-slate-200 bg-white">
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[17px] text-red-600 filled">my_location</span>
                <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-700 uppercase">
                  Where You Lack (Weak Spots)
                </span>
                {weakSpots.length > 0 && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                    {weakSpots.length} Needs Attention
                  </span>
                )}
              </div>
              <Link href="/focus?tab=weak-spots" className="font-sans text-[12px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
                <span>Open Weak Spots Hub</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-[17px] text-slate-900">
                    Instantly Spot What You Got Wrong & Practice Again
                  </h3>
                  <p className="font-sans text-[13px] text-slate-600 max-w-lg leading-relaxed">
                    Review your weakest topics below. Jump directly to learn the core concepts or launch a targeted practice drill in 1 click.
                  </p>
                </div>
                <Link
                  href="/focus?tab=weak-spots"
                  className="btn-tactile px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 border-b-[3.5px] border-black text-white shrink-0 flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">my_location</span>
                  <span>Where I Lack Hub</span>
                </Link>
              </div>

              {weakSpots.length > 0 ? (
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Priority Topics Needing Practice
                  </span>
                  <div className="space-y-2">
                    {weakSpots.map((spot, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-sans text-[13.5px] font-bold text-slate-800 truncate">
                              {spot.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                                {spot.pct}% Accuracy
                              </span>
                              {spot.wrongCount > 0 && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  • {spot.wrongCount} missed questions
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <Link
                            href={spot.slug ? `/lesson/${spot.slug}` : '/skills'}
                            className="btn-tactile btn-tactile-secondary px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-700 hover:text-slate-900"
                          >
                            <span className="material-symbols-outlined text-[13px] text-emerald-600">menu_book</span>
                            <span>Learn</span>
                          </Link>

                          <Link
                            href={`/focus?tab=weak-spots${spot.slug ? `&retestTopic=${spot.slug}` : ''}`}
                            className="btn-tactile btn-tactile-primary px-3 py-1.5 rounded-lg font-mono text-[10.5px] font-bold uppercase tracking-wider text-white flex items-center gap-1 shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[13px]">bolt</span>
                            <span>Practice</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-[13px]">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 filled">check_circle</span>
                  <span>No weak spots detected yet! Keep solving exercises to benchmark your accuracy.</span>
                </div>
              )}
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Curriculum Tracks
              </span>
              <Link href="/skills" className="font-sans text-[13px] font-medium text-emerald-700 hover:underline">
                View all topics →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trackStats.map((track) => (
                <Link
                  key={track.id}
                  href="/skills"
                  className="p-4 bg-white border border-slate-200 rounded-xl card-shadow hover:border-slate-300 transition-all block group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold"
                      style={{ backgroundColor: track.color + '15', color: track.color }}
                    >
                      {track.label[0]}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {track.pct}%
                    </span>
                  </div>
                  <h4 className="font-sans font-semibold text-[14px] text-slate-900 group-hover:text-emerald-700 transition-colors mb-1 truncate">
                    {track.name}
                  </h4>
                  <p className="font-mono text-[11px] text-slate-400 mb-3">
                    {track.done}/{track.total} completed
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${track.pct}%`, backgroundColor: track.color }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                This Week
              </span>
              <div className="flex items-center gap-1 text-amber-600 font-mono text-[12px] font-bold">
                <span className="material-symbols-outlined text-[16px] filled">local_fire_department</span>
                <span>{streak}d</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAYS.map((day, i) => {
                const isDone = weekDone[i];
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400 font-medium">{day}</span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-mono transition-colors ${
                        isDone
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                      }`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-[16px] text-white filled">check</span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3.5">
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Recent Activity
              </span>
            </div>
            {activity.length === 0 ? (
              <div className="py-6 text-center">
                <span className="material-symbols-outlined text-[28px] text-slate-300 mb-1 block">history</span>
                <p className="font-sans text-[13px] text-slate-400">No lessons completed yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activity.map((item, i) => {
                  const catId = item.lessons?.topics?.category_id || 'dsa';
                  const theme = CAT_THEME[catId] || CAT_THEME.dsa;
                  const perfect = item.correct_count === item.total_count;
                  return (
                    <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                        <div className="min-w-0">
                          <p className="font-sans font-medium text-[13px] text-slate-800 truncate">
                            {item.lessons?.title}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {theme.label} • {timeAgo(item.completed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-mono text-[11px] font-semibold ${perfect ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {item.correct_count}/{item.total_count}
                        </span>
                        <p className="font-mono text-[10px] text-slate-400">+{item.xp_earned} XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3.5">
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Leaderboard
              </span>
              <Link href="/ranks" className="font-sans text-[12px] font-medium text-emerald-700 hover:underline">
                View all
              </Link>
            </div>
            {leaderboard.length === 0 ? (
              <p className="font-sans text-[13px] text-slate-400 py-4 text-center">No rankings yet.</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => {
                  const isMe = entry.id === user?.id;
                  const rankColors = [
                    'text-amber-600 font-bold',
                    'text-slate-500 font-semibold',
                    'text-amber-800 font-semibold',
                  ];
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isMe
                          ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-medium'
                          : 'bg-slate-50/60 border border-slate-100 text-slate-700'
                      }`}
                    >
                      <span className={`font-mono text-[12px] w-4 text-center ${rankColors[i] || 'text-slate-400'}`}>
                        {i + 1}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[11px] font-bold text-slate-600">
                        {(entry.display_name || entry.username || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-sans text-[13px] truncate block">
                          {entry.display_name || entry.username}
                          {isMe && <span className="text-[11px] text-emerald-700 ml-1 font-normal">(You)</span>}
                        </span>
                      </div>
                      <span className="font-mono text-[12px] font-semibold text-slate-800">
                        {(entry.xp || 0).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
