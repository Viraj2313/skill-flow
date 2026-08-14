'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_USER, MOCK_PROBLEMS, MOCK_LEADERBOARD, MOCK_RECENT_ACTIVITY } from '@/lib/mock-data';
import { Card, StatChip } from '@/components/ui';

const CAT_META = {
  dsa: { label: 'DSA', color: '#5a7a3a' },
  python: { label: 'Python', color: '#2563a8' },
  'cs-fundamentals': { label: 'CS Fund.', color: '#92400e' },
};

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const weekDone = [true, true, true, true, true, true, false];

export default function DashboardPage() {
  const user = MOCK_USER;
  const router = useRouter();
  const todayChallenge = MOCK_PROBLEMS.find(p => p.slug === 'dynamic-pathfinding');

  return (
    <div className="min-h-screen bg-aq-bg">
      <header className="bg-aq-surface border-b border-aq-border sticky top-0 z-40 px-5 h-14 flex items-center justify-between">
        <span className="font-mono font-bold text-[19px] text-aq-primary tracking-tight">SkillFlow</span>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/search')} className="p-1.5 text-aq-text-muted hover:text-aq-text-secondary">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>
          <StatChip icon="local_fire_department" value={user.streak_current} gold />
          <StatChip icon="workspace_premium" value={user.xp.toLocaleString()} gold />
        </div>
      </header>

      <div className="px-5 pt-5 pb-28 space-y-4">
        <div>
          <p className="font-sans font-semibold text-[20px] text-aq-text-primary">Hey, {user.display_name} 👋</p>
          <p className="font-sans text-[14px] text-aq-text-muted mt-0.5">Keep the streak alive.</p>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">THIS WEEK</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined filled text-aq-gold" style={{ fontSize: 16 }}>local_fire_department</span>
              <span className="font-mono font-bold text-[14px] text-aq-text-primary">{user.streak_current} day streak</span>
            </div>
          </div>
          <div className="flex gap-2">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="font-mono text-[10px] text-aq-text-muted">{day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    weekDone[i] ? 'bg-aq-gold' : 'border border-aq-border'
                  }`}
                >
                  {weekDone[i] && (
                    <span className="material-symbols-outlined text-white filled" style={{ fontSize: 14 }}>check</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-aq-border flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">TODAY'S CHALLENGE</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined filled text-aq-gold" style={{ fontSize: 14 }}>bolt</span>
              <span className="font-mono text-[10px] text-aq-gold font-semibold">+200 XP BONUS</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-pill border border-aq-gold text-aq-gold font-semibold tracking-widest">MEDIUM</span>
                <h3 className="font-sans font-bold text-[17px] text-aq-text-primary mt-2">Dynamic Pathfinding</h3>
              </div>
              <span className="font-mono text-[12px] text-aq-text-muted flex-shrink-0 mt-1">+75 XP</span>
            </div>
            <p className="font-sans text-[14px] text-aq-text-secondary mb-4 leading-relaxed">
              Find the minimum cost path from top-left to bottom-right of a grid using dynamic programming.
            </p>
            <Link
              href="/lesson/arrays-two-pointer"
              className="block w-full py-2.5 bg-aq-primary text-white text-center font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-primary-hover transition-colors"
            >
              START LESSON →
            </Link>
          </div>
        </Card>

        <Card className="p-4">
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted mb-3 block">RECENT ACTIVITY</span>
          <div className="flex flex-col divide-y divide-aq-border">
            {MOCK_RECENT_ACTIVITY.map((item, i) => {
              const meta = CAT_META[item.category];
              return (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta?.color || '#9c9284' }} />
                    <div>
                      <p className="font-sans text-[14px] text-aq-text-primary font-medium">{item.title}</p>
                      <p className="font-mono text-[10px] text-aq-text-muted">{meta?.label} · {item.date}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-[11px] font-semibold ${item.status === 'Accepted' ? 'text-aq-success' : 'text-aq-error'}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">GLOBAL TOP</span>
            <Link href="/ranks" className="font-sans text-[13px] text-aq-primary">View All</Link>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_LEADERBOARD.slice(0, 3).map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3 p-2.5 rounded-input bg-aq-surface-raised">
                <span className={`font-mono font-bold text-[13px] w-5 ${entry.rank === 1 ? 'text-aq-gold' : 'text-aq-text-muted'}`}>{entry.rank}</span>
                <div className="w-7 h-7 rounded-full bg-aq-surface border border-aq-border flex items-center justify-center flex-shrink-0">
                  <span className="font-sans font-bold text-[12px] text-aq-text-secondary">{entry.username[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-sans font-semibold text-[14px] text-aq-text-primary truncate block">{entry.username}</span>
                  <p className="font-mono text-[10px] text-aq-text-muted">{entry.rank_title}</p>
                </div>
                <span className="font-mono font-bold text-[13px] text-aq-primary">{entry.xp.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 p-2.5 rounded-input bg-aq-primary-dim border-l-2 border-aq-primary mt-1">
              <span className="font-mono font-bold text-[13px] w-5 text-aq-primary">23</span>
              <div className="w-7 h-7 rounded-full bg-aq-primary-dim border border-aq-primary flex items-center justify-center flex-shrink-0">
                <span className="font-sans font-bold text-[12px] text-aq-primary">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-sans font-bold text-[14px] text-aq-primary">AlexCodes <span className="font-normal opacity-60">(You)</span></span>
                <p className="font-mono text-[10px] text-aq-primary-text">Problem Solver</p>
              </div>
              <span className="font-mono font-bold text-[13px] text-aq-primary">2,450</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
