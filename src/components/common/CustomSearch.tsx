'use client';

import React, { useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  debounceMs?: number;
  onDebouncedSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export function CustomSearch({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  size = 'md',
  debounceMs = 0,
  onDebouncedSearch,
  autoFocus = false,
}: CustomSearchProps) {
  useEffect(() => {
    if (debounceMs <= 0 || !onDebouncedSearch) return;

    const timer = setTimeout(() => {
      onDebouncedSearch(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs, onDebouncedSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onDebouncedSearch) {
      onDebouncedSearch('');
    }
  };

  const sizeClasses = {
    sm: 'h-8 pl-8 pr-7 text-xs rounded-lg',
    md: 'h-9 pl-9 pr-8 text-xs sm:text-sm rounded-xl',
    lg: 'h-10 pl-10 pr-9 text-sm rounded-xl',
  };

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4.5',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Search
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors',
          iconSizes[size]
        )}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full border border-input bg-background text-foreground outline-none transition-all placeholder:text-muted-foreground shadow-2xs hover:border-input/80 focus:border-primary focus:ring-2 focus:ring-primary/20',
          sizeClasses[size],
          inputClassName
        )}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded transition-colors"
          aria-label="Clear search"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
}

export default CustomSearch;
