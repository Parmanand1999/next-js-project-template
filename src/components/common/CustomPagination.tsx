'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaginationState } from './DataTable';

export interface CustomPaginationProps {
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalCount: number;
  isLoading?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

export function CustomPagination({
  pagination,
  setPagination,
  totalCount,
  isLoading = false,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = '',
}: CustomPaginationProps) {
  const { pageIndex, pageSize } = pagination;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || isLoading) return;
    setPagination((prev) => ({
      ...prev,
      pageIndex: page,
    }));
  };

  const startIndex = Math.min((pageIndex - 1) * pageSize + 1, totalCount);
  const endIndex = Math.min(pageIndex * pageSize, totalCount);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border border-border rounded-2xl bg-card shadow-xs text-xs',
        className
      )}
    >
      {/* Left: Summary */}
      <div className="text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{totalCount > 0 ? startIndex : 0}</span> to{' '}
        <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
        <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> entries
        {totalPages > 1 && (
          <span className="ml-1 text-muted-foreground/80">
            (Page {pageIndex} of {totalPages})
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Rows Per Page */}
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            disabled={isLoading}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
                pageIndex: 1,
              }))
            }
            className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground shadow-2xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:cursor-not-allowed"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={pageIndex === 1 || isLoading}
            title="First Page"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronsLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 1 || isLoading}
            title="Previous Page"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg border border-primary/20">
            {pageIndex} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex >= totalPages || isLoading}
            title="Next Page"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={pageIndex >= totalPages || isLoading}
            title="Last Page"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronsRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomPagination;
