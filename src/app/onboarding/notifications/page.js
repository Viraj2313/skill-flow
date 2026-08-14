'use client';

import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="dark-bg min-h-screen flex flex-col items-center justify-center p-5">
      <div className="bg-aq-surface border border-aq-border rounded-[24px] w-full max-w-[340px] p-6 flex flex-col items-center gap-5 paper-shadow">
        <div className="relative flex items-center justify-center mt-2">
          <span className="absolute w-16 h-16 rounded-full border-2 border-aq-primary opacity-20 animate-ripple" />
          <span className="absolute w-12 h-12 rounded-full border-2 border-aq-primary opacity-30 animate-ripple" style={{ animationDelay: '0.4s' }} />
          <span className="material-symbols-outlined text-aq-primary text-[48px] filled">notifications</span>
        </div>

        <div className="text-center">
          <h2 className="font-mono font-bold text-[22px] tracking-widest uppercase text-aq-text-primary mb-2">STAY IN THE FIGHT</h2>
          <p className="font-sans text-body text-aq-text-secondary">
            Get daily challenge alerts, streak reminders, and rank notifications so you never miss a day.
          </p>
        </div>

        <div className="w-full border-t border-aq-border" />

        <div className="w-full flex flex-col gap-3">
          {[
            { icon: 'notifications', text: 'Daily challenge reminder at 8am', gold: false },
            { icon: 'local_fire_department', text: 'Streak alert before midnight', gold: true },
            { icon: 'emoji_events', text: 'Rank change notifications', gold: false },
          ].map(({ icon, text, gold }) => (
            <div key={text} className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-[20px] ${gold ? 'text-aq-gold filled' : 'text-aq-text-secondary'}`}>{icon}</span>
              <span className="font-sans text-[14px] text-aq-text-secondary">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
        >
          ALLOW NOTIFICATIONS
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="font-sans text-[13px] text-aq-text-muted hover:text-aq-text-secondary transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
