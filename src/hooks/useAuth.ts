'use client';

import { useCallback, useMemo } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { UserRole } from '@/types/auth';

export const useAuth = () => {
  const storeUser = useAuthStore((state) => state?.user);
  const accessToken = useAuthStore((state) => state?.accessToken);
  const storePermissions = useAuthStore((state) => state?.permissions);
  const permissions = useMemo(() => storePermissions || [], [storePermissions]);
  const storeRole = useAuthStore((state) => state?.role);
  const storeIsSuperAdmin = useAuthStore((state) => state?.isSuperAdmin);

  const logout = useAuthStore((state) => state?.logout);
  const fetchCurrentUser = useAuthStore((state) => state?.fetchCurrentUser);

  const isAuthenticated = Boolean(accessToken || storeUser);
  const user = storeUser;

  const roleObj = typeof storeRole === 'object' ? (storeRole as UserRole) : null;
  const userRoleObj = typeof user?.role === 'object' ? (user?.role as UserRole) : null;

  const roleName =
    roleObj?.name ||
    userRoleObj?.name ||
    user?.roleName ||
    (typeof user?.role === 'string' ? user.role : 'User');

  const isSuperAdmin =
    Boolean(storeIsSuperAdmin) ||
    Boolean(storeUser?.isSuperAdmin) ||
    Boolean(storeUser?.is_super_admin) ||
    Boolean(roleObj?.isSuperAdmin) ||
    roleName?.toLowerCase() === 'super admin' ||
    roleName?.toLowerCase() === 'admin';

  /**
   * Checks if user has a specific permission (or is a Super Admin).
   */
  const hasPermission = useCallback(
    (permission?: string | null): boolean => {
      if (isSuperAdmin) return true;
      if (!permission) return true;
      return permissions.includes(permission);
    },
    [isSuperAdmin, permissions]
  );

  /**
   * Checks if user has at least ONE of the provided permissions.
   */
  const hasAnyPermission = useCallback(
    (reqPermissions: string[] = []): boolean => {
      if (isSuperAdmin) return true;
      if (!Array.isArray(reqPermissions) || reqPermissions.length === 0) return true;
      return reqPermissions.some((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions]
  );

  /**
   * Checks if user has ALL of the provided permissions.
   */
  const hasAllPermissions = useCallback(
    (reqPermissions: string[] = []): boolean => {
      if (isSuperAdmin) return true;
      if (!Array.isArray(reqPermissions) || reqPermissions.length === 0) return true;
      return reqPermissions.every((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions]
  );

  /**
   * Checks if the user's role is included in the allowed roles list.
   */
  const hasRole = useCallback(
    (allowedRoles: string | string[]): boolean => {
      if (isSuperAdmin) return true;
      if (!roleName) return false;

      const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const normalizedUserRole = roleName.trim().toLowerCase();

      return rolesToCheck.some(
        (role) => role?.trim().toLowerCase() === normalizedUserRole
      );
    },
    [isSuperAdmin, roleName]
  );

  return {
    user,
    isAuthenticated,
    roleName,
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    logout,
    fetchCurrentUser,
  };
};

export default useAuth;
