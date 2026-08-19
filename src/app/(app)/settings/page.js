'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toggle } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    dailyChallenge: true,
    streakAlert: true,
    rankChanges: false,
  });

  const toggle = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const Section = ({ label, children }) => (
    <div className="mb-2">
      <p className="font-mono text-[10px] font-semibold tracking-widest uppercase text-aq-text-muted px-5 pt-5 pb-2">{label}</p>
      <div className="bg-aq-surface border-y border-aq-border">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, right, onPress, noBorder }) => (
    <button
      onClick={onPress}
      className={`w-full flex items-center justify-between px-5 h-14 text-left hover:bg-aq-surface-raised transition-colors ${!noBorder ? 'border-b border-aq-border' : ''}`}
    >
      <span className="font-sans text-[15px] text-aq-text-primary">{label}</span>
      {right}
    </button>
  );

  return (
    <div className="min-h-screen bg-aq-bg">
      <header className="bg-aq-surface border-b border-aq-border sticky top-0 z-40 h-14 flex items-center px-5">
        <button onClick={() => router.back()} className="text-aq-text-secondary mr-3">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="font-sans font-semibold text-h2 text-aq-text-primary flex-1 text-center pr-8">Settings</h2>
      </header>

      <div className="max-w-2xl mx-auto pb-8">
        <Section label="ACCOUNT">
          <Row label="Display Name" right={<div className="flex items-center gap-1 text-aq-text-muted"><span className="font-sans text-[14px]">Alex</span><span className="material-symbols-outlined text-[18px]">chevron_right</span></div>} />
          <Row label="Username" right={<div className="flex items-center gap-1 text-aq-text-muted"><span className="font-sans text-[14px]">AlexCodes</span><span className="material-symbols-outlined text-[18px]">chevron_right</span></div>} />
          <Row label="Change Password" right={<span className="material-symbols-outlined text-[18px] text-aq-text-muted">chevron_right</span>} />
          <Row label="Connected Accounts" noBorder right={
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-aq-surface-raised border border-aq-border rounded-pill font-mono text-[10px] text-aq-text-secondary">Google</span>
              <span className="material-symbols-outlined text-[18px] text-aq-text-muted">chevron_right</span>
            </div>
          } />
        </Section>

        <Section label="NOTIFICATIONS">
          <Row label="Daily Challenge Reminder" noBorder={false} right={<Toggle checked={notifications.dailyChallenge} onChange={() => toggle('dailyChallenge')} />} />
          <Row label="Streak Alert" noBorder={false} right={<Toggle checked={notifications.streakAlert} onChange={() => toggle('streakAlert')} />} />
          <Row label="Rank Changes" noBorder={false} right={<Toggle checked={notifications.rankChanges} onChange={() => toggle('rankChanges')} />} />
          <Row label="Reminder Time" noBorder right={<div className="flex items-center gap-1 text-aq-text-muted"><span className="font-sans text-[14px]">8:00 AM</span><span className="material-symbols-outlined text-[18px]">chevron_right</span></div>} />
        </Section>

        <Section label="APPEARANCE">
          <Row label="Theme" noBorder={false} right={<div className="flex items-center gap-2"><span className="font-sans text-[14px] text-aq-text-muted">Light</span></div>} />
          <Row label="Code Font Size" noBorder right={<div className="flex items-center gap-1 text-aq-text-muted"><span className="font-sans text-[14px]">13px</span><span className="material-symbols-outlined text-[18px]">chevron_right</span></div>} />
        </Section>

        <Section label="ABOUT">
          <Row label="Version" noBorder={false} right={<span className="font-mono text-[13px] text-aq-text-muted">2.0.0</span>} />
          <Row label="Terms of Service" noBorder={false} right={<span className="material-symbols-outlined text-[18px] text-aq-text-muted">chevron_right</span>} />
          <Row label="Privacy Policy" noBorder={false} right={<span className="material-symbols-outlined text-[18px] text-aq-text-muted">chevron_right</span>} />
          <Row label="Rate AlgoQuest" noBorder right={<div className="flex items-center gap-1 text-aq-text-muted"><span className="material-symbols-outlined text-[16px]">star</span><span className="material-symbols-outlined text-[18px]">chevron_right</span></div>} />
        </Section>

        <div className="px-5 pt-4">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 border border-aq-error text-aq-error font-mono text-[13px] font-semibold tracking-widest uppercase rounded-input hover:bg-aq-error-bg transition-colors"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </div>
  );
}
