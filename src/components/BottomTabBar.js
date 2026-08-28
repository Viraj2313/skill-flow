'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', icon: 'home',         label: 'Home' },
  { href: '/skills',    icon: 'account_tree',  label: 'Skills' },
  { href: '/practice',  icon: 'exercise',      label: 'Practice' },
  { href: '/ranks',     icon: 'emoji_events',  label: 'Ranks' },
  { href: '/profile',   icon: 'person',        label: 'Profile' },
];

function isActive(pathname, href) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

export function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-aq-surface border-r border-aq-border select-none">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-aq-border">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined text-[20px]">terminal</span>
        </div>
        <span className="font-sans font-bold text-[18px] text-aq-text-primary tracking-tight">SkillFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        <div className="px-3 pb-2">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-aq-text-muted uppercase">Learn</span>
        </div>
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-sans text-[14px] transition-all duration-150 ${
                active
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] transition-colors ${active ? 'text-emerald-700 filled' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />}
            </Link>
          );
        })}

        <div className="px-3 pt-5 pb-2">
          <span className="font-mono text-[10px] font-semibold tracking-wider text-aq-text-muted uppercase">Tools</span>
        </div>
        {[
          { href: '/evolutions', icon: 'trending_up',  label: 'Code Evolution', color: 'text-orange-600', activeBg: 'bg-orange-50 text-orange-800' },
          { href: '/interview',  icon: 'psychology',   label: 'Interview Mode', color: 'text-violet-600', activeBg: 'bg-violet-50 text-violet-800' },
          { href: '/practice',   icon: 'exercise',     label: 'Practice Modes', color: 'text-emerald-600', activeBg: 'bg-emerald-50 text-emerald-800' },
        ].map(tool => {
          const active = isActive(pathname, tool.href);
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-sans text-[14px] transition-all duration-150 ${
                active ? tool.activeBg + ' font-semibold shadow-xs' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${active ? tool.color : 'text-slate-400'}`}>{tool.icon}</span>
              <span>{tool.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-aq-border space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-600 font-medium text-[14px] hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-aq-surface border-t border-aq-border backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-15 px-2">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-150 ${active ? 'text-emerald-700' : 'text-slate-400'}`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 rounded-b-full" />
              )}
              <span className={`material-symbols-outlined text-[22px] ${active ? 'filled' : ''}`}>{tab.icon}</span>
              <span className="font-sans text-[11px] font-medium tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
