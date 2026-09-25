'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import BottomTabBar, { DesktopSidebar } from '@/components/BottomTabBar';
import Companion from '@/components/Companion';
import { supabase } from '@/lib/supabase';

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      else setReady(true);
    });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-aq-bg flex items-center justify-center">
        <span className="material-symbols-outlined text-[36px] text-aq-text-muted animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aq-bg flex">
      <DesktopSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
        <BottomTabBar />
      </div>
      <Companion />
    </div>
  );
}
