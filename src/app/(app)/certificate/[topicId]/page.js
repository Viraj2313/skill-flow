'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getTopics, getAllLessons, getUserLessonProgress, getUserProfile } from '@/lib/db';

const CAT_COLOR = {
  dsa:              { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Data Structures & Algorithms' },
  python:           { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Python' },
  'cs-fundamentals':{ color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'CS Fundamentals' },
};

function CertBadge({ topic, userName, earnedAt, totalLessons }) {
  const theme = CAT_COLOR[topic.category_id] || CAT_COLOR.dsa;
  const dateStr = earnedAt
    ? new Date(earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      id="certificate-card"
      className="relative mx-auto max-w-lg"
      style={{
        background: `linear-gradient(135deg, ${theme.bg} 0%, #ffffff 50%, ${theme.bg} 100%)`,
        border: `2px solid ${theme.border}`,
        borderRadius: 20,
        padding: '40px 36px',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[18px]"
        style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}88)` }}
      />

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">terminal</span>
          </div>
          <span className="font-sans font-bold text-[15px] text-slate-800">SkillFlow</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ backgroundColor: theme.color + '18', border: `1px solid ${theme.border}` }}
        >
          <span className="material-symbols-outlined text-[14px] filled" style={{ color: theme.color }}>verified</span>
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.color }}>
            Interview Ready
          </span>
        </div>
      </div>

      <div className="mb-8">
        <p className="font-sans text-[13px] text-slate-400 mb-1 tracking-wide">This certifies that</p>
        <h2 className="font-sans font-bold text-[28px] text-slate-900 mb-3 leading-tight">{userName}</h2>
        <p className="font-sans text-[15px] text-slate-600 leading-relaxed">
          has successfully completed all <strong>{totalLessons} lessons</strong> in the{' '}
          <strong style={{ color: theme.color }}>{topic.name}</strong> track,
          demonstrating interview-level proficiency in core concepts.
        </p>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="w-24 h-px bg-slate-300 mb-1" />
          <p className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">Date Earned</p>
          <p className="font-sans text-[13px] font-semibold text-slate-700 mt-0.5">{dateStr}</p>
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.color + '18', border: `2px solid ${theme.border}` }}
        >
          <span className="material-symbols-outlined text-[32px] filled" style={{ color: theme.color }}>verified</span>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.topicId;

  const [topic, setTopic]           = useState(null);
  const [profile, setProfile]       = useState(null);
  const [totalLessons, setTotal]    = useState(0);
  const [earnedAt, setEarnedAt]     = useState(null);
  const [eligible, setEligible]     = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }

      const [prof, topics, allLessons, userProgress] = await Promise.all([
        getUserProfile(),
        getTopics(),
        getAllLessons(),
        getUserLessonProgress(user.id),
      ]);

      const t = topics.find(t => t.id === topicId);
      if (!t) { router.push('/profile'); return; }

      const topicLessons  = allLessons.filter(l => l.topic_id === topicId);
      const completedSet  = new Set(userProgress.filter(p => p.completed).map(p => p.lesson_id));
      const allDone       = topicLessons.length > 0 && topicLessons.every(l => completedSet.has(l.id));

      if (allDone) {
        const completionDates = userProgress
          .filter(p => p.completed && topicLessons.some(l => l.id === p.lesson_id) && p.completed_at)
          .map(p => new Date(p.completed_at).getTime());
        const latestDate = completionDates.length > 0 ? Math.max(...completionDates) : Date.now();
        setEarnedAt(new Date(latestDate).toISOString());

        await supabase.from('user_certificates').upsert({
          user_id:    user.id,
          topic_id:   topicId,
          topic_name: t.name,
          earned_at:  new Date(latestDate).toISOString(),
        }, { onConflict: 'user_id,topic_id', ignoreDuplicates: true });
      }

      setTopic(t);
      setProfile(prof);
      setTotal(topicLessons.length);
      setEligible(allDone);
      setLoading(false);
    });
  }, [topicId, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-slate-400 animate-spin">progress_activity</span>
      </div>
    );
  }

  if (!eligible) {
    const theme = topic ? (CAT_COLOR[topic.category_id] || CAT_COLOR.dsa) : CAT_COLOR.dsa;
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[30px] text-slate-400">lock</span>
        </div>
        <h1 className="font-sans font-bold text-[22px] text-slate-900 mb-2">Not earned yet</h1>
        <p className="font-sans text-[14px] text-slate-500 mb-6 leading-relaxed">
          Complete all {totalLessons} lessons in{' '}
          <strong style={{ color: theme.color }}>{topic?.name}</strong> to unlock this certificate.
        </p>
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase text-white transition-colors"
          style={{ backgroundColor: theme.color }}
        >
          <span className="material-symbols-outlined text-[16px]">school</span>
          Continue Learning
        </Link>
      </div>
    );
  }

  const userName = profile?.display_name || 'Engineer';
  const theme    = CAT_COLOR[topic.category_id] || CAT_COLOR.dsa;

  return (
    <div className="max-w-2xl mx-auto pb-16 px-4">
      <div className="flex items-center gap-2 py-6 mb-2">
        <Link href="/profile" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="font-mono text-[11px] tracking-wide">Profile</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ backgroundColor: theme.color + '15', border: `1px solid ${theme.border}` }}>
          <span className="material-symbols-outlined text-[13px] filled" style={{ color: theme.color }}>verified</span>
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.color }}>Certificate Earned</span>
        </div>
        <h1 className="font-sans font-bold text-[26px] text-slate-900">You're Interview-Ready</h1>
        <p className="font-sans text-[14px] text-slate-500 mt-1">You completed every lesson in <strong>{topic.name}</strong>.</p>
      </div>

      <CertBadge
        topic={topic}
        userName={userName}
        earnedAt={earnedAt}
        totalLessons={totalLessons}
      />

      <div className="mt-8 grid grid-cols-2 gap-3">
        <Link
          href="/skills"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase border-2 border-slate-300 text-slate-700 hover:border-slate-400 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">school</span>
          More Topics
        </Link>
        <Link
          href="/interview"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono text-[12px] font-bold tracking-widest uppercase text-white transition-colors"
          style={{ backgroundColor: theme.color }}
        >
          <span className="material-symbols-outlined text-[16px]">psychology</span>
          Mock Interview
        </Link>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="font-sans text-[13px] text-slate-500 text-center leading-relaxed">
          Your next step: test yourself under real interview pressure with the{' '}
          <Link href="/interview" className="text-violet-600 font-semibold hover:underline">Interview Simulation</Link>.
        </p>
      </div>
    </div>
  );
}
