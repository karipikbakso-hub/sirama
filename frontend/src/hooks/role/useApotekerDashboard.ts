'use client'

import { useState, useEffect } from 'react'

export interface PharmacyStats {
  totalPrescriptions: number
  pendingValidations: number
  dispensedToday: number
  lowStockAlerts: number
  totalMedicines: number
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

export function useApotekerDashboard() {
  const [stats, setStats] = useState<PharmacyStats | null>(null)
  const [prescriptionQueue, setPrescriptionQueue] = useState<PrescriptionQueue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data
      const mockStats: PharmacyStats = {
        totalPrescriptions: 156,
        pendingValidations: 12,
        dispensedToday: 89,
        lowStockAlerts: 5,
        totalMedicines: 1247
      }

      const mockQueue: PrescriptionQueue[] = [
        {
          id: 1,
          prescriptionNumber: 'RX-2025-001',
          patientName: 'Ahmad Surya',
          doctorName: 'Dr. Smith',
          status: 'pending',
          priority: 'normal',
          createdAt: '2025-11-15T10:30:00Z'
        }
      ]

      setTimeout(() => {
        setStats(mockStats)
        setPrescriptionQueue(mockQueue)
        setLoading(false)
      }, 1000)

    } catch (error) {
      setLoading(false)
    }
  }

  return {
    stats,
    prescriptionQueue,
    loading,
    refreshData: fetchDashboardData
  }
}