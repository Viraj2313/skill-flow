'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const HIGHLIGHTS = [
  { icon: 'account_tree', text: 'DSA, Programming Languages & CS — all in one' },
  { icon: 'local_fire_department', text: 'Daily streaks that build real discipline' },
  { icon: 'psychology', text: 'Alex — your AI study companion' },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [form,         setForm]         = useState({ username: '', email: '', password: '', display_name: '' });
  const [error,        setError]        = useState('');
  const [message,      setMessage]      = useState('');
  const router = useRouter();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError('Username, email, and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username.trim(),
          display_name: form.display_name.trim() || form.username.trim(),
        },
      },
    });
    setLoading(false);
    if (signUpError) { setError(signUpError.message); return; }
    if (!data.session) { setMessage('Check your email to confirm your account, then log in.'); return; }
    router.replace('/onboarding/notifications');
  };

  const inputStyle = { width: '100%', padding: '11px 14px', fontSize: 14, color: '#0f172a', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', boxSizing: 'border-box', transition: 'border-color 150ms' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* ─── Left panel (dark) ─── */}
      <div className="hidden md:flex" style={{ width: 420, flexShrink: 0, background: '#060c18', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 48px', position: 'relative', overflow: 'hidden' }}>
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

          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>Log in →</Link>
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Username <span style={{ color: '#dc2626' }}>*</span></label>
                <input name="username" type="text" value={form.username} onChange={handleChange} placeholder="AlexCodes" required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Display name</label>
                <input name="display_name" type="text" value={form.display_name} onChange={handleChange} placeholder="Optional"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email <span style={{ color: '#dc2626' }}>*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="alex@example.com" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#059669'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password <span style={{ color: '#dc2626' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#059669'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
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
            {message && (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d' }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#6ee7b7' : '#059669', color: '#fff', fontWeight: 600, fontSize: 14, borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, transition: 'background 150ms' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#047857'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#059669'; }}>
              {loading
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : 'Create account →'}
            </button>

            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
              By signing up you agree to our Terms & Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
