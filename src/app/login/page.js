'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    router.replace('/dashboard');
  };

  return (
    <div className="dark-bg min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-1 mb-8">
          <h1 className="font-mono font-bold text-[24px] tracking-[0.12em] text-white uppercase">ALGOQUEST</h1>
          <div className="w-8 h-px bg-aq-primary mt-1" />
        </div>

        <div className="flex bg-aq-surface-sunken p-1 rounded-full mb-6 w-full">
          <Link href="/login" className="flex-1 py-2 text-center rounded-full font-mono text-[12px] font-semibold tracking-widest uppercase bg-aq-primary text-white transition-all">
            LOG IN
          </Link>
          <Link href="/register" className="flex-1 py-2 text-center rounded-full font-mono text-[12px] font-semibold tracking-widest uppercase text-aq-text-muted transition-all">
            SIGN UP
          </Link>
        </div>

        <div className="bg-aq-surface border border-aq-border rounded-card p-6 paper-shadow">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted px-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@quest.io"
                className="w-full bg-aq-surface-sunken border border-transparent focus:border-aq-border-strong rounded-input px-4 py-3 font-sans text-body text-aq-text-primary placeholder:text-aq-text-muted transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted">PASSWORD</label>
                <button type="button" className="font-mono text-[10px] text-aq-primary hover:underline tracking-wide">FORGOT PASSWORD?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-aq-surface-sunken border border-transparent focus:border-aq-border-strong rounded-input px-4 py-3 pr-12 font-sans text-body text-aq-text-primary placeholder:text-aq-text-muted transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-aq-text-muted"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-aq-primary hover:bg-aq-primary-hover text-white font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>LOG IN <span className="material-symbols-outlined text-[18px]">login</span></>
              )}
            </button>
            {error && <p role="alert" className="font-sans text-[13px] text-aq-error text-center">{error}</p>}
          </form>
        </div>

        <p className="mt-6 text-center font-sans text-[11px] text-aq-text-muted">
          New to the quest? Join thousands of developers mastering algorithms.
        </p>
      </div>
    </div>
  );
}
