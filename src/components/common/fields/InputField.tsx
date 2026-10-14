'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  uppercase?: boolean;
  numbersOnly?: boolean;
  maxLength?: number;
  className?: string;
  showPasswordToggle?: boolean;
  description?: string;
}

export function InputField({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  uppercase = false,
  numbersOnly = false,
  maxLength,
  className = '',
  showPasswordToggle = false,
  description,
  ...props
}: InputFieldProps) {
  const { control } = useFormContext();
  const [isVisible, setIsVisible] = useState(false);

  const isPassword = type === 'password' || showPasswordToggle;
  const inputType = isPassword ? (isVisible ? 'text' : 'password') : type;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-1.5">
          {label && (
            <FormLabel className="text-xs font-semibold text-foreground tracking-wide">
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}

          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={inputType}
                disabled={disabled}
                placeholder={placeholder}
                value={field.value ?? ''}
                onChange={(e) => {
                  let value = e.target.value;
                  if (numbersOnly) {
                    value = value.replace(/\D/g, '');
                  }
                  if (typeof maxLength === 'number') {
                    value = value.slice(0, maxLength);
                  }
                  if (uppercase) {
                    value = value.toUpperCase();
                  }
                  field.onChange(value);
                }}
                maxLength={maxLength}
                aria-invalid={!!fieldState.error}
                className={cn(
                  'h-10 border-input bg-background text-foreground shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary/20',
                  isPassword && 'pr-10',
                  fieldState.error && 'border-destructive ring-2 ring-destructive/20',
                  className
                )}
                {...props}
              />
              {isPassword && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors cursor-pointer"
                  aria-label={isVisible ? 'Hide password' : 'Show password'}
                >
                  {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              )}
            </div>
          </FormControl>

          {description && !fieldState.error && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          <FormMessage className="text-xs font-medium text-destructive">
            {fieldState.error?.message}
          </FormMessage>
        </FormItem>
      )}
    />
  );
}

export default InputField;
