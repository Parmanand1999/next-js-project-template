'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface TextareaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showCount?: boolean;
  className?: string;
  description?: string;
}

export function TextareaField({
  name,
  label,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  maxLength,
  showCount = false,
  className = '',
  description,
  ...props
}: TextareaFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const currentLength = (field.value || '').length;

        return (
          <FormItem className="space-y-1.5">
            <div className="flex items-center justify-between">
              {label && (
                <FormLabel className="text-xs font-semibold text-foreground tracking-wide">
                  {label}
                  {required && <span className="ml-1 text-destructive">*</span>}
                </FormLabel>
              )}
              {showCount && maxLength && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  {currentLength} / {maxLength}
                </span>
              )}
            </div>

            <FormControl>
              <Textarea
                {...field}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                aria-invalid={!!fieldState.error}
                className={cn(
                  'rounded-xl border-input bg-background text-foreground shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary/20',
                  disabled && 'opacity-60 cursor-not-allowed bg-muted',
                  fieldState.error && 'border-destructive ring-2 ring-destructive/20',
                  className
                )}
                {...props}
              />
            </FormControl>

            {description && !fieldState.error && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            <FormMessage className="text-xs font-medium text-destructive">
              {fieldState.error?.message}
            </FormMessage>
          </FormItem>
        );
      }}
    />
  );
}

export default TextareaField;
