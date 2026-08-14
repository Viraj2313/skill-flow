'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

function Particle({ angle, distance }) {
  const style = {
    '--tx': `${Math.cos(angle) * distance}px`,
    '--ty': `${Math.sin(angle) * distance}px`,
    left: '50%',
    top: '50%',
    animationDelay: `${Math.random() * 0.3}s`,
  };
  return (
    <div
      className="absolute w-1.5 h-1.5 rounded-full bg-aq-gold animate-particle"
      style={style}
    />
  );
}

export default function RankUpPage() {
  const router = useRouter();
  const particles = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * 2 * Math.PI,
    distance: 80 + Math.random() * 60,
  }));

  return (
    <div className="dark-bg min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <Particle key={i} angle={p.angle} distance={p.distance} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-sm">
        <div className="animate-spin-in">
          <span className="material-symbols-outlined text-[100px] text-aq-gold filled">military_tech</span>
        </div>

        <h1 className="font-mono font-bold text-[32px] tracking-widest uppercase text-aq-gold animate-fade-in-up">RANK UP!</h1>

        <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="font-sans text-[16px] text-aq-text-muted line-through">Coder</span>
          <span className="font-mono font-bold text-[18px] text-aq-primary">→</span>
          <span className="font-sans font-bold text-[20px] text-aq-primary">Problem Solver</span>
        </div>

        <div className="w-full bg-aq-surface border border-aq-border rounded-card p-6 flex flex-col items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <span className="material-symbols-outlined text-[64px] text-aq-gold filled">military_tech</span>
          <h2 className="font-sans font-bold text-h2 text-aq-gold">Problem Solver</h2>
          <p className="font-mono text-[11px] text-aq-text-muted tracking-widest">Unlocked at 2,000 XP</p>
          <div className="w-full border-t border-aq-border pt-3 text-center">
            <span className="font-mono font-bold text-[24px] text-aq-gold">+250 XP</span>
            <p className="font-mono text-[10px] text-aq-text-muted mt-1 tracking-widest">EARNED THIS MILESTONE</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3.5 bg-aq-primary text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-transform mt-2 animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          AWESOME!
        </button>
      </div>
    </div>
  );
}
