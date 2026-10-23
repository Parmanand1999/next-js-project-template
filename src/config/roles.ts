export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.USER]: 'User / Client',
};

// Route access paths allowed for each role
export const ROLE_ROUTE_ACCESS: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: ['/admin', '/manager', '/portal', '/profile'],
  [ROLES.ADMIN]: ['/admin', '/manager', '/portal', '/profile'],
  [ROLES.MANAGER]: ['/manager', '/portal', '/profile'],
  [ROLES.USER]: ['/portal', '/profile'],
};

// Granular permissions matrix for fine-grained capability checks
export const PERMISSIONS = {
  ADMIN_VIEW: 'admin:view',
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  REPORTS_VIEW: 'reports:view',
  SETTINGS_MANAGE: 'settings:manage',
  BILLING_MANAGE: 'billing:manage',
  PROFILE_EDIT: 'profile:edit',
  SYSTEM_VIEW: 'system:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.ADMIN_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.SYSTEM_VIEW,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.ADMIN_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.PROFILE_EDIT,
    PERMISSIONS.SYSTEM_VIEW,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.PROFILE_EDIT,
  ],
  [ROLES.USER]: [
    PERMISSIONS.PROFILE_EDIT,
  ],
};
