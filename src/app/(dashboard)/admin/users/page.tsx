import React from 'react';
import { UserTable } from '@/features/users';

export const metadata = {
  title: 'User Management | Admin Portal',
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <UserTable />
    </div>
  );
}
