'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/apiData'

// Types for Admin Dashboard
export interface SystemStats {
  totalUsers: number
  activeUsers: number
  systemHealth: number
  totalAuditLogs: number
  recentErrors: number
  serverUptime: string
}

export interface UserActivity {
  id: number
  user: string
  action: string
  timestamp: string
  ipAddress: string
  userAgent: string
}

export interface SystemAlert {
  id: number
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  resolved: boolean
}

export interface AdminDashboardData {
  stats: SystemStats
  recentActivities: UserActivity[]
  alerts: SystemAlert[]
  performance: {
    responseTime: number
    throughput: number
    errorRate: number
  }
}

// Mock data for development
const mockAdminData: AdminDashboardData = {
  stats: {
    totalUsers: 2847,
    activeUsers: 1429,
    systemHealth: 98.5,
    totalAuditLogs: 15632,
    recentErrors: 3,
    serverUptime: '15 days, 8 hours'
  },
  recentActivities: [
    {
      id: 1,
      user: 'Admin User',
      action: 'Created new role: Super Admin',
      timestamp: '2025-11-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/119.0.0.0'
    },
    {
      id: 2,
      user: 'System',
      action: 'Automated backup completed',
      timestamp: '2025-11-15T06:00:00Z',
      ipAddress: '127.0.0.1',
      userAgent: 'System Service'
    },
    {
      id: 3,
      user: 'Dr. Smith',
      action: 'Updated patient record #12345',
      timestamp: '2025-11-15T09:45:00Z',
      ipAddress: '192.168.1.150',
      userAgent: 'Firefox/119.0.0.0'
    }
  ],
  alerts: [
    {
      id: 1,
      type: 'warning',
      message: 'Disk usage above 80% on server-01',
      timestamp: '2025-11-15T08:30:00Z',
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'System maintenance scheduled for tonight',
      timestamp: '2025-11-14T16:00:00Z',
      resolved: false
    }
  ],
  performance: {
    responseTime: 245, // ms
    throughput: 1250, // requests/min
    errorRate: 0.02 // 0.02%
  }
}

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In development, use mock data
      // In production, uncomment the API call below
      /*
      const response = await api.get('/api/dashboard/admin')
      setData(response.data)
      */

      // Mock data for development - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setData(mockAdminData)
      setLoading(false)

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard data')
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  const resolveAlert = async (alertId: number) => {
    try {
      // Mock API call
      setData(prev => prev ? {
        ...prev,
        alerts: prev.alerts.map(alert =>
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      } : null)
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  return {
    data,
    loading,
    error,
    refreshData,
    resolveAlert
  }
}

// Additional admin-specific hooks
export function useUserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = async (filters?: any) => {
    try {
      setLoading(true)
      // Mock API call
      const mockUsers = [
        { id: 1, name: 'Admin User', email: 'admin@sirama.com', role: 'admin', status: 'active' },
        { id: 2, name: 'Dr. Smith', email: 'smith@sirama.com', role: 'dokter', status: 'active' },
        { id: 3, name: 'Nurse Johnson', email: 'johnson@sirama.com', role: 'perawat', status: 'active' }
      ]
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setUsers(mockUsers)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      setLoading(true)
      // Mock API call
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status } : user
      ))
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    updateUserStatus
  }
}

export function useSystemMonitoring() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      // Mock system metrics
      const mockMetrics = {
        cpu: 45,
        memory: 67,
        disk: 78,
        network: 23,
        uptime: '15d 8h 30m',
        lastBackup: '2025-11-15T06:00:00Z'
      }
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setMetrics(mockMetrics)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  return {
    metrics,
    loading,
    fetchMetrics
  }
}