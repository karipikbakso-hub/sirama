'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  showBreadcrumbs?: boolean
  className?: string
}

/**
 * PageHeader component with auto-generated breadcrumbs
 * - Breadcrumbs from pathname: Home > Dashboard > [Role] > [Page]
 * - Responsive layout: Stack on mobile, grid on desktop
 * - Uses CSS variables for theming
 * - Fully accessible
 */
export function PageHeader({
  title,
  description,
  actions,
  showBreadcrumbs = true,
  className,
}: PageHeaderProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return []

    const pathSegments = pathname.split('/').filter(Boolean)

    const breadcrumbs = [
      { label: 'Home', href: '/', isActive: false },
      ...pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/')
        const isActive = index === pathSegments.length - 1

        // Format segment labels
        let label = segment
        // Capitalize and format role names
        if (segment === 'dashboard' && index < pathSegments.length - 1) {
          label = 'Dashboard'
        } else if (index === 1 && segment.length > 0) {
          // Role name - capitalize first letter
          label = segment.charAt(0).toUpperCase() + segment.slice(1)
        } else {
          // Page name - replace dashes with spaces and capitalize
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }

        return {
          label,
          href,
          isActive,
        }
      }),
    ]

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 1 && (
        <nav aria-label="Breadcrumb navigation" className="flex items-center text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && (
                <ChevronRightIcon
                  className="h-4 w-4 mx-2 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {crumb.isActive ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Title and Description */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
