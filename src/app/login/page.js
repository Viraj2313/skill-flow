'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const HIGHLIGHTS = [
  { icon: 'account_tree', text: 'DSA, Python & CS — all in one place' },
  { icon: 'local_fire_department', text: 'Daily streaks that build real discipline' },
  { icon: 'psychology', text: 'Alex — your AI study companion' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) { setError(loginError.message); return; }
    router.replace('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ─── Left panel (dark) ─── */}
      <div className="hidden md:flex" style={{ width: 420, flexShrink: 0, background: '#060c18', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 48px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', bottom: '-10%', left: '-20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(5,150,105,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 64 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined filled text-white" style={{ fontSize: 15 }}>terminal</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>SkillFlow</span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 14 }}>
            The fastest way to<br />ace your tech interview.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: 40 }}>
            Structured lessons, daily habits, AI-powered feedback — everything in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {HIGHLIGHTS.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: 16, color: '#34d399' }}>{icon}</span>
                </div>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {[['150+', 'Problems'], ['15', 'Topics'], ['Free', 'Always']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right panel (form) ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="flex md:hidden" style={{ alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg,#059669,#047857)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined filled text-white" style={{ fontSize: 15 }}>terminal</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>SkillFlow</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>Sign up →</Link>
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
                style={{ width: '100%', padding: '11px 14px', fontSize: 14, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms' }}
                onFocus={e => e.target.style.borderColor = '#059669'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Password</label>
                <button type="button" style={{ fontSize: 12, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '11px 44px 11px 14px', fontSize: 14, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms' }}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 19 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#6ee7b7' : '#059669', color: '#fff', fontWeight: 600, fontSize: 14, borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, transition: 'background 150ms' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#047857'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#059669'; }}>
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
