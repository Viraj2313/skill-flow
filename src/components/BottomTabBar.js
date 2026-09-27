'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MAIN_NAV = [
  { href: '/dashboard', icon: 'home',        label: 'Dashboard' },
  { href: '/skills',    icon: 'account_tree', label: 'Skills'    },
  { href: '/practice',  icon: 'exercise',     label: 'Practice'  },
  { href: '/ranks',     icon: 'emoji_events', label: 'Ranks'     },
  { href: '/profile',   icon: 'person',       label: 'Profile'   },
];

const TOOLS_NAV = [
  { href: '/practice/visualizer',  icon: 'animation',      label: 'Visualizer'      },
  { href: '/evolutions',           icon: 'trending_up',    label: 'Code Evolution'  },
  { href: '/interview',            icon: 'psychology',     label: 'Interview Mode'  },
  { href: '/focus',                icon: 'my_location',    label: 'Where to Focus'  },
  { href: '/goal',                 icon: 'flag',           label: 'Interview Goal'  },
  { href: '/unstuck',              icon: 'psychology_alt', label: 'Unstuck Protocol'},
  { href: '/journal',              icon: 'auto_stories',   label: 'Aha Journal'     },
  { href: '/practice/deconstruct', icon: 'code_blocks',    label: 'Deconstruct'     },
];

const BOTTOM_TABS = [
  { href: '/dashboard', icon: 'home',        label: 'Home'     },
  { href: '/skills',    icon: 'account_tree', label: 'Skills'  },
  { href: '/practice',  icon: 'exercise',     label: 'Practice'},
  { href: '/ranks',     icon: 'emoji_events', label: 'Ranks'   },
  { href: '/profile',   icon: 'person',       label: 'Profile' },
];

function isActive(pathname, href) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 select-none overflow-hidden"
      style={{ width: 236, background: '#ffffff', borderRight: '1px solid #e8edf2' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[56px] shrink-0" style={{ borderBottom: '1px solid #e8edf2' }}>
        <div
          className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, #059669 0%, #047857 100%)' }}
        >
          <span className="material-symbols-outlined filled text-white" style={{ fontSize: 16 }}>terminal</span>
        </div>
        <span className="font-sans font-bold tracking-tight" style={{ fontSize: 15, color: '#0f172a' }}>SkillFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5 scrollbar-hide">
        {/* Main section */}
        {MAIN_NAV.map(tab => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-2.5 rounded-lg transition-colors duration-100 group"
              style={{
                padding: '7px 10px',
                background:  active ? '#f1f5f9' : 'transparent',
                color:       active ? '#0f172a' : '#64748b',
                fontWeight:  active ? 600 : 500,
                fontSize:    13.5,
              }}
            >
              <span
                className={`material-symbols-outlined shrink-0 transition-colors ${active ? 'filled' : ''}`}
                style={{ fontSize: 18, color: active ? '#059669' : '#94a3b8' }}
              >
                {tab.icon}
              </span>
              <span className="flex-1 truncate">{tab.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#059669' }} />
              )}
            </Link>
          );
        })}

        {/* Tools section */}
        <div className="mt-4 mb-1.5 px-2">
          <span className="font-mono font-bold uppercase tracking-widest" style={{ fontSize: 9, color: '#94a3b8' }}>
            Tools
          </span>
        </div>
        {TOOLS_NAV.map(tool => {
          const active = isActive(pathname, tool.href);
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-2.5 rounded-lg transition-colors duration-100"
              style={{
                padding: '5px 10px',
                background: active ? '#f1f5f9' : 'transparent',
                color:      active ? '#0f172a' : '#64748b',
                fontWeight: active ? 600 : 500,
                fontSize:   12.5,
              }}
            >
              <span
                className={`material-symbols-outlined shrink-0 ${active ? 'filled' : ''}`}
                style={{ fontSize: 16, color: active ? '#059669' : '#94a3b8' }}
              >
                {tool.icon}
              </span>
              <span className="flex-1 truncate">{tool.label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#059669' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 py-3" style={{ borderTop: '1px solid #e8edf2' }}>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg transition-colors duration-100"
          style={{ padding: '6px 10px', color: '#64748b', fontSize: 12.5, fontWeight: 500 }}
        >
          <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16, color: '#94a3b8' }}>settings</span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export default function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ background: '#fff', borderTop: '1px solid #e8edf2', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-[58px]">
        {BOTTOM_TABS.map(tab => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 relative transition-colors duration-100"
              style={{ color: active ? '#059669' : '#94a3b8' }}
            >
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                  style={{ width: 24, height: 2.5, background: '#059669' }}
                />
              )}
              <span
                className={`material-symbols-outlined ${active ? 'filled' : ''}`}
                style={{ fontSize: 22 }}
              >
                {tab.icon}
              </span>
              <span className="font-sans font-medium" style={{ fontSize: 10.5, letterSpacing: '0.01em' }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
