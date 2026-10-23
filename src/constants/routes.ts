import {
  LayoutDashboard,
  Users,
  UserCheck,
  Layers,
  Server,
  ShieldCheck,
  FileText,
  UserRound,
  LucideIcon,
} from 'lucide-react';
import { PERMISSIONS, Permission } from '@/config/roles';

export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  permission?: Permission | string | null;
}

export interface SidebarNavGroup {
  groupLabel: string;
  items: SidebarNavItem[];
}

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    groupLabel: 'MAIN MENU',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: LayoutDashboard,
        permission: null, // open to all logged in users
      },
      {
        title: 'Admin Control',
        url: '/admin',
        icon: ShieldCheck,
        permission: PERMISSIONS.ADMIN_VIEW,
      },
      {
        title: 'Manage Users',
        url: '/admin/users',
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        title: 'Manager Workspace',
        url: '/manager',
        icon: UserCheck,
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        title: 'Member Portal',
        url: '/portal',
        icon: Layers,
        permission: null,
      },
      {
        title: 'My Profile',
        url: '/profile',
        icon: UserRound,
        permission: null,
      },
      {
        title: 'System Services',
        url: '/machines',
        icon: Server,
        permission: PERMISSIONS.SYSTEM_VIEW,
      },
      {
        title: 'Documentation',
        url: '/docs',
        icon: FileText,
        permission: null,
      },
    ],
  },
];

export const SIDEBAR_NAV_ITEMS = SIDEBAR_NAV_GROUPS.flatMap((group) => group.items);
