'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  Clock,
  CheckCircle,
  Wallet,
  CreditCard,
  Receipt,
  FileText,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

// Components
import { DashboardTemplate } from '@/templates/DashboardTemplate'
import { DataTable, Column } from '@/components/ui/data-table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RevenueChart from '@/components/chart/RevenueChart'

// Hooks
import { useKasirDashboard } from '@/hooks/role/useKasirDashboard'

// Types
import type { RecentPayment, BillingAlert } from '@/hooks/role/useKasirDashboard'

export default function KasirDashboard() {
  const router = useRouter()
  const { stats, recentPayments, billingAlerts, revenueChart, loading, refreshData } = useKasirDashboard()

  // KPI Stats
  const statsData = [
    {
      title: 'Total Pembayaran Hari Ini',
      value: stats?.total_pembayaran_hari_ini || 0,
      icon: DollarSign,
      change: 12, // Calculate from previous day
      trend: 'up' as const,
      description: 'Dari hari kemarin'
    },
    {
      title: 'Billing Pending',
      value: stats?.billing_pending || 0,
      icon: Clock,
      change: -5,
      trend: 'down' as const,
      description: 'Perlu diproses'
    },
    {
      title: 'Tagihan Lunas',
      value: stats?.tagihan_lunas || 0,
      icon: CheckCircle,
      change: 8,
      trend: 'up' as const,
      description: 'Sudah dibayar'
    },
    {
      title: 'Deposit Aktif',
      value: stats?.deposit_aktif || 0,
      icon: Wallet,
      change: 3,
      trend: 'up' as const,
      description: 'Deposit tersedia'
    }
  ]

  // Recent Payments Table Columns
  const paymentColumns: Column<RecentPayment>[] = [
    {
      key: 'no_invoice',
      label: 'No. Invoice',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    {
      key: 'patient_name',
      label: 'Pasien',
      sortable: true
    },
    {
      key: 'medical_record_number',
      label: 'No. RM',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'jumlah_bayar',
      label: 'Jumlah Bayar',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          Rp {Number(value).toLocaleString('id-ID')}
        </span>
      )
    },
    {
      key: 'metode_bayar',
      label: 'Metode',
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'payment_date',
      label: 'Tanggal',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID')
    }
  ]

  // Billing Alerts Component
  const BillingAlerts = ({ alerts }: { alerts: BillingAlert | null }) => {
    if (!alerts) return null

    const overdueCount = alerts.overdue_billings?.length || 0
    const lowDepositCount = alerts.low_deposits?.length || 0

    if (overdueCount === 0 && lowDepositCount === 0) return null

    return (
      <div className="space-y-3">
        {overdueCount > 0 && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>{overdueCount} tagihan</strong> sudah melewati batas waktu pembayaran.
              <Button
                variant="ghost"
                className="p-0 h-auto text-red-800 dark:text-red-200 underline hover:bg-transparent"
                onClick={() => router.push('/dashboard/kasir/tagihan')}
              >
                Lihat detail
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {lowDepositCount > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>{lowDepositCount} deposit</strong> hampir habis.
              <Button
                variant="ghost"
                className="p-0 h-auto text-yellow-800 dark:text-yellow-200 underline hover:bg-transparent"
                onClick={() => router.push('/dashboard/kasir/deposit')}
              >
                Kelola deposit
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Quick Actions
  const quickActions = [
    {
      label: 'Proses Pembayaran',
      icon: CreditCard,
      action: () => router.push('/dashboard/kasir/pembayaran'),
      variant: 'default' as const
    },
    {
      label: 'Cetak Kwitansi',
      icon: Receipt,
      action: () => router.push('/dashboard/kasir/kwitansi'),
      variant: 'outline' as const
    },
    {
      label: 'Lihat Tagihan',
      icon: FileText,
      action: () => router.push('/dashboard/kasir/tagihan'),
      variant: 'outline' as const
    }
  ]

  // Charts Section
  const charts = [
    {
      title: 'Revenue 7 Hari Terakhir',
      component: <RevenueChart data={revenueChart} loading={loading} />,
      colSpan: 2 as const
    }
  ]

  // Recent Activity Section
  const recentActivity = {
    title: 'Transaksi Terbaru',
    component: (
      <DataTable
        data={recentPayments}
        columns={paymentColumns}
        isLoading={loading}
        searchable={true}
        searchPlaceholder="Cari transaksi..."
        pagination={true}
        itemsPerPage={10}
        emptyStateMessage="Belum ada transaksi hari ini"
        onRowClick={(row) => router.push(`/dashboard/kasir/pembayaran/${row.id}`)}
      />
    )
  }

  // Custom Widgets (Alerts)
  const customWidgets = [
    {
      title: 'Peringatan',
      component: <BillingAlerts alerts={billingAlerts} />,
      colSpan: 1 as const
    }
  ]

  return (
    <DashboardTemplate
      title="Dashboard Kasir"
      description="Pantau transaksi pembayaran dan kelola billing rumah sakit"
      stats={statsData}
      statsColumns={4}
      charts={charts}
      recentActivity={recentActivity}
      customWidgets={customWidgets}
      onRefresh={refreshData}
      isRefreshing={loading}
      actions={quickActions}
    />
  )
}
