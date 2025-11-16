'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/apiData'

// Types for Pendaftaran Dashboard
export interface PatientStats {
  totalPatients: number
  todayRegistrations: number
  pendingAppointments: number
  emergencyCases: number
}

export interface QueueStats {
  totalQueue: number
  servedToday: number
  averageWaitTime: number
  longestWaitTime: number
}

export interface DashboardStats {
  patients: PatientStats
  queues: QueueStats
  recentActivities: Activity[]
  alerts: Alert[]
}

export interface Activity {
  id: number
  type: 'registration' | 'appointment' | 'emergency' | 'queue'
  message: string
  timestamp: string
  user: string
}

export interface Alert {
  id: number
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: string
}

// Mock data for development
const mockStats: DashboardStats = {
  patients: {
    totalPatients: 15420,
    todayRegistrations: 45,
    pendingAppointments: 23,
    emergencyCases: 3
  },
  queues: {
    totalQueue: 28,
    servedToday: 67,
    averageWaitTime: 24, // minutes
    longestWaitTime: 85 // minutes
  },
  recentActivities: [
    {
      id: 1,
      type: 'registration',
      message: 'Pasien baru terdaftar: Ahmad Surya',
      timestamp: '2025-11-15T10:30:00Z',
      user: 'Staff Pendaftaran'
    },
    {
      id: 2,
      type: 'appointment',
      message: 'Janji temu dikonfirmasi untuk Maya Sari',
      timestamp: '2025-11-15T10:15:00Z',
      user: 'Staff Pendaftaran'
    },
    {
      id: 3,
      type: 'emergency',
      message: 'Kasus emergency masuk: Rudi Hartono',
      timestamp: '2025-11-15T09:45:00Z',
      user: 'IGD Staff'
    },
    {
      id: 4,
      type: 'queue',
      message: 'Antrian nomor 15 dipanggil ke poli jantung',
      timestamp: '2025-11-15T09:30:00Z',
      user: 'System'
    }
  ],
  alerts: [
    {
      id: 1,
      type: 'warning',
      message: 'Antrian poli mata melebihi batas normal (15 menit)',
      timestamp: '2025-11-15T10:00:00Z'
    },
    {
      id: 2,
      type: 'info',
      message: 'Backup data harian berhasil dilakukan',
      timestamp: '2025-11-15T06:00:00Z'
    }
  ]
}

export function usePendaftaranDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
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
      const response = await api.get('/api/dashboard/pendaftaran')
      setStats(response.data)
      */

      // Mock data for development - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setStats(mockStats)
      setLoading(false)

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data')
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  return {
    stats,
    loading,
    error,
    refreshData
  }
}

// Additional hooks for specific functionalities
export function usePatientSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      // Mock search results
      const mockResults = [
        { id: 1, name: 'Ahmad Surya', nik: '3171234567890001', phone: '+6281234567890' },
        { id: 2, name: 'Maya Sari', nik: '3171234567890002', phone: '+6281234567891' },
        { id: 3, name: 'Rudi Hartono', nik: '3171234567890003', phone: '+6281234567892' }
      ].filter(patient =>
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.nik.includes(query)
      )

      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300))
      setSearchResults(mockResults)
      setSearching(false)

    } catch (error) {
      setSearching(false)
    }
  }

  return {
    searchResults,
    searching,
    searchPatients
  }
}

export function useQueueManagement() {
  const [currentQueue, setCurrentQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const callNextPatient = async (queueId: number) => {
    try {
      setLoading(true)
      // Mock API call - simulate delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setLoading(false)
      // Update queue status
    } catch (error) {
      setLoading(false)
    }
  }

  const skipPatient = async (queueId: number) => {
    try {
      setLoading(true)
      // Mock API call - simulate delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setLoading(false)
      // Skip patient
    } catch (error) {
      setLoading(false)
    }
  }

  return {
    currentQueue,
    loading,
    callNextPatient,
    skipPatient
  }
}