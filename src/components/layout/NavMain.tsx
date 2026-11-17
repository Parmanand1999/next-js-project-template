'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SidebarNavGroup } from '@/constants/routes';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface NavMainProps {
  groups?: SidebarNavGroup[];
}

export function NavMain({ groups = [] }: NavMainProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const isRouteActive = (url: string) => {
    if (!url) return false;
    if (url === '/admin') return pathname === '/admin';
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const allowedItems = group.items.filter((item) =>
          item.permission ? hasPermission(item.permission) : true
        );

        if (allowedItems.length === 0) return null;

        return (
          <SidebarGroup key={group.groupLabel} className="p-0">
            <SidebarGroupLabel className="px-3 py-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              {group.groupLabel}
            </SidebarGroupLabel>

            <SidebarMenu className="mt-1 space-y-1">
              {allowedItems.map((item) => {
                const isActive = isRouteActive(item.url);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.url} />}
                      className={`relative w-full justify-between rounded-xl px-3 py-2 text-xs transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/20 shadow-xs'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {Icon ? (
                          <Icon
                            className={`size-4 shrink-0 transition-colors ${
                              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                            }`}
                          />
                        ) : null}
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 group-data-[collapsible=icon]:hidden ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-muted text-muted-foreground border border-border/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </div>
  );
}
