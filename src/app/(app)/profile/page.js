'use client';

import { useRouter } from 'next/navigation';
import { MOCK_USER, MOCK_TOPICS, MOCK_RECENT_ACTIVITY } from '@/lib/mock-data';
import { Card } from '@/components/ui';

const SKILL_BARS = [
  { topic: 'Arrays', icon: 'grid_view', level: 5, max: 5 },
  { topic: 'Strings', icon: 'text_fields', level: 3, max: 5 },
  { topic: 'Recursion', icon: 'repeat', level: 2, max: 5 },
  { topic: 'Linked Lists', icon: 'link', level: 1, max: 5 },
  { topic: 'Stack', icon: 'layers', level: 0, max: 5 },
  { topic: 'Trees', icon: 'account_tree', level: 0, max: 5 },
];

const statusStyle = {
  Accepted: 'bg-aq-success-bg text-aq-success',
  'Wrong Answer': 'bg-aq-error-bg text-aq-error',
  TLE: 'bg-aq-gold-bg text-aq-gold',
};

export default function ProfilePage() {
  const user = MOCK_USER;
  const router = useRouter();

  const stats = [
    { label: 'Total XP', value: user.xp.toLocaleString(), color: 'text-aq-primary', mono: true },
    { label: 'Problems Solved', value: '47', color: 'text-aq-text-primary', mono: true },
    { label: 'Current Streak 🔥', value: `${user.streak_current} days`, color: 'text-aq-gold', mono: true },
    { label: 'Longest Streak', value: `${user.streak_best} days`, color: 'text-aq-text-primary', mono: true },
    { label: 'Weekly Rank', value: `#${user.weekly_rank}`, color: 'text-aq-primary', mono: true },
    { label: 'Member Since', value: user.member_since, color: 'text-aq-text-muted', mono: false },
  ];

  return (
    <div className="min-h-screen bg-aq-bg">
      <div className="relative px-5 pt-12 pb-5 flex flex-col items-center gap-2">
        <button onClick={() => router.push('/settings')} className="absolute top-12 right-5 w-11 h-11 flex items-center justify-center text-aq-text-muted">
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>

        <div className="w-20 h-20 rounded-full bg-aq-surface border-2 border-aq-border flex items-center justify-center paper-shadow">
          <span className="font-sans font-bold text-[32px] text-aq-text-secondary">{user.display_name[0]}</span>
        </div>
        <h2 className="font-mono font-bold text-[22px] text-aq-text-primary">{user.username}</h2>
        <p className="font-sans text-[14px] text-aq-text-secondary">{user.display_name}</p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-aq-surface border border-aq-border rounded-pill paper-shadow">
          <span className="material-symbols-outlined text-[16px] text-aq-gold filled">military_tech</span>
          <span className="font-mono text-[11px] font-semibold text-aq-text-secondary">{user.rank}</span>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, color, mono }) => (
            <Card key={label} className="p-4 flex flex-col gap-1">
              <p className="font-sans text-[12px] text-aq-text-muted">{label}</p>
              <span className={`${mono ? 'font-mono' : 'font-sans'} font-bold text-[20px] ${color}`}>{value}</span>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">SKILL BREAKDOWN</span>
          </div>
          <div className="flex flex-col gap-3">
            {SKILL_BARS.map(({ topic, icon, level, max }) => (
              <div key={topic} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[16px] text-aq-text-secondary w-4">{icon}</span>
                <span className="font-sans text-[14px] text-aq-text-primary w-24 flex-shrink-0">{topic}</span>
                <div className="flex-1 h-2 bg-aq-surface-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-aq-primary rounded-full transition-all duration-500"
                    style={{ width: `${(level / max) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-aq-text-muted w-10 text-right flex-shrink-0">Lv {level}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-1.5 mb-4">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">RECENT ACTIVITY</span>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-aq-surface border border-aq-border rounded-card">
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-[14px] text-aq-text-primary truncate">{item.title}</p>
                  <p className="font-mono text-[11px] text-aq-text-muted mt-0.5">{item.runtime} · {item.date}</p>
                </div>
                <span className={`ml-3 flex-shrink-0 px-2 py-0.5 rounded-pill font-mono text-[10px] font-semibold ${statusStyle[item.status] || 'bg-aq-surface-raised text-aq-text-muted'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
