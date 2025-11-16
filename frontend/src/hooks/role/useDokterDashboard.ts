'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/apiData'

// Types for Dokter Dashboard
export interface DoctorStats {
  todayPatients: number
  pendingLabOrders: number
  pendingRadiologyOrders: number
  completedConsultations: number
  upcomingAppointments: number
}

export interface PatientQueue {
  id: number
  patientName: string
  queueNumber: number
  estimatedTime: string
  status: 'waiting' | 'in_consultation' | 'completed'
}

export interface TodaySchedule {
  id: number
  time: string
  patientName: string
  type: 'consultation' | 'follow_up' | 'emergency'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export interface DokterDashboardData {
  stats: DoctorStats
  currentQueue: PatientQueue[]
  todaySchedule: TodaySchedule[]
  recentActivities: any[]
}

// Mock data
const mockDokterData: DokterDashboardData = {
  stats: {
    todayPatients: 24,
    pendingLabOrders: 5,
    pendingRadiologyOrders: 3,
    completedConsultations: 18,
    upcomingAppointments: 6
  },
  currentQueue: [
    { id: 1, patientName: 'Ahmad Surya', queueNumber: 15, estimatedTime: '10:30', status: 'waiting' },
    { id: 2, patientName: 'Maya Sari', queueNumber: 16, estimatedTime: '11:00', status: 'in_consultation' },
    { id: 3, patientName: 'Rudi Hartono', queueNumber: 17, estimatedTime: '11:30', status: 'waiting' }
  ],
  todaySchedule: [
    { id: 1, time: '09:00', patientName: 'Ahmad Surya', type: 'consultation', status: 'completed' },
    { id: 2, time: '09:30', patientName: 'Maya Sari', type: 'follow_up', status: 'in_progress' },
    { id: 3, time: '10:00', patientName: 'Rudi Hartono', type: 'consultation', status: 'scheduled' }
  ],
  recentActivities: []
}

export function useDokterDashboard() {
  const [data, setData] = useState<DokterDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Mock data for development
      setTimeout(() => {
        setData(mockDokterData)
        setLoading(false)
      }, 1000)

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch doctor dashboard data')
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refreshData: fetchDashboardData
  }
}