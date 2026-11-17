'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Navbar() {
  const router = useRouter();
  const { user, roleName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user?.name || 'DTC Controller';
  const displayRole = roleName || (user?.isSuperAdmin ? 'Admin' : 'Operator');

  return (
    <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-card/60 backdrop-blur-md">
      {/* Left side: Clean context title */}
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
        <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
          Sanchalan
        </span>
        <span className="text-muted-foreground/40 font-light text-xs">/</span>
        <span className="text-xs font-medium text-muted-foreground">
          DTC Central Control Room
        </span>
      </div>

      {/* Right side: Minimal alerts & Officer Profile */}
      <div className="flex items-center gap-3">
        {/* Subtle Notifications Link */}
        <Link href="/admin/notices">
          <Button
            variant="ghost"
            size="icon-sm"
            title="DTC Circulars & Alerts"
            className="text-muted-foreground hover:text-foreground relative rounded-lg"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-emerald-600" />
          </Button>
        </Link>

        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-border/60">
            {/* User Details */}
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-emerald-700/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/20">
                {displayName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold leading-tight text-foreground">
                  {displayName}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  {displayRole}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              title="Sign Out"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-1"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
