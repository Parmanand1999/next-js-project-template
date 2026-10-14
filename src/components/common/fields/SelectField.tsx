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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectFieldOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export function SelectField({
  name,
  label,
  placeholder = 'Select an option',
  options = [],
  required = false,
  disabled = false,
  className = '',
  description,
}: SelectFieldProps) {
  const { control } = useFormContext();

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
            <Select
              value={field.value ?? ''}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger
                disabled={disabled}
                className={cn(
                  'h-10 w-full border-input bg-background text-foreground shadow-2xs font-normal focus-visible:ring-2 focus-visible:ring-primary/20',
                  disabled && 'opacity-60 cursor-not-allowed bg-muted',
                  fieldState.error && 'border-destructive ring-2 ring-destructive/20',
                  className
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default SelectField;
