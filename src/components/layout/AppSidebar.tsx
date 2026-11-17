'use client';

import React from 'react';
import { NavMain } from './NavMain';
import { NavUser } from './NavUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { SIDEBAR_NAV_GROUPS } from '@/constants/routes';
import { DtcLogo } from '@/components/common/DtcLogo';
import Link from 'next/link';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar
      collapsible="icon"
      className="bg-card/95 backdrop-blur-md border-r border-border/80 text-foreground"
      {...props}
    >
      {/* Header with Official DTC Emblem Logo */}
      <SidebarHeader className="h-16 px-3 border-b border-border/80 flex items-center">
        <Link
          href="/admin"
          className={`flex items-center gap-3 w-full group ${
            isCollapsed ? 'justify-center px-0' : 'px-1'
          }`}
          title="DTC Sanchalan Central Console"
        >
          <DtcLogo size={isCollapsed ? 32 : 36} className="group-hover:scale-105 transition-transform" />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-foreground leading-none">
                  SANCHALAN
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white leading-tight uppercase tracking-wider">
                  DTC
                </span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-1 truncate">
                Delhi Transport Corp.
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Main Grouped Navigation with Permissions */}
      <SidebarContent className="px-2.5 py-3 space-y-2">
        <NavMain groups={SIDEBAR_NAV_GROUPS} />
      </SidebarContent>

      {/* Footer User Avatar & Status */}
      <SidebarFooter className="border-t border-border/80 p-2.5">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
