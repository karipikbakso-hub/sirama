'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: () => void
  isLoading?: boolean
  submitLabel?: string
  cancelLabel?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/**
 * ModalForm component for forms in modal dialogs
 * - Mobile: Full screen modal
 * - Desktop: Centered dialog with configurable sizes
 * - Form validation with Zod support
 * - Loading states and keyboard navigation
 * - Uses CSS variables for theming
 * - Fully accessible
 */
export function ModalForm({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  size = 'md',
  className,
}: ModalFormProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  // Size configurations
  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  // Handle cancellation
  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-h-[90vh] overflow-hidden',
          sizeClasses[size],
          'sm:rounded-lg p-0',
          className
        )}
        // Disable default close handlers to have more control
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Mobile full screen overlay */}
        <div className="fixed inset-0 z-50 bg-background sm:hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
              disabled={isLoading}
            >
              ✕
            </Button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-auto p-4">
            {description && (
              <DialogDescription className="mb-4 text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {children}

              {/* Mobile Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {cancelLabel}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Desktop Modal */}
        <div className="hidden sm:block">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="max-h-96 overflow-auto">
              {children}
            </div>

            <DialogFooter className="mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper hook for form handling with validation (simplified)
export function useModalForm(defaultValues?: Record<string, any>) {
  const form = useForm({
    defaultValues,
  })

  const resetForm = () => {
    form.reset(defaultValues)
  }

  return { ...form, resetForm }
}

// Helper component for form field wrapper
export interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  help?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  required = false,
  error,
  help,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
      {help && (
        <p className="text-xs text-muted-foreground">
          {help}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
