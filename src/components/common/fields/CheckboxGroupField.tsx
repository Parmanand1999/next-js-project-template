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
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupFieldProps {
  name: string;
  label?: string;
  options: CheckboxOption[];
  required?: boolean;
  disabled?: boolean;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function CheckboxGroupField({
  name,
  label,
  options = [],
  required = false,
  disabled = false,
  columns = 2,
  className = '',
}: CheckboxGroupFieldProps) {
  const { control } = useFormContext();

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedValues: string[] = Array.isArray(field.value)
          ? field.value
          : [];

        const toggleValue = (optionValue: string) => {
          if (disabled) return;
          const nextValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((value) => value !== optionValue)
            : [...selectedValues, optionValue];
          field.onChange(nextValues);
        };

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <FormLabel className="text-xs font-semibold text-foreground tracking-wide">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div className={cn('grid gap-2.5', colClasses[columns])}>
                {options.map((option) => {
                  const isChecked = selectedValues.includes(option.value);
                  const isOptDisabled = disabled || option.disabled;

                  return (
                    <label
                      key={option.value}
                      onClick={() => !isOptDisabled && toggleValue(option.value)}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border p-3 select-none transition-all cursor-pointer shadow-2xs',
                        isChecked
                          ? 'border-primary/50 bg-primary/5 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/30',
                        isOptDisabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                      )}
                    >
                      <div
                        className={cn(
                          'size-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                          isChecked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-input bg-background'
                        )}
                      >
                        {isChecked && <Check className="size-3 stroke-[3]" />}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground leading-tight">
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </FormControl>

            <FormMessage className="text-xs font-medium text-destructive">
              {fieldState.error?.message}
            </FormMessage>
          </FormItem>
        );
      }}
    />
  );
}

export default CheckboxGroupField;
