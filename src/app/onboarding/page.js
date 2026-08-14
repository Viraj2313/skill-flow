'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const slides = [
  {
    icon: 'map',
    iconColor: 'text-aq-primary',
    title: 'Structured Roadmap',
    body: 'Navigate a curated curriculum of data structures and algorithms. Master the basics before unlocking advanced arenas.',
  },
  {
    icon: 'terminal',
    iconColor: 'text-aq-primary',
    title: 'Real-time Execution',
    body: 'Write and run code in your language of choice. Instant feedback, live test results, and performance metrics as you solve.',
  },
  {
    icon: 'workspace_premium',
    iconColor: 'text-aq-gold',
    title: 'Climb the Ranks',
    body: 'Earn XP, build streaks, and compete on the global leaderboard. Prove your logic. Achieve Grandmaster.',
    isLast: true,
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const slide = slides[current];

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
  };

  return (
    <div className="min-h-screen bg-aq-bg flex flex-col max-w-sm mx-auto">
      <div className="flex justify-end px-5 pt-14 pb-4">
        <button
          onClick={() => router.push('/login')}
          className="font-mono text-[11px] tracking-widest uppercase text-aq-text-muted hover:text-aq-text-secondary transition-colors"
        >
          SKIP
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8 gap-6">
        <div className="flex flex-col items-center gap-5 text-center animate-fade-in-up" key={current}>
          <span className={`material-symbols-outlined text-[80px] ${slide.iconColor}`}>{slide.icon}</span>
          <h2 className="font-sans font-bold text-h2 text-aq-text-primary">{slide.title}</h2>
          <p className="font-sans text-body text-aq-text-secondary max-w-[280px] leading-relaxed">{slide.body}</p>
        </div>
      </div>

      <div className="px-5 pb-12 flex flex-col gap-4">
        <div className="flex justify-center gap-2 mb-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-aq-primary' : 'w-2 h-2 bg-aq-border'}`}
            />
          ))}
        </div>

        {slide.isLast ? (
          <>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
            >
              GET STARTED →
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 border border-aq-primary text-aq-primary font-mono text-[11px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
            >
              I ALREADY HAVE AN ACCOUNT
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform"
          >
            NEXT →
          </button>
        )}
      </div>
    </div>
  );
}
