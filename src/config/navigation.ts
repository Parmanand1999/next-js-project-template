import { Role, ROLES } from './roles';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  roles: Role[];
  badge?: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  // Admin only
  {
    title: 'Admin Dashboard',
    href: '/admin',
    iconName: 'ShieldAlert',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    iconName: 'Users',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  },
  // Manager & Admin
  {
    title: 'Manager Overview',
    href: '/manager',
    iconName: 'Briefcase',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER],
  },
  // All Roles
  {
    title: 'User Portal',
    href: '/portal',
    iconName: 'LayoutDashboard',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.USER],
  },
];

export function getNavigationForRole(role: Role): NavItem[] {
  return NAVIGATION_ITEMS.filter((item) => item.roles.includes(role));
}
