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
} from '@/lib/db';
import { Card, StatChip } from '@/components/ui';

const CAT_COLOR = {
  dsa: '#5a7a3a',
  python: '#2563a8',
  'cs-fundamentals': '#92400e',
};

const CAT_LABEL = {
  dsa: 'DSA',
  python: 'Python',
  'cs-fundamentals': 'CS Fund.',
};

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <span className="material-symbols-outlined text-[28px] text-aq-text-muted animate-spin">
        progress_activity
      </span>
    </div>
  );
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
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);

      const [prof, week, next, act, ch, lb] = await Promise.all([
        getUserProfile(),
        getWeekActivity(u.id),
        getNextLesson(u.id),
        getRecentActivity(u.id, 5),
        getDailyChallenge(),
        getLeaderboard(5),
      ]);

      setProfile(prof);
      setWeekDone(week);
      setNext(next);
      setActivity(act);
      setChallenge(ch);
      setLB(lb);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-aq-bg flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-aq-text-muted animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';
  const xp           = profile?.xp ?? 0;
  const streak       = profile?.streak_current ?? 0;

  return (
    <div className="min-h-screen bg-aq-bg">
      <header className="bg-aq-surface border-b border-aq-border sticky top-0 z-40 px-5 h-14 flex items-center justify-between">
        <span className="font-mono font-bold text-[19px] text-aq-primary tracking-tight">SkillFlow</span>
        <div className="flex items-center gap-2">
          <StatChip icon="local_fire_department" value={streak} gold />
          <StatChip icon="workspace_premium" value={xp.toLocaleString()} gold />
        </div>
      </header>

      <div className="px-5 pt-5 pb-28 space-y-4">
        <div>
          <p className="font-sans font-semibold text-[20px] text-aq-text-primary">
            Hey, {displayName} 👋
          </p>
          <p className="font-sans text-[14px] text-aq-text-muted mt-0.5">
            {streak > 0 ? `${streak} day streak — keep it going!` : 'Start your streak today.'}
          </p>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">
              THIS WEEK
            </span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined filled text-aq-gold" style={{ fontSize: 16 }}>
                local_fire_department
              </span>
              <span className="font-mono font-bold text-[14px] text-aq-text-primary">
                {streak} day streak
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {WEEK_DAYS.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="font-mono text-[10px] text-aq-text-muted">{day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    weekDone[i] ? 'bg-aq-gold' : 'border border-aq-border'
                  }`}
                >
                  {weekDone[i] && (
                    <span className="material-symbols-outlined text-white filled" style={{ fontSize: 14 }}>
                      check
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        {nextLesson && (
          <Card className="overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-aq-border flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">
                CONTINUE LEARNING
              </span>
              <span
                className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-pill"
                style={{
                  color: CAT_COLOR[nextLesson.topics?.category_id] || CAT_COLOR.dsa,
                  backgroundColor: (CAT_COLOR[nextLesson.topics?.category_id] || CAT_COLOR.dsa) + '20',
                }}
              >
                {CAT_LABEL[nextLesson.topics?.category_id] || 'DSA'}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-sans font-bold text-[17px] text-aq-text-primary mb-1">
                {nextLesson.title}
              </h3>
              <p className="font-sans text-[14px] text-aq-text-secondary mb-4 leading-relaxed">
                {nextLesson.description}
              </p>
              <Link
                href={`/lesson/${nextLesson.slug}`}
                className="block w-full py-2.5 text-white text-center font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input transition-colors"
                style={{ backgroundColor: CAT_COLOR[nextLesson.topics?.category_id] || CAT_COLOR.dsa }}
              >
                START LESSON →
              </Link>
            </div>
          </Card>
        )}
        {challenge && (
          <Card className="overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-aq-border flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">
                TODAY'S CHALLENGE
              </span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined filled text-aq-gold" style={{ fontSize: 14 }}>
                  bolt
                </span>
                <span className="font-mono text-[10px] text-aq-gold font-semibold">
                  +{challenge.bonus_xp} XP BONUS
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-sans font-bold text-[17px] text-aq-text-primary mb-1">
                {challenge.lessons?.title}
              </h3>
              <p className="font-sans text-[14px] text-aq-text-secondary mb-4 leading-relaxed">
                {challenge.lessons?.description}
              </p>
              <Link
                href={`/lesson/${challenge.lessons?.slug}`}
                className="block w-full py-2.5 bg-aq-gold text-white text-center font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input"
              >
                DO CHALLENGE →
              </Link>
            </div>
          </Card>
        )}
        <Card className="p-4">
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted mb-3 block">
            RECENT ACTIVITY
          </span>
          {activity.length === 0 ? (
            <p className="font-sans text-[14px] text-aq-text-muted text-center py-4">
              No lessons completed yet — start one!
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-aq-border">
              {activity.map((item, i) => {
                const catId = item.lessons?.topics?.category_id || 'dsa';
                const color = CAT_COLOR[catId];
                const perfect = item.correct_count === item.total_count;
                return (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <div>
                        <p className="font-sans text-[14px] text-aq-text-primary font-medium">
                          {item.lessons?.title}
                        </p>
                        <p className="font-mono text-[10px] text-aq-text-muted">
                          {CAT_LABEL[catId]} · {timeAgo(item.completed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`font-mono text-[11px] font-semibold ${perfect ? 'text-aq-success' : 'text-aq-text-muted'}`}>
                        {item.correct_count}/{item.total_count}
                      </span>
                      <span className="font-mono text-[10px] text-aq-primary">+{item.xp_earned} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">
              GLOBAL TOP
            </span>
            <Link href="/ranks" className="font-sans text-[13px] text-aq-primary">
              View All
            </Link>
          </div>
          {leaderboard.length === 0 ? (
            <p className="font-sans text-[14px] text-aq-text-muted text-center py-4">No data yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, i) => {
                const isMe = entry.id === user?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-2.5 rounded-input ${
                      isMe
                        ? 'bg-aq-primary-dim border-l-2 border-aq-primary'
                        : 'bg-aq-surface-raised'
                    }`}
                  >
                    <span
                      className={`font-mono font-bold text-[13px] w-5 ${
                        i === 0 ? 'text-aq-gold' : isMe ? 'text-aq-primary' : 'text-aq-text-muted'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${
                        isMe ? 'border-aq-primary bg-aq-primary-dim' : 'border-aq-border bg-aq-surface'
                      }`}
                    >
                      <span
                        className={`font-sans font-bold text-[12px] ${
                          isMe ? 'text-aq-primary' : 'text-aq-text-secondary'
                        }`}
                      >
                        {(entry.display_name || entry.username || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-sans font-semibold text-[14px] truncate block ${
                          isMe ? 'text-aq-primary' : 'text-aq-text-primary'
                        }`}
                      >
                        {entry.display_name || entry.username}
                        {isMe && (
                          <span className="font-normal opacity-60 ml-1 text-[13px]">(You)</span>
                        )}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold text-[13px] ${
                        isMe ? 'text-aq-primary' : 'text-aq-text-primary'
                      }`}
                    >
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
  );
}
