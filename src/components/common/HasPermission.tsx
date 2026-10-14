'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/config/roles';

export interface HasPermissionProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: Role | Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative Permission & Role Gate Component.
 * Conditionally renders children only if the logged-in user matches the required capabilities.
 */
export function HasPermission({
  permission,
  permissions = [],
  requireAll = false,
  role,
  fallback = null,
  children,
}: HasPermissionProps) {
  const { hasPermission, hasAnyPermission, isSuperAdmin, user } = useAuth();

  // Super admin always bypasses restrictions
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check role match if specified
  if (role) {
    const currentRole = user?.roleName || user?.role;
    const allowedRoles = Array.isArray(role) ? role : [role];
    const roleMatches = allowedRoles.some(
      (r) => String(r).toUpperCase() === String(currentRole).toUpperCase()
    );
    if (!roleMatches) return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const isAllowed = requireAll
      ? permissions.every((p) => hasPermission(p))
      : hasAnyPermission(permissions);

    if (!isAllowed) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

export default HasPermission;
