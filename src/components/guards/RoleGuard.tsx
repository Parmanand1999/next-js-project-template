'use client';

import React from 'react';
import { Role } from '@/config/roles';
import { useAuth } from '@/hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard selectively renders children based on the user's authenticated role.
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated || !hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
