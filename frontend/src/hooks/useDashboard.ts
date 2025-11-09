'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface DashboardData {
  active_sessions: number
  pending_backups: number
  audit_logs_today: number
  users_per_role: Array<{
    role_name: string
    user_count: number
  }>
  role_distribution: {
    active: number
    inactive: number
  }
}

export const useDashboard = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/admin/dashboard', {
        withCredentials: true
      })
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}