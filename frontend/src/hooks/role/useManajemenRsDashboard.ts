'use client'

import { useState, useEffect } from 'react'

export interface HospitalStats {
  bedOccupancyRate: number
  averageLengthOfStay: number
  patientSatisfaction: number
  totalRevenue: number
  operationalCosts: number
  netProfit: number
}

export interface KPIIndicators {
  bor: { current: number; target: number; trend: 'up' | 'down' | 'stable' }
  los: { current: number; target: number; trend: 'up' | 'down' | 'stable' }
  satisfaction: { current: number; target: number; trend: 'up' | 'down' | 'stable' }
}

export interface DepartmentPerformance {
  department: string
  patients: number
  revenue: number
  satisfaction: number
  efficiency: number
}

export function useManajemenRsDashboard() {
  const [stats, setStats] = useState<HospitalStats | null>(null)
  const [kpis, setKpis] = useState<KPIIndicators | null>(null)
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data
      const mockStats: HospitalStats = {
        bedOccupancyRate: 85.3,
        averageLengthOfStay: 4.2,
        patientSatisfaction: 92.5,
        totalRevenue: 1500000000,
        operationalCosts: 1200000000,
        netProfit: 300000000
      }

      const mockKpis: KPIIndicators = {
        bor: { current: 85.3, target: 80, trend: 'up' },
        los: { current: 4.2, target: 3.8, trend: 'down' },
        satisfaction: { current: 92.5, target: 90, trend: 'up' }
      }

      const mockDepartments: DepartmentPerformance[] = [
        { department: 'Poli Umum', patients: 245, revenue: 150000000, satisfaction: 94, efficiency: 88 },
        { department: 'Poli Spesialis', patients: 189, revenue: 280000000, satisfaction: 91, efficiency: 92 },
        { department: 'IGD', patients: 67, revenue: 95000000, satisfaction: 89, efficiency: 95 }
      ]

      setTimeout(() => {
        setStats(mockStats)
        setKpis(mockKpis)
        setDepartments(mockDepartments)
        setLoading(false)
      }, 1000)

    } catch (error) {
      setLoading(false)
    }
  }

  return {
    stats,
    kpis,
    departments,
    loading,
    refreshData: fetchDashboardData
  }
}