'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Notification onboarding removed — redirect straight to dashboard.
export default function NotificationsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard'); }, [router]);
  return null;
}
