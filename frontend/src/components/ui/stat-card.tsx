'use client'

import React from 'react'
import { LucideIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: number // Percentage change (e.g., +5.2 or -2.1)
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  className?: string
}

/**
 * StatCard component for displaying key metrics and KPIs
 * - Responsive: Stack on mobile, grid on desktop
 * - Trend indicators with color coding
 * - Uses CSS variables for theming
 * - Fully accessible with ARIA labels
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend = 'neutral',
  description,
  className,
}: StatCardProps) {
  // Determine trend color and icon based on trend prop or change value
  const getTrendConfig = () => {
    if (change !== undefined) {
      if (change > 0) return { color: 'text-green-600', icon: TrendingUpIcon, label: 'increase' }
      if (change < 0) return { color: 'text-red-600', icon: TrendingDownIcon, label: 'decrease' }
      return { color: 'text-gray-600', icon: MinusIcon, label: 'no change' }
    }

    switch (trend) {
      case 'up':
        return { color: 'text-green-600', icon: TrendingUpIcon, label: 'increasing' }
      case 'down':
        return { color: 'text-red-600', icon: TrendingDownIcon, label: 'decreasing' }
      default:
        return { color: 'text-gray-600', icon: MinusIcon, label: 'stable' }
    }
  }

  const trendConfig = getTrendConfig()
  const TrendIcon = trendConfig.icon

  return (
    <Card className={cn("transition-colors hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-1">
          {/* Main value */}
          <div className="text-2xl font-bold tracking-tight" aria-label={`${title}: ${value}`}>
            {value}
          </div>

          {/* Change/trend indicator */}
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <TrendIcon
                className={cn("h-3 w-3", trendConfig.color)}
                aria-hidden="true"
              />
              <span
                className={cn("text-xs font-medium", trendConfig.color)}
                aria-label={`Trend: ${trendConfig.label} by ${Math.abs(change)}%`}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-muted-foreground">
                from last period
              </span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground mt-1" aria-label={`Description: ${description}`}>
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
