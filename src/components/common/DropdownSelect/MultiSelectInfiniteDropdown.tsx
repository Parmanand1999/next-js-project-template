"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react"
import useDebounce from "@/hooks/useDebounceHook"
import { cn } from "@/lib/utils"

export interface MultiFetchParams {
  page: number
  search: string
  pageSize: number
  [key: string]: unknown
}

export interface MultiFetchResponse<T = unknown> {
  data?: T[]
  pagination?: {
    currentPage: number
    hasNextPage: boolean
    totalItems: number
    totalPages?: number
  }
  hasNextPage?: boolean
  totalItems?: number
}

export interface MultiSelectInfiniteDropdownProps<T = unknown> {
  label?: string
  placeholder?: string
  selectedValues: T[]
  onSelectionChange: (selected: T[]) => void
  fetchOptions: (params: MultiFetchParams) => Promise<MultiFetchResponse<T>>
  fetchDependencies?: Record<string, unknown>
  isDisabled?: boolean
  isSearchable?: boolean
  startIcon?: React.ReactNode
  className?: string
  buttonClassName?: string
  dropdownClassName?: string
  selectedTagClassName?: string
  getOptionLabel: (option: T) => string
  getOptionDescription?: (option: T) => string
  pageSize?: number
  debounceDelay?: number
  scrollThreshold?: number
  maxDropdownHeight?: string
  required?: boolean
  error?: string | { message?: string } | null
}

export function MultiSelectInfiniteDropdown<T extends { _id?: string; id?: string | number }>({
  label,
  placeholder = "Select options...",
  selectedValues = [],
  onSelectionChange,
  fetchOptions,
  fetchDependencies = {},
  isDisabled = false,
  isSearchable = true,
  startIcon,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  selectedTagClassName = "",
  getOptionLabel,
  getOptionDescription,
  pageSize = 10,
  debounceDelay = 500,
  scrollThreshold = 50,
  maxDropdownHeight = "max-h-56",
  required = false,
  error = null,
}: MultiSelectInfiniteDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<T[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const optionsListRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)

  const debouncedSearchTerm = useDebounce(searchTerm.trim(), debounceDelay)

  const isOptionSelected = useCallback(
    (option: T) => {
      const optId = option._id || String(option.id ?? "")
      return selectedValues.some((selected) => {
        const selId = selected._id || String(selected.id ?? "")
        return selId === optId
      })
    },
    [selectedValues]
  )

  const loadOptions = useCallback(
    async (shouldReset = false) => {
      if (!isMountedRef.current) return

      const pageToFetch = shouldReset ? 1 : currentPage
      if (!shouldReset && (!hasMoreData || isLoading)) return

      setIsLoading(true)

      try {
        const response = await fetchOptions({
          page: pageToFetch,
          search: debouncedSearchTerm,
          pageSize,
          ...fetchDependencies,
        })

        if (!isMountedRef.current) return

        let newOptions: T[] = []
        let newHasMore = false
        let newTotalItems = 0
        let nextPage = pageToFetch + 1

        if (response && response.data) {
          newOptions = response.data

          if (response.pagination) {
            newHasMore = Boolean(response.pagination.hasNextPage)
            newTotalItems = response.pagination.totalItems ?? 0
            nextPage = (response.pagination.currentPage ?? pageToFetch) + 1
          } else if (response.hasNextPage !== undefined) {
            newHasMore = Boolean(response.hasNextPage)
            newTotalItems = response.totalItems || response.data.length
          } else {
            newHasMore = response.data.length === pageSize
            newTotalItems = shouldReset
              ? response.data.length
              : totalItems + response.data.length
          }
        }

        setOptions((prev) => (shouldReset ? newOptions : [...prev, ...newOptions]))
        setHasMoreData(newHasMore)
        setTotalItems(newTotalItems)
        setCurrentPage(nextPage)
      } catch (err) {
        console.error("Error loading options in MultiSelectInfiniteDropdown:", err)
        if (isMountedRef.current) {
          setHasMoreData(false)
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [
      fetchOptions,
      debouncedSearchTerm,
      pageSize,
      fetchDependencies,
      isLoading,
      currentPage,
      hasMoreData,
      totalItems,
    ]
  )

  useEffect(() => {
    if (isOpen && !isDisabled) {
      const timer = setTimeout(() => {
        loadOptions(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, debouncedSearchTerm, isDisabled, loadOptions])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setSearchTerm("")
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleScroll = useCallback(() => {
    const container = optionsListRef.current
    if (!container || isLoading || !hasMoreData) return

    const { scrollTop, clientHeight, scrollHeight } = container
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - scrollThreshold

    if (isNearBottom) {
      loadOptions(false)
    }
  }, [isLoading, hasMoreData, scrollThreshold, loadOptions])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleToggleOption = useCallback(
    (option: T) => {
      const optId = option._id || String(option.id ?? "")
      const isSelected = selectedValues.some(
        (s) => (s._id || String(s.id ?? "")) === optId
      )

      if (isSelected) {
        onSelectionChange(
          selectedValues.filter((s) => (s._id || String(s.id ?? "")) !== optId)
        )
      } else {
        onSelectionChange([...selectedValues, option])
      }
    },
    [selectedValues, onSelectionChange]
  )

  const handleRemoveTag = useCallback(
    (optionId: string, event: React.MouseEvent | React.KeyboardEvent) => {
      event.stopPropagation()
      onSelectionChange(
        selectedValues.filter(
          (s) => (s._id || String(s.id ?? "")) !== optionId
        )
      )
    },
    [selectedValues, onSelectionChange]
  )

  const handleClearAll = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      event.stopPropagation()
      onSelectionChange([])
    },
    [onSelectionChange]
  )

  const toggleDropdown = useCallback(() => {
    if (!isDisabled) {
      setIsOpen((prev) => !prev)
    }
  }, [isDisabled])

  const getOptionKey = (option: T, idx: number) => {
    return option._id || (option.id !== undefined ? String(option.id) : String(idx))
  }

  return (
    <div className={cn("relative w-full", className)} ref={dropdownContainerRef}>
      {label && (
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={isDisabled}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-lg border bg-background px-3.5 py-1.5 text-left text-sm shadow-xs transition-all",
          isDisabled
            ? "cursor-not-allowed bg-muted text-muted-foreground border-border"
            : error
            ? "border-destructive focus:ring-2 focus:ring-destructive/20"
            : "border-input hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          buttonClassName
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {startIcon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {startIcon}
            </span>
          )}

          <div className="flex flex-1 flex-wrap gap-1.5 min-w-0">
            {selectedValues && selectedValues.length > 0 ? (
              <>
                {selectedValues.map((option, idx) => {
                  const optId = option._id || String(option.id ?? idx)
                  return (
                    <span
                      key={optId}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary",
                        selectedTagClassName
                      )}
                    >
                      <span className="truncate max-w-[140px]">
                        {getOptionLabel(option)}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer hover:text-destructive p-0.5 transition-colors"
                        onClick={(e) => handleRemoveTag(optId, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleRemoveTag(optId, e)
                          }
                        }}
                      >
                        <X size={12} />
                      </span>
                    </span>
                  )
                })}
                {selectedValues.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClearAll}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleClearAll(e)
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive cursor-pointer self-center transition-colors font-medium px-1"
                  >
                    Clear all
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          size={16}
          className={cn(
            "ml-2 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {error && (
        <p className="text-xs text-destructive mt-1 font-medium">
          {typeof error === "string" ? error : error?.message}
        </p>
      )}

      {isOpen && !isDisabled && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95",
            dropdownClassName
          )}
        >
          {isSearchable && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/40">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="h-8 w-full border-none bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
                autoFocus
              />
              {searchTerm && (
                <X
                  size={14}
                  className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          )}

          <div
            ref={optionsListRef}
            onScroll={handleScroll}
            className={cn(`${maxDropdownHeight} overflow-y-auto p-1.5`)}
          >
            {options.map((option, idx) => {
              const optKey = getOptionKey(option, idx)
              const selected = isOptionSelected(option)

              return (
                <button
                  key={optKey}
                  type="button"
                  onClick={() => handleToggleOption(option)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs sm:text-sm transition-colors cursor-pointer",
                    selected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{getOptionLabel(option)}</p>
                    {getOptionDescription && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {getOptionDescription(option)}
                      </p>
                    )}
                  </div>
                  {selected && (
                    <Check size={15} className="text-primary shrink-0 ml-2" />
                  )}
                </button>
              )
            })}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>Loading more...</span>
              </div>
            )}

            {!isLoading && options.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {searchTerm ? "No matching results found" : "No data available"}
              </div>
            )}

            {!isLoading && !hasMoreData && options.length > 0 && (
              <div className="py-2 text-center text-[11px] text-muted-foreground">
                End of results
              </div>
            )}
          </div>

          {!isLoading && options.length > 0 && totalItems > options.length && (
            <div className="px-3 py-1.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground text-center">
              Showing {options.length} of {totalItems} items
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelectInfiniteDropdown
