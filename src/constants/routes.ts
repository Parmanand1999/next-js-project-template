import {
  LayoutDashboard,
  Users,
  UserCheck,
  Layers,
  Server,
  ShieldCheck,
  FileText,
  LucideIcon,
} from 'lucide-react';

export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  permission?: string | null;
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
        permission: 'Admin.View',
      },
      {
        title: 'Manage Users',
        url: '/admin/users',
        icon: Users,
        permission: 'Users.View',
      },
      {
        title: 'Manager Workspace',
        url: '/manager',
        icon: UserCheck,
        permission: 'Reports.View',
      },
      {
        title: 'Member Portal',
        url: '/portal',
        icon: Layers,
        permission: null,
      },
      {
        title: 'System Services',
        url: '/machines',
        icon: Server,
        permission: 'Machines.View',
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
