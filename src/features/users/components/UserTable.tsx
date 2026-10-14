'use client';

import React, { useState } from 'react';
import { ROLES, Role, ROLE_LABELS } from '@/config/roles';
import { UserItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { Trash2, Edit3, UserPlus } from 'lucide-react';

const INITIAL_USERS: UserItem[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@enterprise.dev',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    joinedAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Michael Scott',
    email: 'michael@enterprise.dev',
    role: ROLES.ADMIN,
    status: 'active',
    joinedAt: '2025-03-22',
  },
  {
    id: '3',
    name: 'Jim Halpert',
    email: 'jim@enterprise.dev',
    role: ROLES.MANAGER,
    status: 'active',
    joinedAt: '2025-04-10',
  },
  {
    id: '4',
    name: 'Pam Beesly',
    email: 'pam@enterprise.dev',
    role: ROLES.USER,
    status: 'active',
    joinedAt: '2025-05-01',
  },
  {
    id: '5',
    name: 'Dwight Schrute',
    email: 'dwight@enterprise.dev',
    role: ROLES.MANAGER,
    status: 'pending',
    joinedAt: '2025-06-12',
  },
];

export function UserTable() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const filteredUsers = filterRole === 'ALL'
    ? users
    : users.filter((u) => u.role === filterRole);

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'destructive';
      case ROLES.ADMIN:
        return 'default';
      case ROLES.MANAGER:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">System Users & Access Control</h2>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions across your organization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Action button protected by RoleGuard - Only Super Admin & Admin can see */}
          <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
            <Button size="sm" className="gap-1.5">
              <UserPlus className="size-4" />
              Add User
            </Button>
          </RoleGuard>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Filter Role:</span>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', ...Object.values(ROLES)].map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => setFilterRole(roleOption)}
              className={`px-2.5 py-1 text-xs rounded-full border transition ${
                filterRole === roleOption
                  ? 'bg-foreground text-background font-medium border-foreground'
                  : 'bg-background hover:bg-muted text-muted-foreground border-border'
              }`}
            >
              {roleOption === 'ALL' ? 'All Roles' : ROLE_LABELS[roleOption as Role]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {user.joinedAt}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1">
                    <Button variant="ghost" size="icon-sm" title="Edit user">
                      <Edit3 className="size-3.5 text-muted-foreground" />
                    </Button>

                    {/* Delete action guarded - only SUPER_ADMIN can delete users */}
                    <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(user.id)}
                        className="hover:text-destructive hover:bg-destructive/10"
                        title="Delete user (Super Admin only)"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </RoleGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
