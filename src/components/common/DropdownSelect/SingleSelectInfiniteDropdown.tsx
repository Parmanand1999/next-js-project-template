"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { ChevronDown, Search, Loader2, X, Check } from "lucide-react"
import useDebounce from "@/hooks/useDebounce"
import { CustomButton } from "../Buttons/CustomButton"
import { cn } from "@/lib/utils"

export interface FetchOptionsParams {
  page: number
  search: string
  pageSize: number
  [key: string]: unknown
}

export interface FetchOptionsResponse<T = unknown> {
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

export interface SingleSelectInfiniteDropdownProps<T = unknown> {
  label?: string
  placeholder?: string
  selectedValue?: T | null
  onSelectionChange: (value: T | null) => void
  fetchOptions: (params: FetchOptionsParams) => Promise<FetchOptionsResponse<T>>
  fetchDependencies?: Record<string, unknown>
  isDisabled?: boolean
  isSearchable?: boolean
  requireConfirmation?: boolean
  startIcon?: React.ReactNode
  className?: string
  buttonClassName?: string
  dropdownClassName?: string
  getOptionLabel: (option: T) => string
  getOptionDescription?: (option: T) => string
  excludedOptionIds?: string[]
  pageSize?: number
  debounceDelay?: number
  scrollThreshold?: number
  required?: boolean
  error?: string | { message?: string } | null
}

export function SingleSelectInfiniteDropdown<T extends { _id?: string; id?: string | number }>({
  label,
  placeholder = "Select option...",
  selectedValue,
  onSelectionChange,
  fetchOptions,
  fetchDependencies = {},
  isDisabled = false,
  isSearchable = true,
  requireConfirmation = false,
  startIcon,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  getOptionLabel,
  getOptionDescription,
  excludedOptionIds = [],
  pageSize = 10,
  debounceDelay = 500,
  scrollThreshold = 50,
  required = false,
  error = null,
}: SingleSelectInfiniteDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<T[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  // Adjust state when selectedValue prop changes during render (React recommended pattern)
  const [prevSelectedValue, setPrevSelectedValue] = useState<T | null | undefined>(selectedValue)
  const [selectedOption, setSelectedOption] = useState<T | null>(selectedValue ?? null)
  const [tempSelectedOption, setTempSelectedOption] = useState<T | null>(null)

  if (selectedValue !== prevSelectedValue) {
    setPrevSelectedValue(selectedValue)
    setSelectedOption(selectedValue ?? null)
    setTempSelectedOption(null)
  }

  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const optionsListRef = useRef<HTMLDivElement>(null)
  const isMountedRef = useRef(true)

  const debouncedSearchTerm = useDebounce(searchTerm.trim(), debounceDelay)

  const displayOption = selectedOption || tempSelectedOption
  const selectedOptionLabel = displayOption ? getOptionLabel(displayOption) : ""

  const filteredOptions = useMemo(() => {
    return options.filter((option) => {
      const optId = option._id || String(option.id || "")
      return !excludedOptionIds.includes(optId)
    })
  }, [options, excludedOptionIds])

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
        console.error("Error loading options in SingleSelectInfiniteDropdown:", err)
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
          if (requireConfirmation) {
            setTempSelectedOption(null)
          }
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, requireConfirmation])

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

  const handleOptionSelect = (option: T) => {
    if (requireConfirmation) {
      setTempSelectedOption(option)
    } else {
      setSelectedOption(option)
      onSelectionChange(option)
      setIsOpen(false)
      setTimeout(() => {
        if (isMountedRef.current) {
          setSearchTerm("")
        }
      }, 200)
    }
  }

  const handleConfirmSelection = () => {
    if (tempSelectedOption) {
      setSelectedOption(tempSelectedOption)
      onSelectionChange(tempSelectedOption)
      setTempSelectedOption(null)
      setIsOpen(false)
      setTimeout(() => {
        if (isMountedRef.current) {
          setSearchTerm("")
        }
      }, 200)
    }
  }

  const handleCancelSelection = () => {
    setTempSelectedOption(null)
    setIsOpen(false)
    setTimeout(() => {
      if (isMountedRef.current) {
        setSearchTerm("")
      }
    }, 200)
  }

  const clearSelection = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation()
    setSelectedOption(null)
    setTempSelectedOption(null)
    onSelectionChange(null)
  }

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen((prev) => !prev)
      if (requireConfirmation) {
        setTempSelectedOption(null)
      }
    }
  }

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
          "flex h-10 w-full items-center justify-between rounded-lg border bg-background px-3.5 text-left text-sm shadow-xs transition-all",
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
          <span
            className={cn(
              "truncate",
              selectedOptionLabel
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            {selectedOptionLabel || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedValue && !isDisabled && (
            <span
              role="button"
              tabIndex={0}
              className="text-muted-foreground hover:text-destructive cursor-pointer p-0.5 rounded transition-colors"
              onClick={clearSelection}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") clearSelection(e)
              }}
            >
              <X size={15} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={cn(
              "text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
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
            className="max-h-56 overflow-y-auto p-1.5"
          >
            {filteredOptions.map((option, idx) => {
              const optKey = getOptionKey(option, idx)
              const isSelected = requireConfirmation
                ? (tempSelectedOption?._id || tempSelectedOption?.id) === (option._id || option.id)
                : (selectedOption?._id || selectedOption?.id) === (option._id || option.id)

              return (
                <button
                  key={optKey}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs sm:text-sm transition-colors cursor-pointer",
                    isSelected
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
                  {isSelected && <Check size={15} className="text-primary shrink-0 ml-2" />}
                </button>
              )
            })}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>Loading more...</span>
              </div>
            )}

            {!isLoading && filteredOptions.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {searchTerm ? "No matching results found" : "No data available"}
              </div>
            )}
          </div>

          {!isLoading && filteredOptions.length > 0 && totalItems > options.length && (
            <div className="px-3 py-1.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground text-center">
              Showing {options.length} of {totalItems} items
            </div>
          )}

          {requireConfirmation && tempSelectedOption && (
            <div className="flex justify-end gap-2 p-2.5 border-t border-border bg-muted/30">
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelSelection}
              >
                Cancel
              </CustomButton>
              <CustomButton
                type="button"
                size="sm"
                onClick={handleConfirmSelection}
              >
                Confirm
              </CustomButton>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SingleSelectInfiniteDropdown
