'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Inbox,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key?: string;
  accessorKey?: keyof T | string;
  header: string | React.ReactNode;
  cell?: (info: { row: T; index: number; value: unknown }) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  totalCount?: number;
  loading?: boolean;
  pagination?: PaginationState;
  setPagination?: React.Dispatch<React.SetStateAction<PaginationState>>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  onRowClick?: (row: T, index: number) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  getRowId?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  emptySubMessage?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data = [],
  totalCount,
  loading = false,
  pagination,
  setPagination,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  enableSearch = false,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row, idx) => {
    const r = row as Record<string, unknown>;
    const id = r.id ?? r._id;
    return typeof id === 'string' || typeof id === 'number' ? id : idx;
  },
  emptyMessage = 'No records found',
  emptySubMessage = 'Try adjusting your search or filters.',
  className = '',
  actions,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });

  // Use controlled search query or internal state
  const activeSearch = searchQuery !== undefined ? searchQuery : internalSearch;
  const handleSearch = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  // Client-side filtering if search is enabled and no external totalCount is provided
  const filteredData = useMemo(() => {
    if (!activeSearch.trim()) return data;
    const q = activeSearch.toLowerCase();
    return data.filter((item) =>
      Object.values(item as Record<string, unknown>).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      )
    );
  }, [data, activeSearch]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      const rA = a as Record<string, unknown>;
      const rB = b as Record<string, unknown>;
      const aVal = rA[sortConfig.key];
      const bVal = rB[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const compareResult = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });
  }, [filteredData, sortConfig]);

  // Pagination calculation
  const pageIndex = pagination?.pageIndex ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const calculatedTotal = totalCount !== undefined ? totalCount : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(calculatedTotal / pageSize));

  // Sliced data if client-side paginated
  const displayData = useMemo(() => {
    if (totalCount !== undefined) {
      // Server-side paginated data is already sliced
      return sortedData;
    }
    const start = (pageIndex - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, totalCount, pageIndex, pageSize]);

  // Sort toggle handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: '', direction: null };
    });
  };

  // Selection toggle
  const isRowSelected = (row: T, idx: number) => {
    const rowId = getRowId(row, idx);
    return selectedRows.some((r, i) => getRowId(r, i) === rowId);
  };

  const handleSelectRow = (row: T, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    const rowId = getRowId(row, idx);
    const exists = selectedRows.some((r, i) => getRowId(r, i) === rowId);
    if (exists) {
      onSelectionChange(selectedRows.filter((r, i) => getRowId(r, i) !== rowId));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange([...displayData]);
    } else {
      onSelectionChange([]);
    }
  };

  // Dynamic page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= pageIndex - delta && i <= pageIndex + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  }, [totalPages, pageIndex]);

  const startIndex = (pageIndex - 1) * pageSize + 1;
  const endIndex = Math.min(pageIndex * pageSize, calculatedTotal);

  return (
    <div className={cn('space-y-4 w-full', className)}>
      {/* Top Controls: Search and Custom Actions */}
      {(enableSearch || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {enableSearch && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={activeSearch}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground shadow-2xs outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {activeSearch && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Main Table Container */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                {selectable && (
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={
                        displayData.length > 0 &&
                        displayData.every((r, i) => isRowSelected(r, i))
                      }
                      onChange={handleSelectAll}
                      className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col, idx) => {
                  const key = String(col.accessorKey ?? col.key ?? idx);
                  const isSorted = sortConfig.key === key;

                  return (
                    <th
                      key={key}
                      onClick={() => col.sortable && handleSort(key)}
                      className={cn(
                        'px-4 py-3.5 select-none transition-colors',
                        col.sortable && 'cursor-pointer hover:bg-muted/70 hover:text-foreground',
                        col.headerClassName
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-muted-foreground">
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="size-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="size-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                Array.from({ length: pageSize > 8 ? 8 : pageSize }).map((_, rIdx) => (
                  <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                    {selectable && (
                      <td className="px-4 py-3 text-center">
                        <Skeleton className="size-4 rounded mx-auto" />
                      </td>
                    )}
                    {columns.map((_, cIdx) => (
                      <td key={`loading-cell-${cIdx}`} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-3/4 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayData.length > 0 ? (
                displayData.map((row, rowIdx) => {
                  const isSelected = isRowSelected(row, rowIdx);

                  return (
                    <tr
                      key={String(getRowId(row, rowIdx))}
                      onClick={() => onRowClick && onRowClick(row, rowIdx)}
                      className={cn(
                        'transition-colors text-xs sm:text-sm',
                        onRowClick && 'cursor-pointer hover:bg-muted/50',
                        !onRowClick && 'hover:bg-muted/30',
                        isSelected && 'bg-primary/5 hover:bg-primary/10'
                      )}
                    >
                      {selectable && (
                        <td
                          className="px-4 py-3 text-center"
                          onClick={(e) => handleSelectRow(row, rowIdx, e)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="size-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col, colIdx) => {
                        const key = String(col.accessorKey ?? col.key ?? colIdx);
                        const cellValue = col.accessorKey ? row[col.accessorKey as keyof T] : undefined;

                        return (
                          <td
                            key={key}
                            className={cn('px-4 py-3 text-foreground/90', col.className)}
                          >
                            {col.cell
                              ? col.cell({ row, index: rowIdx, value: cellValue })
                              : (cellValue as React.ReactNode) ?? '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Inbox className="size-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
                      <p className="text-xs text-muted-foreground">{emptySubMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        {setPagination && calculatedTotal > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-border bg-card/60 text-xs">
            {/* Left: Summary text */}
            <div className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{startIndex}</span> to{' '}
              <span className="font-semibold text-foreground">{endIndex}</span> of{' '}
              <span className="font-semibold text-foreground">{calculatedTotal.toLocaleString()}</span> entries
            </div>

            {/* Right: Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Rows per page */}
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      pageIndex: 1,
                    }))
                  }
                  className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground shadow-2xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Navigation Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 1 }))}
                  disabled={pageIndex === 1 || loading}
                  title="First Page"
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsLeft className="size-4" />
                </button>

                {/* Previous Page */}
                <button
                  type="button"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.max(1, prev.pageIndex - 1),
                    }))
                  }
                  disabled={pageIndex === 1 || loading}
                  title="Previous Page"
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {/* Page Number Pills */}
                {pageNumbers.map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`dots-${idx}`}
                      className="px-1 text-xs text-muted-foreground select-none"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: page as number,
                        }))
                      }
                      disabled={loading}
                      className={cn(
                        'flex size-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs transition-all cursor-pointer font-medium',
                        pageIndex === page
                          ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                          : 'border border-border bg-background text-foreground hover:bg-muted'
                      )}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.min(totalPages, prev.pageIndex + 1),
                    }))
                  }
                  disabled={pageIndex >= totalPages || loading}
                  title="Next Page"
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: totalPages,
                    }))
                  }
                  disabled={pageIndex >= totalPages || loading}
                  title="Last Page"
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
