'use client';

import React, { useState, useMemo } from 'react';
import { ROLES, Role, ROLE_LABELS } from '@/config/roles';
import { UserItem } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable,
  ColumnDef,
  PaginationState,
  StatusBadge,
  ConfirmationModal,
  HasPermission,
} from '@/components/common';
import { Trash2, Edit3, UserPlus, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  {
    id: '6',
    name: 'Stanley Hudson',
    email: 'stanley@enterprise.dev',
    role: ROLES.USER,
    status: 'active',
    joinedAt: '2025-07-04',
  },
  {
    id: '7',
    name: 'Angela Martin',
    email: 'angela@enterprise.dev',
    role: ROLES.MANAGER,
    status: 'active',
    joinedAt: '2025-08-19',
  },
];

export function UserTable() {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 5,
  });

  // Modal State for Deletion
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = useMemo(() => {
    if (filterRole === 'ALL') return users;
    return users.filter((u) => u.role === filterRole);
  }, [users, filterRole]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setSelectedUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`User "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return 'destructive';
      case ROLES.ADMIN:
        return 'default';
      case ROLES.MANAGER:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const columns: ColumnDef<UserItem>[] = [
    {
      accessorKey: 'name',
      header: 'Member / Identity',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
              {row.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate font-normal">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Assigned Role',
      sortable: true,
      cell: ({ row }) => (
        <Badge variant={getRoleBadgeVariant(row.role)} className="text-[11px] font-semibold">
          {ROLE_LABELS[row.role]}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      sortable: true,
      cell: ({ row }) => (
        <StatusBadge
          status={row.status}
          variant={row.status === 'active' ? 'active' : 'pending'}
          dot={true}
          pulse={row.status === 'active'}
        />
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined Date',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.joinedAt}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toast.info(`Editing details for ${row.name}`)}
            title="Edit User"
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="size-3.5" />
          </Button>

          {/* Delete action guarded by RBAC - Only SUPER_ADMIN can trigger deletion */}
          <HasPermission role={ROLES.SUPER_ADMIN}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteTarget(row)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete User (Super Admin only)"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </HasPermission>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserIcon className="size-5 text-primary" />
            System Users & Access Control
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organization members, security access levels, and account statuses.
          </p>
        </div>

        {/* Action button protected by HasPermission */}
        <HasPermission role={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
          <Button
            size="sm"
            onClick={() => toast.success('Add User modal flow triggered!')}
            className="gap-2 bg-[#3456A7] hover:bg-[#274487] text-white shadow-xs"
          >
            <UserPlus className="size-4" />
            Add Member
          </Button>
        </HasPermission>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Filter Role:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', ...Object.values(ROLES)].map((roleOption) => (
            <button
              key={roleOption}
              type="button"
              onClick={() => {
                setFilterRole(roleOption);
                setPagination((prev) => ({ ...prev, pageIndex: 1 }));
              }}
              className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer font-medium ${
                filterRole === roleOption
                  ? 'bg-foreground text-background font-semibold border-foreground shadow-2xs'
                  : 'bg-card hover:bg-muted text-muted-foreground border-border'
              }`}
            >
              {roleOption === 'ALL' ? 'All Roles' : ROLE_LABELS[roleOption as Role]}
            </button>
          ))}
        </div>
      </div>

      {/* Upgraded DataTable with selection, sorting, pagination, search */}
      <DataTable<UserItem>
        columns={columns}
        data={filteredUsers}
        pagination={pagination}
        setPagination={setPagination}
        enableSearch={true}
        searchPlaceholder="Search members by name or email..."
        selectable={true}
        selectedRows={selectedUsers}
        onSelectionChange={setSelectedUsers}
        getRowId={(row) => row.id}
        emptyMessage="No members found"
        emptySubMessage="Try clearing your search query or selecting a different role filter."
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        type="delete"
        title="Delete User Account?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}" (${deleteTarget?.email})? All privileges and active sessions will be revoked.`}
        buttonText="Yes, Delete User"
        cancelButtonText="Cancel"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default UserTable;
