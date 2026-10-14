'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const userData = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/portal');
  };

  const displayName = userData?.name || 'Administrator';
  const displayRole = userData?.roleName || (userData?.isSuperAdmin ? 'Super Admin' : 'Admin');
  const displayContact = userData?.email || userData?.contactNumber || 'admin@enterprise.dev';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="w-full flex items-center justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors"
          />
        }
      >
        <Avatar className="size-8 rounded-lg border border-sidebar-border shadow-xs shrink-0">
          <AvatarImage src={userData?.avatar} alt={displayName} />
          <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center">
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
          <span className="truncate font-semibold text-foreground">{displayName}</span>
          <span className="truncate text-xs text-muted-foreground font-medium">{displayRole}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
              <Avatar className="size-8 rounded-lg border border-border shadow-xs">
                <AvatarImage src={userData?.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold flex items-center justify-center">
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{displayContact}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
          <UserIcon className="size-4 mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
