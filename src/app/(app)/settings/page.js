'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toggle } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/db';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [user, setUser]       = useState(null);
  const [notifications, setNotifications] = useState({
    dailyChallenge: true,
    streakAlert: true,
    rankChanges: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (!authUser) return;
      setUser(authUser);
      const prof = await getUserProfile();
      setProfile(prof);
    });
  }, []);

  const emailPrefix = user?.email ? user.email.split('@')[0] : '';
  const metaName = user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name;

  const normalNameFromEmail = emailPrefix
    ? emailPrefix
        .replace(/[._-]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Engineer';

  const displayName = (profile?.display_name && profile.display_name !== 'User' && profile.display_name !== 'Engineer' && profile.display_name !== 'Alex')
    ? profile.display_name
    : (metaName || normalNameFromEmail || 'Engineer');

  const username = (profile?.username && profile.username !== 'AlexCodes')
    ? profile.username
    : (user?.user_metadata?.username || (emailPrefix ? emailPrefix.replace(/[^a-zA-Z0-9_]/g, '') : 'user'));

  const handleEditDisplayName = async () => {
    const next = prompt('Enter display name:', displayName);
    if (!next || !next.trim() || next.trim() === displayName) return;
    const trimmed = next.trim();
    try {
      if (user?.id) {
        await supabase.from('user_profiles').update({ display_name: trimmed }).eq('id', user.id);
        await supabase.auth.updateUser({ data: { display_name: trimmed } });
      }
      setProfile(prev => ({ ...prev, display_name: trimmed }));
    } catch {}
  };

  const handleEditUsername = async () => {
    const next = prompt('Enter username:', username);
    if (!next || !next.trim() || next.trim() === username) return;
    const sanitized = next.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!sanitized) return;
    try {
      if (user?.id) {
        await supabase.from('user_profiles').update({ username: sanitized }).eq('id', user.id);
        await supabase.auth.updateUser({ data: { username: sanitized } });
      }
      setProfile(prev => ({ ...prev, username: sanitized }));
    } catch {}
  };

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
          <Row
            label="Display Name"
            onPress={handleEditDisplayName}
            right={
              <div className="flex items-center gap-1 text-aq-text-muted">
                <span className="font-sans text-[14px] text-slate-800 font-medium">{displayName}</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </div>
            }
          />
          <Row
            label="Username"
            onPress={handleEditUsername}
            right={
              <div className="flex items-center gap-1 text-aq-text-muted">
                <span className="font-sans text-[14px] text-slate-800 font-medium">{username}</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </div>
            }
          />
          <Row
            label="Change Password"
            onPress={async () => {
              const nextPwd = prompt('Enter new password (min 6 characters):');
              if (!nextPwd || nextPwd.length < 6) return;
              const { error } = await supabase.auth.updateUser({ password: nextPwd });
              if (error) alert('Failed to update password: ' + error.message);
              else alert('Password updated successfully!');
            }}
            right={<span className="material-symbols-outlined text-[18px] text-aq-text-muted">chevron_right</span>}
          />
          <Row
            label="Connected Accounts"
            noBorder
            right={
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-aq-surface-raised border border-aq-border rounded-pill font-mono text-[10px] text-aq-text-secondary">Email</span>
                <span className="material-symbols-outlined text-[18px] text-aq-text-muted">chevron_right</span>
              </div>
            }
          />
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
