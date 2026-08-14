'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', icon: 'home', label: 'Home' },
  { href: '/skills', icon: 'account_tree', label: 'Skills' },
  { href: '/challenge', icon: 'bolt', label: 'Challenge' },
  { href: '/ranks', icon: 'emoji_events', label: 'Ranks' },
  { href: '/profile', icon: 'person', label: 'Profile' },
];

function isActive(pathname, href) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-aq-surface border-r border-aq-border">
      <div className="px-5 py-6 border-b border-aq-border">
        <span className="font-mono font-bold text-[20px] text-aq-primary tracking-tight">SkillFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                active
                  ? 'bg-aq-primary-dim text-aq-primary'
                  : 'text-aq-text-secondary hover:bg-aq-surface-raised hover:text-aq-text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''}`}>{tab.icon}</span>
              <span className="font-sans font-medium text-[14px]">{tab.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-aq-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-aq-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-aq-text-muted hover:bg-aq-surface-raised hover:text-aq-text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
          <span className="font-sans font-medium text-[14px]">Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-aq-surface border-t border-aq-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-150 ${active ? 'text-aq-primary' : 'text-aq-text-muted'}`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-aq-primary rounded-b-full" />
              )}
              <span className={`material-symbols-outlined text-[24px] ${active ? 'filled' : ''}`}>{tab.icon}</span>
              <span className="font-mono text-[10px] font-medium tracking-widest uppercase">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
