'use client';

import { useAuth } from '@/hooks/useAuth';

export function useSession() {
  const auth = useAuth();

  return {
    ...auth,
    session: auth.user
      ? {
          id: auth.user.id || auth.user.userId || 'usr_001',
          name: auth.user.name,
          email: auth.user.email,
          role: auth.isSuperAdmin
            ? 'SUPER_ADMIN'
            : (auth.user.roleName?.toUpperCase() || 'USER'),
        }
      : null,
  };
}

export { useAuth };
