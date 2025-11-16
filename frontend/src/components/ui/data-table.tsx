'use client'

import React, { useState, useMemo } from 'react'
import { ChevronUpIcon, ChevronDownIcon, SearchIcon, InboxIcon } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  mobile?: boolean // Show on mobile card view
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: boolean
  itemsPerPage?: number
  actions?: (row: T) => React.ReactNode
  mobileCardRender?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  emptyStateMessage?: string
  className?: string
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Production-ready DataTable component with mobile and desktop responsive views
 * - Mobile: Card view with key fields
 * - Desktop: Full table with sorting, search, pagination
 * - Uses CSS variables for theming
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  pagination = true,
  itemsPerPage = 10,
  actions,
  mobileCardRender,
  onRowClick,
  emptyStateMessage = "No data found",
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(itemsPerPage)

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((row) =>
      columns.some((column) => {
        const value = getNestedValue(row, column.key as string)
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    )
  }, [data, searchTerm, columns])

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortColumn)
      const bValue = getNestedValue(b, sortColumn)

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle column sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortColumn, sortDirection])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: pageSize }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )

  // Mobile card view component
  const MobileCardView = ({ item }: { item: T }) => {
    const mobileColumns = columns.filter(col => col.mobile !== false)

    return (
      <Card
        className={cn(
          "mb-4 cursor-pointer transition-colors hover:bg-muted/50",
          onRowClick && "cursor-pointer"
        )}
        onClick={() => onRowClick?.(item)}
      >
        <CardContent className="p-4">
          {mobileCardRender ? (
            mobileCardRender(item)
          ) : (
            <div className="space-y-3">
              {mobileColumns.map((column) => {
                const value = getNestedValue(item, column.key as string)
                const displayValue = column.render ? column.render(value, item) : value

                return (
                  <div key={String(column.key)} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {column.label}:
                    </span>
                    <span className="text-sm font-medium">
                      {displayValue || '-'}
                    </span>
                  </div>
                )
              })}
              {actions && (
                <div className="flex gap-2 pt-2 border-t">
                  {actions(item)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Desktop table view component
  const DesktopTableView = () => (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  column.sortable && "cursor-pointer hover:bg-muted/50 select-none",
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.key as string)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortColumn === column.key && (
                    <>
                      {sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </>
                  )}
                </div>
              </TableHead>
            ))}
            {actions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <InboxIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{emptyStateMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = getNestedValue(row, column.key as string)
                  const displayValue = column.render ? column.render(value, row) : value

                  return (
                    <TableCell key={String(column.key)} className={column.className}>
                      {displayValue || '-'}
                    </TableCell>
                  )
                })}
                {actions && (
                  <TableCell>
                    <div className="flex gap-2">
                      {actions(row)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm"
        />
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Mobile View */}
          <div className="block md:hidden">
            {paginatedData.map((item, index) => (
              <MobileCardView key={index} item={item} />
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <DesktopTableView />
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ml-2 text-sm border rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
