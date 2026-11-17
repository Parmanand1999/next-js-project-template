'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DtcLogo } from '@/components/common/DtcLogo';
import { ProfileAvatar } from '@/components/common/ProfileAvatar';

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
      {/* Left side: Clean Context (Logo on mobile) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <DtcLogo size={26} className="md:hidden shrink-0" />
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0 hidden sm:inline-block" />
        <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight shrink-0">
          Sanchalan
        </span>
        <span className="text-muted-foreground/40 font-light text-xs shrink-0">/</span>
        <span className="text-xs font-medium text-muted-foreground truncate">
          DTC Central Control Room
        </span>
      </div>

      {/* Right side: Notifications & Officer Profile Avatar */}
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
          <div className="flex items-center gap-3 pl-2 border-l border-border/60">
            {/* Officer Profile Icon & Details */}
            <div className="flex items-center gap-2.5">
              <ProfileAvatar size="md" showOnlineBadge={true} />
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
