'use client';

import React from 'react';
import { SessionProvider } from './SessionProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
