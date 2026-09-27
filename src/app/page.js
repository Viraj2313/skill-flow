'use client';

import Link from 'next/link';

const categories = [
  {
    id: 'dsa',
    label: 'Data Structures & Algorithms',
    desc: 'Arrays, Trees, Graphs, DP — the core of every technical interview.',
    icon: 'account_tree',
    count: '8 topics · 80+ problems',
    color: 'var(--color-cat-dsa)',
    dimColor: 'var(--color-cat-dsa-dim)',
    textColor: 'var(--color-cat-dsa-text)',
  },
  {
    id: 'python',
    label: 'Python',
    desc: 'Write idiomatic Python. Master decorators, OOP, and built-in libraries.',
    icon: 'code',
    count: '3 topics · 30+ problems',
    color: 'var(--color-cat-python)',
    dimColor: 'var(--color-cat-python-dim)',
    textColor: 'var(--color-cat-python-text)',
  },
  {
    id: 'cs-fundamentals',
    label: 'CS Fundamentals',
    desc: 'Big-O, memory models, sorting, OOP principles — the theory behind the code.',
    icon: 'school',
    count: '4 topics · 40+ problems',
    color: 'var(--color-cat-cs)',
    dimColor: 'var(--color-cat-cs-dim)',
    textColor: 'var(--color-cat-cs-text)',
  },
];

const features = [
  {
    icon: 'layers',
    title: 'Structured Levels',
    body: "Each topic has 5 levels - from basic recognition to interview-grade fluency. You earn each level, you don't skip it.",
  },
  {
    icon: 'bolt',
    title: 'Daily Challenge',
    body: 'One focused problem every 24 hours across all categories. Bonus XP for completing it before midnight.',
  },
  {
    icon: 'local_fire_department',
    title: 'Streak System',
    body: 'Miss a day and your streak resets. Keep it alive and your rank climbs. Consistency is the metric.',
  },
  {
    icon: 'smart_toy',
    title: 'AI Code Review',
    body: 'Submit your solution and get instant feedback on time complexity, edge cases, and code style.',
  },
  {
    icon: 'emoji_events',
    title: 'Weekly Rankings',
    body: 'Compete in weekly divisions across all skill areas. Top performers get promoted. The grind is real.',
  },
  {
    icon: 'workspace_premium',
    title: 'XP & Rank Progression',
    body: 'Every problem solved, every streak kept, every daily completed — it adds up across every category.',
  },
];

const stats = [
  { value: '150+', label: 'Problems' },
  { value: '3', label: 'Categories' },
  { value: '15', label: 'Topics' },
  { value: '5', label: 'Rank Tiers' },
];

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const weekDone = [true, true, true, true, true, true, false];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-aq-bg">

      <header className="sticky top-0 z-50 bg-aq-surface/90 backdrop-blur-sm border-b border-aq-border">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-mono font-bold text-[19px] text-aq-primary tracking-tight">SkillFlow</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="font-mono text-[12px] font-semibold tracking-widest uppercase text-aq-text-secondary hover:text-aq-text-primary transition-colors">
              Log In
            </Link>
            <Link href="/register" className="px-4 py-2 bg-aq-primary text-white font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-primary-hover transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-aq-primary-dim border border-aq-primary rounded-pill font-mono text-[11px] font-semibold text-aq-primary-text tracking-widest mb-8">
          <span className="material-symbols-outlined filled" style={{ fontSize: 13 }}>local_fire_department</span>
          DAILY PRACTICE · REAL INTERVIEWS
        </div>

        <h1 className="font-sans font-bold text-[44px] md:text-[60px] leading-[1.1] text-aq-text-primary mb-5 tracking-tight">
          Master every interview topic.<br />
          <span className="text-aq-primary">DSA, Python &amp; CS — daily.</span>
        </h1>

        <p className="font-sans text-[17px] text-aq-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
          SkillFlow covers DSA, Python, and CS fundamentals through short daily lessons and targeted problems — built for consistency, not cramming.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-aq-primary hover:bg-aq-primary-hover text-white font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input transition-colors">
            START FOR FREE →
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 border border-aq-border text-aq-text-secondary font-mono text-[12px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-surface-raised transition-colors">
            SIGN IN
          </Link>
        </div>
      </section>

      <section className="border-y border-aq-border bg-aq-surface py-10">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="font-mono font-bold text-[34px] text-aq-primary">{value}</span>
                <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">WHAT YOU MASTER</span>
          <h2 className="font-sans font-bold text-[30px] text-aq-text-primary mt-2">Three categories. One daily habit.</h2>
          <p className="font-sans text-[15px] text-aq-text-secondary mt-3 max-w-lg mx-auto">
            Every category follows the same structured level system. Progress unlocks as you advance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-aq-surface border border-aq-border rounded-card p-6 card-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: cat.dimColor }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: cat.color }}>{cat.icon}</span>
              </div>
              <h3 className="font-sans font-bold text-[16px] text-aq-text-primary mb-1.5">{cat.label}</h3>
              <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed mb-4">{cat.desc}</p>
              <span
                className="font-mono text-[10px] font-semibold tracking-widest"
                style={{ color: cat.textColor }}
              >
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-aq-surface border-y border-aq-border py-16">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">THE METHOD</span>
              <h2 className="font-sans font-bold text-[28px] text-aq-text-primary mt-2 mb-4">5 levels per topic.</h2>
              <p className="font-sans text-[15px] text-aq-text-secondary leading-relaxed mb-4">
                Start with recognition — understand the concept. End at interview-grade — solve it cold, fast, under pressure.
              </p>
              <p className="font-sans text-[15px] text-aq-text-secondary leading-relaxed">
                You unlock each level by demonstrating mastery. No skipping, no shortcuts.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-56">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-[13px] ${level <= 3 ? 'bg-aq-primary text-white' : 'border border-aq-border text-aq-text-muted'}`}>
                    {level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-[13px] text-aq-text-primary font-medium">
                        {['Recognition', 'Basic Solving', 'Pattern Fluency', 'Optimization', 'Interview Ready'][level - 1]}
                      </span>
                      {level <= 3 && <span className="material-symbols-outlined text-aq-success filled" style={{ fontSize: 14 }}>check_circle</span>}
                    </div>
                    <div className="h-1 bg-aq-surface-raised rounded-full overflow-hidden">
                      <div className="h-full bg-aq-primary rounded-full" style={{ width: `${level <= 3 ? 100 : level === 4 ? 0 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-1">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">STREAK SYSTEM</span>
            <h2 className="font-sans font-bold text-[28px] text-aq-text-primary mt-2 mb-4">Show up every day.</h2>
            <p className="font-sans text-[15px] text-aq-text-secondary leading-relaxed">
              Your streak is your discipline score. Miss one day and it resets to zero. Keep it alive and your rank climbs. Simple. Ruthless. Effective.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-aq-surface border border-aq-border rounded-card p-5 card-shadow w-full md:w-64">
              <div className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted mb-4">THIS WEEK</div>
              <div className="flex gap-2 mb-4">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="font-mono text-[10px] text-aq-text-muted">{day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${weekDone[i] ? 'bg-aq-gold' : 'border border-aq-border'}`}>
                      {weekDone[i] && <span className="material-symbols-outlined text-white filled" style={{ fontSize: 15 }}>check</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-aq-border">
                <span className="material-symbols-outlined text-aq-gold filled" style={{ fontSize: 26 }}>local_fire_department</span>
                <span className="font-mono font-bold text-[26px] text-aq-text-primary">6</span>
                <span className="font-mono text-[12px] text-aq-text-muted">day streak</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-aq-surface border-y border-aq-border py-20">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">BUILT FOR INTERVIEWS</span>
            <h2 className="font-sans font-bold text-[30px] text-aq-text-primary mt-2">Everything you need. Nothing you don't.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon, title, body }) => (
              <div key={title} className="bg-aq-bg border border-aq-border rounded-card p-5 hover:border-aq-border-strong transition-colors">
                <span className="material-symbols-outlined text-aq-primary filled mb-3 block" style={{ fontSize: 26 }}>{icon}</span>
                <h3 className="font-sans font-bold text-[15px] text-aq-text-primary mb-2">{title}</h3>
                <p className="font-sans text-[14px] text-aq-text-secondary leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-aq-primary-dim border border-aq-primary rounded-pill font-mono text-[11px] font-semibold text-aq-primary-text tracking-widest mb-6">
          <span className="material-symbols-outlined filled" style={{ fontSize: 13 }}>local_fire_department</span>
          START TODAY
        </div>
        <h2 className="font-sans font-bold text-[34px] md:text-[42px] text-aq-text-primary mb-4 leading-tight">
          One problem a day.<br />Interview-ready in 90 days.
        </h2>
        <p className="font-sans text-[16px] text-aq-text-secondary mb-10 max-w-md mx-auto">
          Start your first lesson. Solve your first problem. Build your first streak. The rest follows.
        </p>
        <Link href="/register" className="inline-block px-10 py-4 bg-aq-primary hover:bg-aq-primary-hover text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input transition-colors">
          START FOR FREE →
        </Link>
        <p className="mt-4 font-mono text-[11px] text-aq-text-muted tracking-widest">NO CREDIT CARD · NO PRESSURE · JUST SHOW UP</p>
      </section>

      <footer className="border-t border-aq-border bg-aq-surface py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono font-bold text-[16px] text-aq-primary">SkillFlow</span>
          <span className="font-mono text-[10px] text-aq-text-muted tracking-widest">SHOW UP EVERY DAY</span>
          <div className="flex gap-5">
            <Link href="/login" className="font-sans text-[13px] text-aq-text-muted hover:text-aq-text-secondary transition-colors">Login</Link>
            <Link href="/register" className="font-sans text-[13px] text-aq-text-muted hover:text-aq-text-secondary transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
