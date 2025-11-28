// UPDATED TO USE REAL API DATA
'use client'

import React from 'react'
import {
  Users,
  Activity,
  Database,
  Server,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { DashboardTemplate } from '@/templates/DashboardTemplate'
import { useAdminDashboard } from '@/hooks/role/useAdminDashboard'

export function Dashboard() {
  const { data, loading, error, refreshData } = useAdminDashboard()

  // Transform API data to stats format
  const stats = data ? [
    {
      title: 'Total Pengguna',
      value: data.data.totalUsers.value.toString(),
      icon: Users,
      change: data.data.totalUsers.trend,
      trend: data.data.totalUsers.isPositive ? ('up' as const) : ('down' as const),
      description: 'pengguna aktif'
    },
    {
      title: 'Active Users Today',
      value: data.data.activeUsersToday.value.toString(),
      icon: Activity,
      change: data.data.activeUsersToday.trend,
      trend: data.data.activeUsersToday.isPositive ? ('up' as const) : ('down' as const),
      description: 'pengguna aktif hari ini'
    },
    {
      title: 'Audit Logs Today',
      value: data.data.auditLogsToday.value.toString(),
      icon: Database,
      change: data.data.auditLogsToday.trend,
      trend: data.data.auditLogsToday.isPositive ? ('up' as const) : ('down' as const),
      description: 'aktivitas tercatat hari ini'
    },
    {
      title: 'API Calls Today',
      value: data.data.apiCallsToday.value.toString(),
      icon: Server,
      change: data.data.apiCallsToday.trend,
      trend: data.data.apiCallsToday.isPositive ? ('up' as const) : ('down' as const),
      description: 'panggilan API hari ini'
    }
  ] : []

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error loading dashboard data</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <DashboardTemplate
      title="Admin Dashboard Overview"
      description="System monitoring and analytics dashboard"
      showHeader={false}
      stats={stats}
      statsColumns={4}
      refreshInterval={300}
      onRefresh={refreshData}
    />
  )
}

export default Dashboard
