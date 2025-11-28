'use client'

import { useState, useEffect } from 'react'
import { Pill, FileText, Package, AlertTriangle, TrendingUp, RefreshCw, ClipboardList, Truck, BarChart3 } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useApotekerDashboard } from '@/hooks/role/useApotekerDashboard'
import { useFetch } from '@/hooks/useApi'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function ApotekerDashboard() {
  const {
    stats,
    prescriptionQueue,
    lowStockMedicines,
    expiringSoonMedicines,
    loading,
    error,
    refreshData
  } = useApotekerDashboard()

  const [chartData, setChartData] = useState<any>(null)
  const [chartLoading, setChartLoading] = useState(true)

  // Fetch chart data
  const { data: chartApiData } = useFetch('/api/reports/daily-usage')

  useEffect(() => {
    if (chartApiData && Array.isArray(chartApiData)) {
      const labels = chartApiData.map((item: any) => item.date)
      const data = chartApiData.map((item: any) => item.total_quantity)

      setChartData({
        labels,
        datasets: [
          {
            label: 'Pemakaian Obat (Qty)',
            data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      })
      setChartLoading(false)
    }
  }, [chartApiData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading dashboard data: {error}
        </AlertDescription>
      </Alert>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="text-lg" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              💊 Dashboard Apoteker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sistem Manajemen Farmasi & Obat - RS Sirama
            </p>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="text-lg" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Order Masuk"
              value={stats?.order_masuk || 0}
              icon={FileText}
              description="Resep hari ini"
            />
            <StatCard
              title="Validasi Pending"
              value={stats?.validasi_pending || 0}
              icon={ClipboardList}
              description="Perlu verifikasi"
            />
            <StatCard
              title="Stok Menipis"
              value={stats?.stok_menipis || 0}
              icon={Package}
              description="Perlu restock"
            />
            <StatCard
              title="Expired Soon"
              value={stats?.expired_soon || 0}
              icon={AlertTriangle}
              description="< 30 hari"
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard/apoteker/validasi-resep'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ClipboardList className="text-lg" />
                Verifikasi Resep
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/apoteker/dispensing'}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Pill className="text-lg" />
                Dispensing
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/apoteker/stok-opname'}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Package className="text-lg" />
                Stok Opname
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/apoteker/laporan'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <BarChart3 className="text-lg" />
                Laporan
              </button>
            </div>
          </div>
        </div>

        {/* Pending Prescriptions */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Daftar Resep Masuk
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : prescriptionQueue.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {prescriptionQueue.slice(0, 5).map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {prescription.prescriptionNumber} - {prescription.patientName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dokter: {prescription.doctorName} • {formatDate(prescription.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={prescription.status === 'pending' ? 'secondary' : 'default'}>
                        {prescription.status}
                      </Badge>
                      <button
                        onClick={() => window.location.href = `/dashboard/apoteker/verifikasi-resep/${prescription.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Proses Resep"
                      >
                        <ClipboardList className="text-lg" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Tidak ada resep pending
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Package className="text-orange-600" />
            Stok Menipis
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : lowStockMedicines.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lowStockMedicines.slice(0, 5).map((medicine, index) => (
                <div key={`${medicine.id}-${index}`} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{medicine.name}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Stok: {medicine.stock} {medicine.unit} • Expired: {formatDate(medicine.expired_date)}
                    </p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Semua stok dalam kondisi baik
            </p>
          )}
        </div>

        {/* Expiring Soon Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-red-600" />
            Obat Expired Soon
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : expiringSoonMedicines.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {expiringSoonMedicines.slice(0, 5).map((medicine, index) => {
                const daysUntilExpiry = Math.ceil((new Date(medicine.expired_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const isCritical = daysUntilExpiry <= 7

                return (
                  <div key={`${medicine.id}-${index}`} className={`flex items-center justify-between p-3 rounded-lg border ${isCritical
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  }`}>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{medicine.name}</p>
                      <p className={`text-sm ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        Stok: {medicine.stock} {medicine.unit} • Expired: {formatDate(medicine.expired_date)} ({daysUntilExpiry} hari)
                      </p>
                    </div>
                    <Badge variant={isCritical ? "destructive" : "secondary"}>
                      {isCritical ? 'Critical' : 'Warning'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Tidak ada obat yang akan expired soon
            </p>
          )}
        </div>
      </div>

      {/* Medicine Usage Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Pemakaian Obat 7 Hari Terakhir
        </h3>
        {chartLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : chartData ? (
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Tidak ada data pemakaian obat
          </p>
        )}
      </div>
    </div>
  )
}
