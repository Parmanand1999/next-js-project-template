'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CommonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  headerClassName?: string;
}

const sizeClasses = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  '2xl': 'sm:max-w-5xl',
  full: 'sm:max-w-[95vw] h-[90vh]',
};

export function CommonModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
  headerClassName = '',
}: CommonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'p-0 rounded-2xl overflow-hidden border-border bg-card shadow-2xl flex flex-col',
          sizeClasses[size] || sizeClasses.md,
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <DialogHeader
            className={cn(
              'px-6 py-4 border-b border-border bg-muted/20 text-left',
              headerClassName
            )}
          >
            {title && (
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[75vh]">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CommonModal;
