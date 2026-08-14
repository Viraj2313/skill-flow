'use client';

import { useRouter } from 'next/navigation';

export default function StreakBrokenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={{ backgroundColor: '#1a1915', backgroundImage: 'radial-gradient(rgba(155,60,60,0.06) 60%, transparent 100%)' }}>
      <div className="flex flex-col items-center gap-5 w-full max-w-sm animate-fade-in-up">
        <span className="material-symbols-outlined text-[80px] text-aq-text-muted" style={{ fontVariationSettings: "'FILL' 1" }}>
          local_fire_department
        </span>

        <div className="text-center">
          <h1 className="font-mono font-bold text-[28px] tracking-widest uppercase text-white mb-2">STREAK BROKEN</h1>
          <p className="font-sans text-body text-aq-text-secondary mb-1">Your 7-day streak has ended.</p>
          <p className="font-mono text-[11px] text-aq-text-muted tracking-widest">Don&#39;t let it happen again.</p>
        </div>

        <div className="w-full bg-aq-surface border border-aq-border rounded-card p-4 flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <p className="font-mono text-[10px] text-aq-text-muted tracking-widest uppercase mb-1">Best Streak</p>
            <span className="font-mono font-bold text-[20px] text-aq-text-secondary">21 days</span>
          </div>
          <div className="w-px h-10 bg-aq-border" />
          <div className="flex flex-col items-center flex-1">
            <p className="font-mono text-[10px] text-aq-text-muted tracking-widest uppercase mb-1">New Streak</p>
            <span className="font-mono font-bold text-[20px] text-aq-text-secondary">0</span>
          </div>
        </div>

        <p className="font-sans text-[14px] text-aq-text-secondary text-center">Rebuild your streak today.</p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => router.push('/challenge')}
            className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
          >
            TAKE TODAY&#39;S CHALLENGE
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="font-sans text-[13px] text-aq-text-muted hover:text-aq-text-secondary text-center transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
