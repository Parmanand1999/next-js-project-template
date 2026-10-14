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
    if (url === '/') return pathname === '/';
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
            <SidebarGroupLabel className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                      className={`w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-muted text-foreground font-semibold shadow-2xs'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-normal'
                      }`}
                    >
                      {Icon ? (
                        <Icon
                          className={`size-4 shrink-0 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        />
                      ) : null}
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
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
