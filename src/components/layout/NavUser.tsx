'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import useAuthStore from '@/store/useAuthStore';
import { ChevronsUpDown, LogOut, User as UserIcon } from 'lucide-react';
import { ProfileAvatar } from '@/components/common/ProfileAvatar';

export function NavUser() {
  const router = useRouter();
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const userData = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const displayName = userData?.name || 'DTC Controller';
  const displayRole = userData?.roleName || (userData?.isSuperAdmin ? 'Super Admin' : 'Admin');
  const displayContact = userData?.email || userData?.contactNumber || 'admin@dtc.delhi.gov.in';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className={`w-full flex items-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors rounded-xl p-2 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          />
        }
      >
        <ProfileAvatar size={isCollapsed ? 'sm' : 'md'} showOnlineBadge={true} />
        {!isCollapsed && (
          <>
            <div className="grid flex-1 text-left text-xs leading-tight ml-2.5 min-w-0">
              <span className="truncate font-bold text-foreground">{displayName}</span>
              <span className="truncate text-[10px] text-muted-foreground font-medium">{displayRole}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground shrink-0" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-xl"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={6}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
              <ProfileAvatar size="md" showOnlineBadge={false} />
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-bold text-foreground">{displayName}</span>
                <span className="truncate text-[10px] text-muted-foreground">{displayContact}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer text-xs font-medium">
          <UserIcon className="size-3.5 mr-2 text-muted-foreground" />
          My Profile & Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-xs font-semibold text-rose-600 focus:text-rose-600">
          <LogOut className="size-3.5 mr-2 text-rose-600" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
