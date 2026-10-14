'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmationType = 'info' | 'warning' | 'error' | 'delete' | 'success';

export interface ConfirmationModalProps {
  open: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  cancelButtonText?: string;
  loading?: boolean;
  type?: ConfirmationType;
  confirmButtonClassName?: string;
}

const iconMap = {
  info: {
    icon: Info,
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    btnVariant: 'default' as const,
    btnClass: 'bg-[#3456A7] hover:bg-[#274487] text-white',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    btnVariant: 'default' as const,
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  error: {
    icon: XCircle,
    bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    btnVariant: 'destructive' as const,
    btnClass: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
  },
  delete: {
    icon: XCircle,
    bg: 'bg-destructive/10 text-destructive',
    btnVariant: 'destructive' as const,
    btnClass: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    btnVariant: 'default' as const,
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
};

export function ConfirmationModal({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  description = 'Are you sure you want to proceed with this action? This cannot be undone.',
  buttonText = 'Yes, Continue',
  cancelButtonText = 'Cancel',
  loading = false,
  type = 'warning',
  confirmButtonClassName = '',
}: ConfirmationModalProps) {
  const currentConfig = iconMap[type] || iconMap.info;
  const Icon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden border-border bg-card shadow-2xl">
        {/* Content */}
        <div className="flex flex-col items-center text-center gap-4 px-6 pt-8 pb-4">
          <div
            className={cn(
              'size-16 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-200',
              currentConfig.bg
            )}
          >
            <Icon className="size-8" />
          </div>

          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </DialogHeader>
        </div>

        {/* Action Footer */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2.5 px-6 pb-6 pt-2 bg-muted/20 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:flex-1 h-10 rounded-xl font-medium"
          >
            {cancelButtonText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'w-full sm:flex-1 h-10 rounded-xl font-semibold gap-2 shadow-sm',
              currentConfig.btnClass,
              confirmButtonClassName
            )}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmationModal;
