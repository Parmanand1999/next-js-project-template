import { Role, ROLE_PERMISSIONS, ROLE_ROUTE_ACCESS, Permission, ROLES } from '@/config/roles';

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedPermissions = ROLE_PERMISSIONS[role] || [];
  return allowedPermissions.includes(permission);
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  const allowedRoots = ROLE_ROUTE_ACCESS[role] || [];
  return allowedRoots.some((allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`));
}

export function isAuthorized(currentRole: Role, requiredRoles: Role[]): boolean {
  if (currentRole === ROLES.SUPER_ADMIN) return true;
  return requiredRoles.includes(currentRole);
}
