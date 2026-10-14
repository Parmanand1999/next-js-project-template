'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const { user, roleName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user?.name || 'Administrator';
  const displayRole = roleName || (user?.isSuperAdmin ? 'Super Admin' : 'Admin');
  const displayEmail = user?.email || 'admin@enterprise.dev';

  return (
    <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
      {/* Left side: Context / Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Travel Tech Services
          </span>
          <span className="text-muted-foreground/40 font-normal">/</span>
          <span className="text-xs font-medium text-muted-foreground">
            Portal Control
          </span>
        </div>
      </div>

      {/* Right side: Real Actions & User Session */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          title="Notifications"
        >
          <Bell className="size-4" />
        </Button>

        {user && (
          <div className="flex items-center gap-3 border-l border-border pl-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold leading-tight text-foreground">{displayName}</div>
              <div className="text-[10px] text-muted-foreground">{displayEmail}</div>
            </div>
            <Badge variant="secondary" className="text-[11px] font-medium">
              {displayRole}
            </Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              title="Log out"
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
