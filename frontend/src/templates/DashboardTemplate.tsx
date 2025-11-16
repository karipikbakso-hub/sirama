'use client'

import React, { useMemo } from 'react'
import { LucideIcon, RefreshCwIcon } from 'lucide-react'

// Our new components
import { StatCard } from '@/components/ui/stat-card'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface DashboardTemplateProps {
  // Basic info
  title: string
  description?: string

  // Stats cards
  stats: Array<{
    title: string
    value: string | number
    icon: LucideIcon
    change?: number
    trend?: 'up' | 'down' | 'neutral'
    description?: string
    loading?: boolean
  }>

  // Layout options
  statsColumns?: 2 | 3 | 4
  gridGap?: 'sm' | 'md' | 'lg'

  // Charts and widgets
  charts?: Array<{
    title: string
    component: React.ReactNode
    colSpan?: 1 | 2 | 3 | 4
  }>

  // Recent activity section
  recentActivity?: {
    title: string
    component: React.ReactNode
  }

  // Custom widgets
  customWidgets?: Array<{
    title: string
    component: React.ReactNode
    colSpan?: 1 | 2 | 3 | 4
  }>

  // Refresh functionality
  refreshInterval?: number // Auto-refresh in seconds
  onRefresh?: () => void
  isRefreshing?: boolean

  // Additional actions
  actions?: Array<{
    label: string
    icon: LucideIcon
    action: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }>
}

/**
 * Production-ready Dashboard Template
 * Uses StatCard, PageHeader and Card components from Task 3
 * Responsive grid layout with role-aware stats and widgets
 */
export function DashboardTemplate({
  title,
  description,
  stats,
  statsColumns = 4,
  gridGap = 'md',
  charts = [],
  recentActivity,
  customWidgets = [],
  refreshInterval,
  onRefresh,
  isRefreshing = false,
  actions = [],
}: DashboardTemplateProps) {

  // Grid gap classes
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  // Auto-refresh functionality
  React.useEffect(() => {
    if (refreshInterval && onRefresh) {
      const interval = setInterval(onRefresh, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, onRefresh])

  // Handle manual refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  // All sections to render
  const sections = useMemo(() => [
    // Stats section (always first if stats exist)
    ...(stats.length > 0 ? [{
      type: 'stats' as const,
      content: stats,
      columns: statsColumns,
      title: 'Statistics'
    }] : []),

    // Charts section
    ...(charts.length > 0 ? [{
      type: 'charts' as const,
      content: charts,
      title: 'Charts & Analytics'
    }] : []),

    // Recent activity section
    ...(recentActivity ? [{
      type: 'recentActivity' as const,
      content: recentActivity,
      title: recentActivity.title
    }] : []),

    // Custom widgets section
    ...(customWidgets.length > 0 ? [{
      type: 'customWidgets' as const,
      content: customWidgets,
      title: 'Widgets'
    }] : []),
  ], [stats, statsColumns, charts, recentActivity, customWidgets])

  // Header actions
  const headerActions = [
    // Refresh button
    ...(onRefresh ? [{
      label: 'Refresh',
      icon: RefreshCwIcon,
      action: handleRefresh,
      variant: 'outline' as const,
    }] : []),

    // Custom actions
    ...actions,
  ]

  // Render stats section
  const renderStatsSection = (statsData: DashboardTemplateProps['stats']) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${statsColumns} ${gapClasses[gridGap]}`}>
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          trend={stat.trend}
          description={stat.description}
        />
      ))}
    </div>
  )

  // Render charts/widgets section
  const renderChartsSection = (chartsData: DashboardTemplateProps['charts']) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gapClasses[gridGap]}`}>
      {(chartsData || []).map((chart, index) => (
        <div
          key={index}
          className={`col-span-1 ${chart.colSpan ? `md:col-span-${chart.colSpan}` : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chart.component}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )

  // Render widgets section
  const renderWidgetsSection = (widgetsData: DashboardTemplateProps['customWidgets']) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${gapClasses[gridGap]}`}>
      {(widgetsData || []).map((widget, index) => (
        <div
          key={index}
          className={`col-span-1 ${widget.colSpan ? `md:col-span-${widget.colSpan}` : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {widget.component}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )

  // Render recent activity section
  const renderRecentActivitySection = (activity: NonNullable<DashboardTemplateProps['recentActivity']>) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {activity.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.component}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        actions={headerActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={action.action}
            disabled={isRefreshing && action.label === 'Refresh'}
          >
            <action.icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        ))}
      />

      {/* Dashboard Sections */}
      {sections.map((section, index) => (
        <section key={index} className="space-y-4">
          {/* Optional section title */}
          {section.title && sections.length > 1 && (
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>
          )}

          {/* Section content */}
          {section.type === 'stats' && renderStatsSection(section.content)}
          {section.type === 'charts' && renderChartsSection(section.content)}
          {section.type === 'recentActivity' && renderRecentActivitySection(section.content)}
          {section.type === 'customWidgets' && renderWidgetsSection(section.content)}
        </section>
      ))}

      {/* Empty state */}
      {sections.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-muted-foreground mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <div className="w-8 h-8 rounded bg-current opacity-20" />
            </div>
            <p className="text-lg">No dashboard content configured</p>
            <p className="text-sm">Add stats, charts, or widgets to populate this dashboard</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to create common dashboard stats
export function createDashboardStats(stats: Array<{
  title: string
  value: number | string
  previousValue?: number
  icon: LucideIcon
  formatOptions?: {
    prefix?: string
    suffix?: string
    decimals?: number
  }
}>) {
  return stats.map(stat => {
    const change = stat.previousValue
      ? ((Number(stat.value) - stat.previousValue) / stat.previousValue) * 100
      : undefined

    return {
      title: stat.title,
      value: typeof stat.value === 'number' && stat.formatOptions
        ? formatNumber(stat.value, stat.formatOptions)
        : String(stat.value),
      icon: stat.icon,
      change,
      trend: change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined,
    }
  })
}

// Helper function to format numbers
function formatNumber(
  value: number,
  options: { prefix?: string; suffix?: string; decimals?: number } = {}
): string {
  const { prefix = '', suffix = '', decimals = 0 } = options

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return `${prefix}${formatted}${suffix}`
}
