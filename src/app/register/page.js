'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', display_name: '' });
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/onboarding/notifications');
    }, 1200);
  };

  return (
    <div className="dark-bg min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-1 mb-8">
          <h1 className="font-mono font-bold text-[24px] tracking-[0.12em] text-white uppercase">ALGOQUEST</h1>
          <div className="w-8 h-px bg-aq-primary mt-1" />
        </div>

        <div className="flex bg-aq-surface-sunken p-1 rounded-full mb-6 w-full">
          <Link href="/login" className="flex-1 py-2 text-center rounded-full font-mono text-[12px] font-semibold tracking-widest uppercase text-aq-text-muted transition-all">
            LOG IN
          </Link>
          <Link href="/register" className="flex-1 py-2 text-center rounded-full font-mono text-[12px] font-semibold tracking-widest uppercase bg-aq-primary text-white transition-all">
            SIGN UP
          </Link>
        </div>

        <div className="bg-aq-surface border border-aq-border rounded-card p-6 paper-shadow">
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {[
              { name: 'username', label: 'USERNAME', type: 'text', placeholder: 'AlexCodes' },
              { name: 'email', label: 'EMAIL', type: 'email', placeholder: 'alex@quest.io' },
              { name: 'display_name', label: 'DISPLAY NAME', type: 'text', placeholder: 'Optional' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted px-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full bg-aq-surface-sunken border border-transparent focus:border-aq-border-strong rounded-input px-4 py-3 font-sans text-body text-aq-text-primary placeholder:text-aq-text-muted transition-colors"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted px-1">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
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
              ) : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-sans text-[11px] text-aq-text-muted">
          By signing up you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
