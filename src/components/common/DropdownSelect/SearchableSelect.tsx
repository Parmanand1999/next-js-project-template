/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  name?: string;
  description?: string;
  subText?: string;
  icon?: React.ReactNode;
  flag?: string;
  isoCode?: string;
  disabled?: boolean;
}

export type SelectValue = string | number | (string | number)[];

export interface SearchableSelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[] | null;
  onChange: (value: SelectValue, option?: SelectOption | SelectOption[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  error?: string | { message?: string } | null;
  className?: string;
  dropdownClassName?: string;
}

export function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  required = false,
  disabled = false,
  isLoading = false,
  isMulti = false,
  isClearable = true,
  error,
  className = '',
  dropdownClassName = '',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const instanceId = useId();

  // Selected values array
  const selectedValues = React.useMemo(() => {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return value;
    return [value];
  }, [value]);

  // Update popup coordinates based on trigger position
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 260; // Estimated max dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setCoords({
      top: openUpward ? rect.top : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }, []);

  // Recalculate position when opened and on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const handleScroll = (e: Event) => {
      // Don't close or shake if scrolling inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, updatePosition]);

  const openDropdown = () => {
    if (disabled) return;
    setHighlightedIndex(0);
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter((opt) => {
      const text = `${opt.label || opt.name || ''} ${opt.description || opt.subText || ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [options, searchTerm]);

  // Handle single and multi selection
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    const optVal = option.value ?? option.name;
    if (isMulti) {
      const isAlreadySelected = selectedValues.includes(optVal);
      const nextValues = isAlreadySelected
        ? selectedValues.filter((v) => v !== optVal)
        : [...selectedValues, optVal];

      const selectedOptionObjs = options.filter((o) => nextValues.includes(o.value ?? o.name));
      onChange(nextValues, selectedOptionObjs);
    } else {
      onChange(optVal, option);
      closeDropdown();
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti) {
      onChange([], []);
    } else {
      onChange('', undefined);
    }
  };

  const handleRemoveSingle = (e: React.MouseEvent, val: string | number) => {
    e.stopPropagation();
    const nextValues = selectedValues.filter((v) => v !== val);
    const selectedOptionObjs = options.filter((o) => nextValues.includes(o.value ?? o.name));
    onChange(nextValues, selectedOptionObjs);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredOptions[highlightedIndex];
      if (current) {
        handleSelect(current);
      }
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Selected Option Object for single select
  const singleSelectedOption = React.useMemo(() => {
    if (isMulti) return null;
    return options.find(
      (opt) =>
        opt.value === value || opt.name === value || opt.label === value
    );
  }, [isMulti, options, value]);

  const displaySingleLabel = singleSelectedOption
    ? singleSelectedOption.label || singleSelectedOption.name
    : (value as string);

  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={cn('space-y-1.5 relative w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={instanceId}
          className="text-xs font-semibold text-foreground tracking-wide flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-destructive">*</span>}
          </span>
        </label>
      )}

      {/* Trigger Button */}
      <div
        id={instanceId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${instanceId}-listbox`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!disabled) {
            if (isOpen) {
              closeDropdown();
            } else {
              openDropdown();
            }
          }
        }}
        className={cn(
          'min-h-10 w-full rounded-xl border px-3 py-1.5 text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-all select-none shadow-2xs',
          disabled && 'bg-muted/60 text-muted-foreground border-border/80 cursor-not-allowed opacity-60',
          !disabled && errorMessage && 'border-destructive bg-background ring-2 ring-destructive/20',
          !disabled && !errorMessage && 'bg-background border-input text-foreground hover:border-input/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
          isOpen && 'ring-2 ring-primary/20 border-primary'
        )}
      >
        {/* Content Preview */}
        <div className="flex flex-wrap items-center gap-1.5 truncate max-w-[85%]">
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Loading options...
            </span>
          ) : isMulti ? (
            selectedValues.length > 0 ? (
              selectedValues.map((val) => {
                const opt = options.find((o) => o.value === val || o.name === val);
                return (
                  <span
                    key={String(val)}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg text-xs font-medium"
                  >
                    {opt?.isoCode ? (
                      <img
                        src={`https://flagcdn.com/w40/${opt.isoCode.toLowerCase()}.png`}
                        alt={opt.isoCode}
                        className="w-3.5 h-2.5 object-cover rounded-xs border border-border shrink-0"
                      />
                    ) : null}
                    <span className="truncate max-w-[120px]">{opt?.label || val}</span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSingle(e, val)}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )
          ) : (
            <div className="flex items-center gap-2 truncate">
              {singleSelectedOption?.isoCode ? (
                <img
                  src={`https://flagcdn.com/w40/${singleSelectedOption.isoCode.toLowerCase()}.png`}
                  alt={singleSelectedOption.isoCode}
                  className="w-4 h-3 object-cover rounded-xs border border-border shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : singleSelectedOption?.flag ? (
                <span className="text-sm shrink-0">{singleSelectedOption.flag}</span>
              ) : singleSelectedOption?.icon ? (
                <span className="shrink-0 text-muted-foreground">
                  {singleSelectedOption.icon}
                </span>
              ) : null}

              <span
                className={cn(
                  'truncate',
                  displaySingleLabel ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {displaySingleLabel || placeholder}
              </span>
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isClearable && !disabled && (isMulti ? selectedValues.length > 0 : Boolean(displaySingleLabel)) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              title="Clear selection"
            >
              <X className="size-3.5" />
            </button>
          )}

          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180 text-primary'
            )}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-destructive text-xs font-medium mt-0.5">{errorMessage}</p>
      )}

      {/* Floating Dropdown List via Portal */}
      {isOpen &&
        !disabled &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: coords.openUpward ? 'auto' : `${coords.top}px`,
              bottom: coords.openUpward
                ? `${Math.max(8, window.innerHeight - coords.top)}px`
                : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={cn(
              'bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs',
              dropdownClassName
            )}
          >
            {/* Search Box */}
            <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-2">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search ${label ? label.toLowerCase() : 'options'}...`}
                className="w-full text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* List of items */}
            <div
              id={`${instanceId}-listbox`}
              ref={listRef}
              role="listbox"
              className="max-h-56 overflow-y-auto p-1.5 space-y-0.5"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => {
                  const optVal = opt.value ?? opt.name;
                  const optLabel = opt.label ?? opt.name;
                  const isSelected = selectedValues.includes(optVal);
                  const isHighlighted = highlightedIndex === index;

                  return (
                    <div
                      key={String(optVal || optLabel)}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        'px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-2 text-xs select-none',
                        opt.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : isHighlighted
                          ? 'bg-muted text-foreground'
                          : 'text-foreground/90 hover:bg-muted/70'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        {opt.isoCode ? (
                          <img
                            src={`https://flagcdn.com/w40/${opt.isoCode.toLowerCase()}.png`}
                            alt={opt.isoCode}
                            className="w-4 h-3 object-cover rounded-xs border border-border shrink-0"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : opt.flag ? (
                          <span className="text-sm shrink-0">{opt.flag}</span>
                        ) : opt.icon ? (
                          <span className="shrink-0 text-muted-foreground">{opt.icon}</span>
                        ) : null}

                        <div className="flex flex-col min-w-0 truncate">
                          <span className="truncate">{optLabel}</span>
                          {(opt.description || opt.subText) && (
                            <span className="text-[11px] text-muted-foreground font-normal truncate">
                              {opt.description || opt.subText}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.isoCode && (
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
                            {opt.isoCode}
                          </span>
                        )}
                        {isSelected && <Check className="size-4 text-primary shrink-0" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No matching options found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default SearchableSelect;
