'use client'

import { useState, useEffect } from 'react'
import { useFetch } from '@/hooks/useApi'

export interface PharmacyStats {
  order_masuk: number
  validasi_pending: number
  stok_menipis: number
  expired_soon: number
}

export interface PrescriptionQueue {
  id: number
  prescriptionNumber: string
  patientName: string
  doctorName: string
  status: 'pending' | 'validated' | 'dispensing' | 'completed'
  priority: 'normal' | 'urgent' | 'emergency'
  createdAt: string
}

export interface LowStockMedicine {
  id: number
  name: string
  stock: number
  unit: string
  expired_date: string
}

export interface ExpiringSoonMedicine {
  id: number
  name: string
  stock: number
  unit: string
  expired_date: string
}

export function useApotekerDashboard() {
  const [stats, setStats] = useState<PharmacyStats | null>(null)
  const [prescriptionQueue, setPrescriptionQueue] = useState<PrescriptionQueue[]>([])
  const [lowStockMedicines, setLowStockMedicines] = useState<LowStockMedicine[]>([])
  const [expiringSoonMedicines, setExpiringSoonMedicines] = useState<ExpiringSoonMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useFetch('/api/dashboard/apoteker')
  const { data: recentOrdersData, isLoading: prescriptionsLoading } = useFetch('/api/prescriptions/recent')
  const { data: alertsData, isLoading: alertsLoading } = useFetch('/api/medicines/alerts')

  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData as PharmacyStats)
    }
  }, [dashboardData])

  useEffect(() => {
    if (recentOrdersData) {
      // Transform prescription data to match interface
      const prescriptionsArray = Array.isArray(recentOrdersData) ? recentOrdersData : []
      const transformedQueue: PrescriptionQueue[] = prescriptionsArray.map((prescription: any) => ({
        id: prescription.id,
        prescriptionNumber: `RX-${prescription.id.toString().padStart(6, '0')}`,
        patientName: prescription.patient_name || 'Unknown Patient',
        doctorName: prescription.doctor_name || 'Unknown Doctor',
        status: prescription.status,
        priority: 'normal', // Default priority
        createdAt: prescription.created_at
      }))
      setPrescriptionQueue(transformedQueue)
    }
  }, [recentOrdersData])

  useEffect(() => {
    if (alertsData) {
      const data = alertsData as any
      const lowStockArray = Array.isArray(data.low_stock) ? data.low_stock : []
      const expiringArray = Array.isArray(data.expiring) ? data.expiring : []
      setLowStockMedicines(lowStockArray as LowStockMedicine[])
      setExpiringSoonMedicines(expiringArray as ExpiringSoonMedicine[])
    }
  }, [alertsData])

  useEffect(() => {
    const isLoading = dashboardLoading || prescriptionsLoading || alertsLoading
    setLoading(isLoading)

    if (dashboardError) {
      setError((dashboardError as Error)?.message || 'Failed to load dashboard data')
    }
  }, [dashboardLoading, prescriptionsLoading, alertsLoading, dashboardError])

  const refreshData = () => {
    // Trigger refetch by updating state or calling fetch functions
    window.location.reload()
  }

  return {
    stats,
    prescriptionQueue,
    lowStockMedicines,
    expiringSoonMedicines,
    loading,
    error,
    refreshData
  }
}