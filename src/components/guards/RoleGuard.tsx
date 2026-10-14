'use client';

import React from 'react';
import { Role } from '@/config/roles';
import { useSession } from '@/features/auth';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard selectively renders children based on the user's authenticated role.
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!session || !allowedRoles.includes(session.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
