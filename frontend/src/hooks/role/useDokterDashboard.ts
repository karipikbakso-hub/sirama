'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/apiData'

// Types for Dokter Dashboard matching backend API responses
export interface DoctorStats {
  total_pasien: number
  menunggu: number
  selesai: number
  batal: number
}

export interface PatientQueue {
  id: string
  registration_no?: string
  status: 'menunggu' | 'sedang_diperiksa' | 'selesai' | 'batal'
  patient_data: {
    id: string
    name: string
    mrn?: string
    birth_date?: string
    gender?: string
  }
  visit_date: string
  complaint?: string
}

export interface TodaySchedule {
  id: number
  waktu: string
  lokasi: string
  kuota: number
  registered: number
  shift_type: string
  tanggal: string
}

export interface NotificationItem {
  id: string
  patient: string
  message: string
  type: 'lab_result_ready' | 'radiology_result_ready'
  created_at: string
  read: boolean
}

export interface DokterDashboardData {
  stats: DoctorStats
  currentQueue: PatientQueue[]
  todaySchedule: TodaySchedule[]
  notifications: NotificationItem[]
}

// Calculate age from birth date
export const calculateAge = (birthDate?: string): number => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Convert backend status to frontend display
export const getStatusDisplay = (status: string): { label: string, color: string } => {
  switch (status) {
    case 'menunggu':
      return { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' }
    case 'sedang_diperiksa':
      return { label: 'Sedang Diperiksa', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
    case 'selesai':
      return { label: 'Selesai', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
    case 'batal':
      return { label: 'Batal', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' }
  }
}

export function useDokterDashboard() {
  const [data, setData] = useState<DokterDashboardData>({
    stats: { total_pasien: 0, menunggu: 0, selesai: 0, batal: 0 },
    currentQueue: [],
    todaySchedule: [],
    notifications: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date().toISOString().split('T')[0]

      // Fetch all data in parallel for better performance
      const [statsRes, queueRes, scheduleRes, notificationsRes] = await Promise.allSettled([
        api.get('/api/dashboard/dokter'),
        api.get(`/api/registrations?doctor_id=1&date=${today}&status=menunggu&status=sedang_diperiksa`),
        api.get(`/api/jadwal-praktek?date=${today}`),
        api.get('/api/notifications/dokter?unread=true')
      ])

      // Process stats
      const stats: DoctorStats = statsRes.status === 'fulfilled' && statsRes.value.data?.success
        ? statsRes.value.data.data
        : { total_pasien: 0, menunggu: 0, selesai: 0, batal: 0 }

      // Process queue
      const currentQueue: PatientQueue[] = []
      if (queueRes.status === 'fulfilled' && queueRes.value.data?.success) {
        const queueData = queueRes.value.data.data?.data || queueRes.value.data.data || []
        currentQueue.push(...queueData.map((reg: any) => ({
          id: reg.id.toString(),
          registration_no: reg.registration_no,
          status: reg.status,
          patient_data: {
            id: reg.patient?.id?.toString() || reg.id.toString(),
            name: reg.patient?.full_name || 'Unknown Patient',
            mrn: reg.patient?.medical_record_number,
            birth_date: reg.patient?.date_of_birth,
            gender: reg.patient?.gender
          },
          visit_date: reg.created_at,
          complaint: reg.complaint
        })))
      }

      // Process schedule
      const todaySchedule: TodaySchedule[] = []
      if (scheduleRes.status === 'fulfilled' && scheduleRes.value.data?.success) {
        todaySchedule.push(...(scheduleRes.value.data.data || []))
      }

      // Process notifications
      const notifications: NotificationItem[] = []
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value.data?.success) {
        notifications.push(...(notificationsRes.value.data.data || []))
      }

      setData({
        stats,
        currentQueue,
        todaySchedule,
        notifications
      })

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch doctor dashboard data')
      console.error('Dashboard fetch error:', err)
    } finally {
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
