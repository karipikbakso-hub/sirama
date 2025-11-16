'use client'

import { ReactNode } from 'react'

interface DashboardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DashboardGrid({
  children,
  columns = 4,
  gap = 'md',
  className = ''
}: DashboardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  const gapSizes = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  }

  return (
    <div className={`grid ${gridCols[columns]} ${gapSizes[gap]} ${className}`}>
      {children}
    </div>
  )
}