'use client'

import { useState, useEffect } from 'react'

export interface NursingStats {
  totalPatients: number
  emergencyCases: number
  completedVitalSigns: number
  pendingMedications: number
}

export interface PatientVitalSigns {
  id: number
  patientName: string
  room: string
  vitalSigns: {
    bloodPressure: string
    heartRate: number
    temperature: number
    respiratoryRate: number
    oxygenSaturation: number
  }
  timestamp: string
  status: 'normal' | 'warning' | 'critical'
}

export function usePerawatDashboard() {
  const [stats, setStats] = useState<NursingStats | null>(null)
  const [vitalSigns, setVitalSigns] = useState<PatientVitalSigns[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data
      const mockStats: NursingStats = {
        totalPatients: 45,
        emergencyCases: 2,
        completedVitalSigns: 38,
        pendingMedications: 7
      }

      const mockVitalSigns: PatientVitalSigns[] = [
        {
          id: 1,
          patientName: 'Ahmad Surya',
          room: '101',
          vitalSigns: { bloodPressure: '120/80', heartRate: 72, temperature: 36.8, respiratoryRate: 16, oxygenSaturation: 98 },
          timestamp: '2025-11-15T10:30:00Z',
          status: 'normal'
        }
      ]

      setTimeout(() => {
        setStats(mockStats)
        setVitalSigns(mockVitalSigns)
        setLoading(false)
      }, 1000)

    } catch (error) {
      setLoading(false)
    }
  }

  return {
    stats,
    vitalSigns,
    loading,
    refreshData: fetchDashboardData
  }
}