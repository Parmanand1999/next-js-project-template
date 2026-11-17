import {
  LayoutDashboard,
  Route,
  ShieldAlert,
  AlertTriangle,
  Megaphone,
  QrCode,
  RotateCcw,
  UserCheck,
  ArrowLeftRight,
  Bus,
  FileText,
  LucideIcon,
} from 'lucide-react';
import { Permission } from '@/config/roles';

export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: string;
  permission?: Permission | string | null;
}

export interface SidebarNavGroup {
  groupLabel: string;
  items: SidebarNavItem[];
}

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    groupLabel: 'OPERATIONS CENTRAL',
    items: [
      {
        title: 'Command Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
        permission: null,
      },
      {
        title: 'Notices Board',
        url: '/admin/notices',
        icon: Megaphone,
        badge: 'Live',
        permission: null,
      },
    ],
  },
  {
    groupLabel: 'FARES & TRANSIT',
    items: [
      {
        title: 'Routes & Fares',
        url: '/admin/routes-fares',
        icon: Route,
        permission: null,
      },
      {
        title: 'QR Tickets & Passes',
        url: '/admin/passengers/tickets',
        icon: QrCode,
        permission: null,
      },
      {
        title: 'Refunds & Grievances',
        url: '/admin/passengers/refunds',
        icon: RotateCcw,
        permission: null,
      },
    ],
  },
  {
    groupLabel: 'ENFORCEMENT & VIGILANCE',
    items: [
      {
        title: 'No Ticket (Challan)',
        url: '/admin/violations/no-ticket',
        icon: ShieldAlert,
        badge: 'Fine ₹200',
        permission: null,
      },
      {
        title: 'Invalid Ticket Log',
        url: '/admin/violations/invalid-ticket',
        icon: AlertTriangle,
        permission: null,
      },
    ],
  },
  {
    groupLabel: 'CREW & FLEET MANAGEMENT',
    items: [
      {
        title: 'Conductor Duty & Shifts',
        url: '/admin/conductors/duty',
        icon: UserCheck,
        permission: null,
      },
      {
        title: 'Duty Handover Records',
        url: '/admin/conductors/handover',
        icon: ArrowLeftRight,
        permission: null,
      },
      {
        title: 'Live Bus Tracking',
        url: '/admin/fleet/live-tracking',
        icon: Bus,
        badge: 'GPS',
        permission: null,
      },
    ],
  },
];

export const SIDEBAR_NAV_ITEMS = SIDEBAR_NAV_GROUPS.flatMap((group) => group.items);
