'use client';

import Link from 'next/link';

const CATEGORIES = [
  {
    id: 'dsa',
    label: 'Data Structures & Algorithms',
    desc: 'Arrays, Trees, Graphs, DP — the core of every technical interview.',
    icon: 'account_tree',
    count: '8 topics · 80+ problems',
    color: '#059669',
    dim: '#ecfdf5',
  },
  {
    id: 'python',
    label: 'Programming Languages',
    desc: 'Write clean, idiomatic code. Master language features, OOP patterns, and built-in libraries.',
    icon: 'code',
    count: '3 topics · 30+ problems',
    color: '#2563eb',
    dim: '#eff6ff',
  },
  {
    id: 'cs',
    label: 'CS Fundamentals',
    desc: 'Big-O, memory models, sorting, OOP principles — the theory behind the code.',
    icon: 'school',
    count: '4 topics · 40+ problems',
    color: '#d97706',
    dim: '#fffbeb',
  },
];

const FEATURES = [
  { icon: 'layers',               title: 'Structured Levels',    body: 'Each topic has 5 levels — from basic recognition to interview-grade fluency. You earn each level, you don\'t skip it.' },
  { icon: 'bolt',                 title: 'Daily Challenge',       body: 'One focused problem every 24 hours across all categories. Bonus XP for completing it before midnight.' },
  { icon: 'local_fire_department',title: 'Streak System',         body: 'Miss a day and your streak resets. Keep it alive and your rank climbs. Consistency is the metric.' },
  { icon: 'smart_toy',            title: 'AI Code Review',        body: 'Submit your solution and get instant feedback on time complexity, edge cases, and code style.' },
  { icon: 'emoji_events',         title: 'Weekly Rankings',       body: 'Compete in weekly divisions across all skill areas. Top performers get promoted. The grind is real.' },
  { icon: 'psychology',           title: 'Alex — Study Companion',body: 'A persistent AI tutor that knows what you\'re studying and quizzes you on demand. Always there, never annoying.' },
];

const STATS = [
  { value: '150+', label: 'Problems' },
  { value: '15',   label: 'Topics'   },
  { value: '8',    label: 'Modes'    },
  { value: '5',    label: 'Levels'   },
];

const weekDone = [true, true, true, true, true, true, false];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ─── Nav ─── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,12,24,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined filled text-white" style={{ fontSize: 14 }}>terminal</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>SkillFlow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
              Log in
            </Link>
            <Link href="/register" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#059669', padding: '7px 18px', borderRadius: 8, textDecoration: 'none', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#047857'}
              onMouseLeave={e => e.currentTarget.style.background = '#059669'}>
              Get started →
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section style={{ background: '#060c18', position: 'relative', overflow: 'hidden', padding: '96px 24px 80px' }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(5,150,105,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(5,150,105,0.35)', background: 'rgba(5,150,105,0.08)', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
              Daily Practice · Real Interviews
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 7vw, 68px)', fontWeight: 800, lineHeight: 1.06, color: '#fff', letterSpacing: '-0.03em', marginBottom: 24 }}>
            Master every<br />
            <span style={{ background: 'linear-gradient(135deg, #34d399, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              interview topic.
            </span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto 40px', fontWeight: 400 }}>
            DSA, Python, and CS fundamentals — structured daily lessons built for consistency, not cramming.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Link href="/register" style={{ padding: '13px 28px', background: '#059669', color: '#fff', fontWeight: 600, fontSize: 14, borderRadius: 10, textDecoration: 'none', display: 'inline-block', transition: 'background 150ms, transform 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#047857'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#059669'; }}>
              Start for free →
            </Link>
            <Link href="/login" style={{ padding: '13px 28px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontSize: 14, borderRadius: 10, textDecoration: 'none', display: 'inline-block', transition: 'border-color 150ms, color 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}>
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0, marginTop: 64, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 36 }}>
            {STATS.map(({ value, label }, i) => (
              <div key={label} style={{ padding: '0 36px', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>What you master</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Three categories. One daily habit.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id} style={{ border: '1px solid #e8edf2', borderRadius: 16, padding: '28px 24px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: 22, color: cat.color }}>{cat.icon}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{cat.label}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{cat.desc}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: cat.color, fontFamily: 'JetBrains Mono, monospace' }}>{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Streak section ─── */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #e8edf2', borderBottom: '1px solid #e8edf2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48 }}>
          <div style={{ flex: '1 1 300px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>Streak System</p>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.2 }}>Show up every day.</h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>
              Your streak is your discipline score. Miss one day and it resets to zero. Keep it alive and your rank climbs. Simple. Ruthless. Effective.
            </p>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 18, padding: '20px', width: 320, maxWidth: '100%', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>This Week</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 20 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{d}</span>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: weekDone[i] ? '#f59e0b' : '#f1f5f9', border: weekDone[i] ? 'none' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {weekDone[i] && <span className="material-symbols-outlined filled text-white" style={{ fontSize: 14 }}>check</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 28, color: '#f59e0b' }}>local_fire_department</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>6</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>day streak</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ background: '#060c18', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>Built for interviews</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Everything you need. Nothing you don't.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} style={{ padding: '24px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: 24, color: '#34d399', display: 'block', marginBottom: 12 }}>{icon}</span>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: '#fff', padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
            One problem a day.<br />Interview-ready in 90 days.
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 36, lineHeight: 1.65 }}>
            Start your first lesson. Build your first streak. The rest follows.
          </p>
          <Link href="/register" style={{ display: 'inline-block', padding: '14px 32px', background: '#059669', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 10, textDecoration: 'none', transition: 'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#047857'}
            onMouseLeave={e => e.currentTarget.style.background = '#059669'}>
            Start now →
          </Link>
          <p style={{ marginTop: 16, fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Just show up</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: '#060c18', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>SkillFlow</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Show up every day</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>Login</Link>
            <Link href="/register" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
