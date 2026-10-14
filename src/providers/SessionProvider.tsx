'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, ROLES } from '@/config/roles';
import { UserSession } from '@/features/auth/types';

interface SessionContextType {
  session: UserSession | null;
  isLoading: boolean;
  switchRole: (role: Role) => void;
  logout: () => void;
  login: (role: Role, name?: string) => void;
}

const DEFAULT_SESSION: UserSession = {
  id: 'usr_001',
  name: 'Alex Johnson',
  email: 'alex@enterprise.dev',
  role: ROLES.ADMIN,
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

function getInitialSession(): UserSession {
  if (typeof window === 'undefined') return DEFAULT_SESSION;
  try {
    const savedRole = localStorage.getItem('demo_user_role') as Role | null;
    if (savedRole && Object.values(ROLES).includes(savedRole)) {
      return {
        ...DEFAULT_SESSION,
        role: savedRole,
        name: `${savedRole.replace('_', ' ')} Demo User`,
      };
    }
  } catch {
    // Ignore fallback
  }
  return DEFAULT_SESSION;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(getInitialSession);
  const isLoading = false;

  useEffect(() => {
    if (session) {
      document.cookie = `user_role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, [session]);

  const switchRole = (newRole: Role) => {
    const updated: UserSession = {
      id: `usr_${newRole.toLowerCase()}`,
      name: `${newRole.replace('_', ' ')} Demo User`,
      email: `${newRole.toLowerCase()}@enterprise.dev`,
      role: newRole,
    };
    setSession(updated);
    localStorage.setItem('demo_user_role', newRole);
    document.cookie = `user_role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
  };

  const login = (role: Role, name?: string) => {
    const newSession: UserSession = {
      id: `usr_${Date.now()}`,
      name: name || 'Demo Member',
      email: `${role.toLowerCase()}@enterprise.dev`,
      role,
    };
    setSession(newSession);
    localStorage.setItem('demo_user_role', role);
    document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Lax`;
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('demo_user_role');
    document.cookie = `user_role=; path=/; max-age=0; SameSite=Lax`;
  };

  return (
    <SessionContext.Provider value={{ session, isLoading, switchRole, logout, login }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
}
