'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_DAILY_CHALLENGE, MOCK_USER } from '@/lib/mock-data';
import { Card, DifficultyBadge } from '@/components/ui';

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, target - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function pad(n) { return String(n).padStart(2, '0'); }

export default function ChallengePage() {
  const router = useRouter();
  const challenge = MOCK_DAILY_CHALLENGE;
  const { h, m, s } = useCountdown(challenge.resets_at.getTime());

  return (
    <div className="min-h-screen bg-aq-bg">
      <header className="bg-aq-surface border-b border-aq-border sticky top-0 z-40 px-5 h-14 flex items-center">
        <h1 className="font-sans font-bold text-h2 text-aq-text-primary">Daily Challenge</h1>
      </header>

      <div className="px-5 pt-5 pb-6 space-y-4">
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-aq-border">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-aq-primary text-white rounded-pill font-mono text-[10px] font-semibold tracking-widest mb-3">
              <span className="material-symbols-outlined text-[14px] filled">bolt</span>
              DAILY CHALLENGE
            </div>
            <h2 className="font-sans font-bold text-h2 text-aq-text-primary mb-2">{challenge.problem.title}</h2>
            <div className="flex items-center gap-2 mb-4">
              <DifficultyBadge difficulty={challenge.problem.difficulty} />
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-aq-gold-bg text-aq-gold rounded-pill font-mono text-[10px] font-semibold">
                ⚡ +{challenge.bonus_xp} XP BONUS
              </span>
            </div>
            <div className="flex flex-col items-center py-2">
              <span className="font-mono text-[10px] text-aq-text-muted tracking-widest uppercase mb-2">RESETS IN</span>
              <div className="flex items-end gap-3">
                {[
                  { val: pad(h), label: 'HRS' },
                  { sep: true },
                  { val: pad(m), label: 'MIN' },
                  { sep: true },
                  { val: pad(s), label: 'SEC' },
                ].map((item, i) =>
                  item.sep ? (
                    <span key={i} className="font-mono font-bold text-[36px] text-aq-primary mb-2">:</span>
                  ) : (
                    <div key={i} className="flex flex-col items-center">
                      <span className="font-mono font-bold text-[36px] text-aq-primary leading-none">{item.val}</span>
                      <span className="font-mono text-[9px] text-aq-text-muted tracking-widest mt-1">{item.label}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="font-sans text-[14px] text-aq-text-secondary mb-3 line-clamp-3">{challenge.problem.description}</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 flex-wrap">
              {['Array', 'DP', 'Grid'].map(tag => (
                <span key={tag} className="flex-shrink-0 px-2.5 py-1 bg-aq-surface-raised border border-aq-border rounded-pill font-mono text-[10px] text-aq-text-secondary">{tag}</span>
              ))}
            </div>
            <button
              onClick={() => router.push(`/editor/${challenge.problem.slug}`)}
              className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
            >
              START CHALLENGE →
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-aq-gold filled">local_fire_department</span>
              <div>
                <p className="font-sans font-bold text-[15px] text-aq-text-primary">You&#39;re on a 7-day streak!</p>
                <p className="font-sans text-[13px] text-aq-text-secondary">Keep it going.</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-aq-text-muted">chevron_right</span>
          </div>

          <div className="flex justify-between items-center px-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const done = challenge.streak_days[i];
              const isToday = i === 5;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[9px] text-aq-text-muted">{day}</span>
                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center ${
                    done ? 'bg-aq-gold' : 'border border-aq-border bg-transparent'
                  }`}>
                    {done && <span className="material-symbols-outlined text-[14px] text-white filled">check</span>}
                    {isToday && !done && (
                      <span className="absolute inset-0 rounded-full border-2 border-aq-primary animate-ripple" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
