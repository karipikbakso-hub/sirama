'use client'

import React, { useState, useMemo } from 'react'
import { LucideIcon, PlusIcon, EditIcon, Trash2Icon, DownloadIcon } from 'lucide-react'
import { toast } from '@/lib/toast'

// Our new components
import { DataTable, Column } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { ModalForm } from '@/components/ui/modal-form'
import { Button } from '@/components/ui/button'

// Our new hooks
import { useFetch, useDelete } from '@/hooks/useApi'

// API types
import type { SuccessResponse } from '@/lib/apiTypes'

export interface CrudPageTemplateProps<T extends { id: string }> {
  // Basic info
  title: string
  description?: string

  // API
  endpoint: string
  params?: Record<string, any>

  // Data table
  columns: Column<T>[]
  searchPlaceholder?: string
  searchable?: boolean

  // Forms
  CreateForm: React.ComponentType<{
    onSuccess: () => void
    onCancel?: () => void
  }>
  EditForm: React.ComponentType<{
    data: T
    onSuccess: () => void
    onCancel?: () => void
  }>

  // Features
  deletable?: boolean

  // Actions
  customActions?: Array<{
    label: string
    icon: LucideIcon
    disabled?: (item: T) => boolean
    action: (item: T, refreshData: () => void) => void
    variant?: 'default' | 'outline' | 'ghost'
  }>

  // Verification dialogs
  deleteConfirmMessage?: (item: T) => string
}

/**
 * Production-ready CRUD Page Template
 * Uses all our new components and patterns from Tasks 1-3
 * Type-safe generic implementation for any data model
 */
export function CrudPageTemplate<T extends { id: string }>({
  title,
  description,
  endpoint,
  params,
  columns,
  searchPlaceholder = "Search...",
  searchable = true,
  CreateForm,
  EditForm,
  deletable = true,
  customActions = [],
  deleteConfirmMessage = (item) => `Are you sure you want to delete ${title.toLowerCase()}? This action cannot be undone.`,
}: CrudPageTemplateProps<T>) {
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)

  // Data fetching
  const { data: response, isLoading, error, refetch } = useFetch<SuccessResponse<T[]>>(
    endpoint,
    { params, enabled: true }
  )

  // Delete mutation
  const deleteMutation = useDelete(endpoint)

  // Process data
  const data = response?.data || []

  // Enhanced columns with actions
  const enhancedColumns = useMemo((): Column<T>[] => {
    const baseColumns = [...columns]

    // Add actions column if needed
    if (deletable || customActions.length > 0) {
      baseColumns.push({
        key: 'actions',
        label: 'Actions',
        render: (value, row) => (
          <div className="flex gap-2 items-center justify-end">
            {/* Custom actions */}
            {customActions.map((action, index) => {
              const isDisabled = action.disabled?.(row)
              return (
                <Button
                  key={index}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    action.action(row, refetch)
                  }}
                  disabled={isDisabled}
                  className="h-8 w-8 p-0"
                >
                  <action.icon className="h-4 w-4" />
                </Button>
              )
            })}

            {/* Edit action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                openEditModal(row)
              }}
              className="h-8 w-8 p-0"
            >
              <EditIcon className="h-4 w-4" />
            </Button>

            {/* Delete action */}
            {deletable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(row)
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
        className: 'w-24',
      })
    }

    return baseColumns
  }, [columns, deletable, customActions])

  // Event handlers
  const openCreateModal = () => setCreateModalOpen(true)
  const openEditModal = (item: T) => {
    setEditingItem(item)
    setEditModalOpen(true)
  }
  const closeCreateModal = () => setCreateModalOpen(false)
  const closeEditModal = () => setEditModalOpen(false)

  const handleCreateSuccess = () => {
    closeCreateModal()
    refetch()
    toast.success(`${title} created successfully`)
  }

  const handleEditSuccess = () => {
    closeEditModal()
    setEditingItem(null)
    refetch()
    toast.success(`${title} updated successfully`)
  }

  const handleDelete = async (item: T) => {
    if (!confirm(deleteConfirmMessage(item))) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success(`${title} deleted successfully`)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const exportToExcel = () => {
    const headers = columns.map(col => col.label).join(',')
    const rows = data.map(item =>
      columns.map(col => `"${String(item[col.key as keyof T] || '')}"`).join(',')
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_data.csv`
    link.click()
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title={title} description={description} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-destructive mb-4">Error loading data</div>
            <Button onClick={() => refetch()} variant="outline">Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={[
          <Button key="export" variant="outline" onClick={exportToExcel} disabled={data.length === 0}>
            <DownloadIcon className="h-4 w-4 mr-2" />Export
          </Button>,
          <Button key="create" onClick={openCreateModal}>
            <PlusIcon className="h-4 w-4 mr-2" />Add {title}
          </Button>
        ]}
      />

      <DataTable
        data={data}
        columns={enhancedColumns}
        isLoading={isLoading}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        emptyStateMessage={`No ${title.toLowerCase()} found`}
      />

      <ModalForm
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title={`Create ${title}`}
        size="lg"
        onSubmit={handleCreateSuccess}
      >
        <CreateForm onSuccess={handleCreateSuccess} onCancel={closeCreateModal} />
      </ModalForm>

      {editingItem && (
        <ModalForm
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          title={`Edit ${title}`}
          size="lg"
          onSubmit={handleEditSuccess}
        >
          <EditForm data={editingItem} onSuccess={handleEditSuccess} onCancel={closeEditModal} />
        </ModalForm>
      )}
    </div>
  )
}
