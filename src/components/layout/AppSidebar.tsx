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
} from '@/components/ui/sidebar';
import { SIDEBAR_NAV_GROUPS } from '@/constants/routes';
import { Shield } from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="bg-card border-r border-border text-foreground"
      {...props}
    >
      {/* Header with App Logo */}
      <SidebarHeader className="h-16 px-4 border-b border-border flex items-center justify-center">
        <div className="flex items-center gap-2.5 w-full">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
            <Shield className="size-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black tracking-tight text-foreground leading-none">
              VIKRAM PORTAL
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-0.5">
              Enterprise Admin
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Grouped Navigation with Permissions */}
      <SidebarContent className="px-2 py-3">
        <NavMain groups={SIDEBAR_NAV_GROUPS} />
      </SidebarContent>

      {/* Footer User Avatar & Dropdown */}
      <SidebarFooter className="border-t border-border p-2">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
