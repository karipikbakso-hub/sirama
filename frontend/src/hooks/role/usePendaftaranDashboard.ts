'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { SuccessResponse } from '@/lib/apiTypes'

// Types for Pendaftaran Dashboard
export interface StatsData {
  totalKunjunganHariIni: {
    value: number
    breakdown: {
      rawatJalan: number
      igd: number
      kontrol: number
    }
  }
  pasienDalamAntrian: {
    value: number
    trend: number
  }
  pasienBaruHariIni: {
    value: number
    vsKemarin: number
    trend: number
  }
  rataRataWaktuLayanan: {
    value: number
    target: number
    status: 'good' | 'warning' | 'critical'
  }
}

export interface ChartData {
  labels: string[]
  data: Array<{
    date: string
    day: string
    rawatJalan: number
    igd: number
    kontrol: number
    total: number
  }>
}

export interface QueueRealtimeData {
  status: {
    waiting: number
    called: number
    completed: number
    cancelled: number
  }
  avgWaitTime?: number
  recentQueues: Array<{
    id: number
    queueNumber: number
    patientName: string
    doctorName: string
    status: string
    estimatedTime: number
    createdAt: string
  }>
  lastUpdated: string
}

export interface PatientTodayDataItem {
  id: number
  registrationNumber: string
  patientName: string
  patientNik: string
  serviceType: string
  doctorName: string
  status: string
  queueNumber: string
  registeredAt: string
}

export type PatientTodayData = PatientTodayDataItem[]

export interface DashboardStats {
  stats: StatsData
  chart: ChartData
  queueRealtime: QueueRealtimeData
  patientsToday: PatientTodayData
}

export function usePendaftaranDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [chart, setChart] = useState<ChartData | null>(null)
  const [queueRealtime, setQueueRealtime] = useState<QueueRealtimeData | null>(null)
  const [patientsToday, setPatientsToday] = useState<PatientTodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all dashboard data in parallel with proper error handling
      const statsPromise = api.get<SuccessResponse<StatsData>>('/api/pendaftaran/dashboard/stats')
        .then(res => res.data)
        .catch(err => {
          console.error('Failed to fetch stats data:', err)
          return null
        })

      const chartPromise = api.get<SuccessResponse<ChartData>>('/api/pendaftaran/dashboard/kunjungan-chart')
        .then(res => res.data)
        .catch(err => {
          console.error('Failed to fetch chart data:', err)
          return null
        })

      const queuePromise = api.get<SuccessResponse<QueueRealtimeData>>('/api/pendaftaran/dashboard/antrian-realtime')
        .then(res => res.data)
        .catch(err => {
          console.error('Failed to fetch queue data:', err)
          return null
        })

      const patientsPromise = api.get<SuccessResponse<PatientTodayData>>('/api/pendaftaran/dashboard/pasien-hari-ini')
        .then(res => res.data)
        .catch(err => {
          console.error('Failed to fetch patients data:', err)
          return null
        })

      const [statsRes, chartRes, queueRes, patientsRes] = await Promise.all([
        statsPromise,
        chartPromise,
        queuePromise,
        patientsPromise
      ])

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data)
      }

      if (chartRes?.success && chartRes.data) {
        setChart(chartRes.data)
      } else {
        // Fallback to mock chart data
        console.warn('Using fallback chart data')
        setChart({
          labels: ['07 Des', '08 Des', '09 Des', '10 Des', '11 Des', '12 Des', '13 Des'],
          data: [
            { date: '2025-12-07', day: '07 Des', rawatJalan: 25, igd: 3, kontrol: 8, total: 36 },
            { date: '2025-12-08', day: '08 Des', rawatJalan: 22, igd: 5, kontrol: 6, total: 33 },
            { date: '2025-12-09', day: '09 Des', rawatJalan: 28, igd: 2, kontrol: 10, total: 40 },
            { date: '2025-12-10', day: '10 Des', rawatJalan: 30, igd: 4, kontrol: 12, total: 46 },
            { date: '2025-12-11', day: '11 Des', rawatJalan: 15, igd: 8, kontrol: 7, total: 30 },
            { date: '2025-12-12', day: '12 Des', rawatJalan: 20, igd: 3, kontrol: 9, total: 32 },
            { date: '2025-12-13', day: '13 Des', rawatJalan: 18, igd: 2, kontrol: 8, total: 28 }
          ]
        })
      }

      if (queueRes?.success && queueRes.data) {
        setQueueRealtime(queueRes.data)
      } else {
        // Fallback to mock queue data
        console.warn('Using fallback queue data')
        setQueueRealtime({
          status: {
            waiting: 12,
            called: 3,
            completed: 58,
            cancelled: 2
          },
          recentQueues: [
            {
              id: 1,
              queueNumber: 12,
              patientName: 'Ahmad Surya',
              doctorName: 'Dr. Sarah Utami',
              status: 'waiting',
              estimatedTime: 15,
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              queueNumber: 13,
              patientName: 'Maya Sari',
              doctorName: 'Dr. Budi Prabowo',
              status: 'called',
              estimatedTime: 5,
              createdAt: new Date().toISOString()
            }
          ],
          lastUpdated: new Date().toISOString()
        })
      }

      if (patientsRes?.success && patientsRes.data) {
        setPatientsToday(patientsRes.data)
      } else {
        // No fallback patients data - will show empty state
        setPatientsToday([])
      }

      setLoading(false)

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.response?.data?.message || 'Gagal memuat data dashboard')
      setLoading(false)

      // Set fallback data on error
      setChart({
        labels: ['07 Des', '08 Des', '09 Des', '10 Des', '11 Des', '12 Des', '13 Des'],
        data: [
          { date: '2025-12-07', day: '07 Des', rawatJalan: 25, igd: 3, kontrol: 8, total: 36 },
          { date: '2025-12-08', day: '08 Des', rawatJalan: 22, igd: 5, kontrol: 6, total: 33 },
          { date: '2025-12-09', day: '09 Des', rawatJalan: 28, igd: 2, kontrol: 10, total: 40 },
          { date: '2025-12-10', day: '10 Des', rawatJalan: 30, igd: 4, kontrol: 12, total: 46 },
          { date: '2025-12-11', day: '11 Des', rawatJalan: 15, igd: 8, kontrol: 7, total: 30 },
          { date: '2025-12-12', day: '12 Des', rawatJalan: 20, igd: 3, kontrol: 9, total: 32 },
          { date: '2025-12-13', day: '13 Des', rawatJalan: 18, igd: 2, kontrol: 8, total: 28 }
        ]
      })

      setQueueRealtime({
        status: {
          waiting: 12,
          called: 3,
          completed: 58,
          cancelled: 2
        },
        recentQueues: [
          {
            id: 1,
            queueNumber: 12,
            patientName: 'Ahmad Surya',
            doctorName: 'Dr. Sarah Utami',
            status: 'waiting',
            estimatedTime: 15,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            queueNumber: 13,
            patientName: 'Maya Sari',
            doctorName: 'Dr. Budi Prabowo',
            status: 'called',
            estimatedTime: 5,
            createdAt: new Date().toISOString()
          }
        ],
        lastUpdated: new Date().toISOString()
      })

      setPatientsToday([])
    }
  }

  const refreshData = () => {
    fetchDashboardData()
  }

  return {
    stats,
    chart,
    queueRealtime,
    patientsToday,
    loading,
    error,
    refreshData
  }
}
