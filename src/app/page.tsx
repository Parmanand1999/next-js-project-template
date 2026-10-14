'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

export default function RootPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // If logged in, redirect to admin or appropriate portal
    if (accessToken || user) {
      if (user?.isSuperAdmin || user?.roleName?.toLowerCase() === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/portal');
      }
    } else {
      // Otherwise, redirect directly to real login
      router.replace('/login');
    }
  }, [accessToken, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Redirecting to portal...</span>
      </div>
    </div>
  );
}
