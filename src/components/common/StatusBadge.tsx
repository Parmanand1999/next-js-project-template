'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'live';

export interface StatusBadgeProps {
  status?: string | StatusVariant;
  variant?: StatusVariant;
  label?: string;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<
  StatusVariant,
  { bg: string; text: string; border: string; dotBg: string }
> = {
  active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dotBg: 'bg-emerald-500',
  },
  success: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dotBg: 'bg-emerald-500',
  },
  approved: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dotBg: 'bg-emerald-500',
  },
  live: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dotBg: 'bg-emerald-500',
  },
  pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/20',
    dotBg: 'bg-amber-500',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/20',
    dotBg: 'bg-amber-500',
  },
  inactive: {
    bg: 'bg-muted/80',
    text: 'text-muted-foreground',
    border: 'border-border',
    dotBg: 'bg-muted-foreground',
  },
  rejected: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    dotBg: 'bg-destructive',
  },
  danger: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/20',
    dotBg: 'bg-destructive',
  },
  info: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    dotBg: 'bg-blue-500',
  },
};

export function StatusBadge({
  status,
  variant,
  label,
  dot = true,
  pulse = true,
  className = '',
}: StatusBadgeProps) {
  const normalizedKey = (
    variant ||
    (typeof status === 'string' ? status.toLowerCase() : 'info')
  ) as StatusVariant;

  const current = variantStyles[normalizedKey] || variantStyles.info;
  const displayLabel = label || status || normalizedKey;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {dot && (
        <span className="relative flex size-2 shrink-0">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex size-full rounded-full opacity-75',
                current.dotBg
              )}
            />
          )}
          <span
            className={cn('relative inline-flex rounded-full size-2', current.dotBg)}
          />
        </span>
      )}
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
