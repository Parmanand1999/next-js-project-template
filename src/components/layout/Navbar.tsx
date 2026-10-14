'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from '@/features/auth';
import { ROLES, ROLE_LABELS } from '@/config/roles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, ArrowRightLeft } from 'lucide-react';

export function Navbar() {
  const { session, switchRole, logout } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="size-4" />
            </div>
            <span className="hidden sm:inline-block">NextEnterprise</span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground border">
            App Router + RBAC
          </span>
        </div>

        {/* Dynamic Role Switcher for Live Demo & Testing */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
            <span className="text-[11px] font-semibold text-muted-foreground px-2 flex items-center gap-1">
              <ArrowRightLeft className="size-3" />
              Role:
            </span>
            {Object.values(ROLES).map((role) => {
              const isActive = session?.role === role;
              return (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
                    isActive
                      ? 'bg-background shadow-xs text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              );
            })}
          </div>

          {session ? (
            <div className="flex items-center gap-2.5 border-l border-border pl-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold leading-tight">{session.name}</div>
                <div className="text-[10px] text-muted-foreground">{session.email}</div>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono">
                {session.role}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                title="Log out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
