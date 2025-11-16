'use client'

import { useState, useEffect } from 'react'

export interface BillingStats {
  todayRevenue: number
  pendingPayments: number
  completedTransactions: number
  averageTransactionTime: number
  totalInvoices: number
}

export interface PendingPayment {
  id: number
  invoiceNumber: string
  patientName: string
  amount: number
  dueDate: string
  status: 'pending' | 'overdue' | 'paid'
}

export function useKasirDashboard() {
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Mock data
      const mockStats: BillingStats = {
        todayRevenue: 25000000,
        pendingPayments: 15,
        completedTransactions: 67,
        averageTransactionTime: 3.2, // minutes
        totalInvoices: 234
      }

      const mockPayments: PendingPayment[] = [
        {
          id: 1,
          invoiceNumber: 'INV-2025-001',
          patientName: 'Ahmad Surya',
          amount: 150000,
          dueDate: '2025-11-20',
          status: 'pending'
        }
      ]

      setTimeout(() => {
        setStats(mockStats)
        setPendingPayments(mockPayments)
        setLoading(false)
      }, 1000)

    } catch (error) {
      setLoading(false)
    }
  }

  return {
    stats,
    pendingPayments,
    loading,
    refreshData: fetchDashboardData
  }
}