'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/features/auth';
import { getNavigationForRole } from '@/config/navigation';
import { ROLES, ROLE_LABELS } from '@/config/roles';
import {
  ShieldAlert,
  Users,
  Briefcase,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldAlert,
  Users,
  Briefcase,
  LayoutDashboard,
};

export function Sidebar() {
  const pathname = usePathname();
  const { session } = useSession();
  const currentRole = session?.role || ROLES.USER;
  const navItems = getNavigationForRole(currentRole);

  return (
    <aside className="w-64 border-r border-border bg-card/50 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Navigation ({ROLE_LABELS[currentRole]})
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <ChevronRight className="size-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Role permission info box */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/40 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            <span>Active Permissions</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your views and actions are automatically filtered by your role:{' '}
            <strong className="text-foreground">{ROLE_LABELS[currentRole]}</strong>.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-border text-[11px] text-muted-foreground text-center">
        Feature-Based Next.js Architecture
      </div>
    </aside>
  );
}
