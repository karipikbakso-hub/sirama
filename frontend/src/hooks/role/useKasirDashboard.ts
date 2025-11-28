'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface KasirDashboardStats {
  total_pembayaran_hari_ini: number
  billing_pending: number
  tagihan_lunas: number
  deposit_aktif: number
}

export interface RecentPayment {
  id: number
  billing_id: number
  user_id: number
  tanggal_bayar: string
  jumlah_bayar: number
  metode_bayar: string
  no_referensi?: string
  catatan?: string
  created_at: string
  updated_at: string
  no_invoice: string
  patient_name: string
  medical_record_number: string
  cashier_name: string
  payment_date: string
}

export interface BillingAlert {
  overdue_billings: Array<{
    id: number
    no_invoice: string
    total_tagihan: number
    created_at: string
    patient_name: string
    medical_record_number: string
  }>
  low_deposits: Array<any>
}

export interface RevenueChartData {
  date: string
  revenue: number
}

export function useKasirDashboard() {
  const [stats, setStats] = useState<KasirDashboardStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [billingAlerts, setBillingAlerts] = useState<BillingAlert | null>(null)
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/kasir')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const fetchRecentPayments = async () => {
    try {
      const response = await api.get('/payments/recent')
      if (response.data.success) {
        setRecentPayments(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching recent payments:', error)
    }
  }

  const fetchBillingAlerts = async () => {
    try {
      const response = await api.get('/billings/alerts')
      if (response.data.success) {
        setBillingAlerts(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching billing alerts:', error)
    }
  }

  const fetchRevenueChart = async () => {
    try {
      const response = await api.get('/dashboard/kasir/revenue-chart')
      if (response.data.success) {
        setRevenueChart(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching revenue chart:', error)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentPayments(),
        fetchBillingAlerts(),
        fetchRevenueChart()
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return {
    stats,
    recentPayments,
    billingAlerts,
    revenueChart,
    loading,
    refreshData: fetchAllData
  }
}