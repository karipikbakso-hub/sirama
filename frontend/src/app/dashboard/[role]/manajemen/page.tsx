'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { StatCard } from '@/components/ui/stat-card'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import apiData from '@/lib/apiData'
import { Users, DollarSign, Bed, Clock, Eye, TrendingUp, AlertTriangle, Info, CheckCircle } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface KPIMetric {
  nama: string
  nilai: string
  satuan: string
  hari_ini: string
  persentase: number
  trend: string
  ikon: string
  warna: string
}

interface ChartData {
  tanggal: string
  [key: string]: any
}

interface AlertData {
  type: 'warning' | 'danger' | 'info' | 'success'
  title: string
  message: string
  action: string
}

interface ExecutiveData {
  kpis: KPIMetric[]
  charts: {
    kunjungan: ChartData[]
    pendapatan: ChartData[]
    bor: ChartData[]
    los: any[]
    kunjungan_per_poli: any[]
    top_diagnosa: any[]
    top_obat: any[]
  }
  alerts: AlertData[]
  period: string
  generated_at: string
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [filterType, setFilterType] = useState<'quick' | 'custom'>('quick')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    fetchData()
  }, [period, customStartDate, customEndDate, filterType])

  const fetchData = async () => {
    try {
      setLoading(true)
      let url = `/backend/public/api/executive-dashboard/kpi?period=${period}`

      if (filterType === 'custom' && customStartDate && customEndDate) {
        url = `/backend/public/api/executive-dashboard/kpi?start_date=${customStartDate}&end_date=${customEndDate}`
      }

      const response = await apiData.get(url)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching executive dashboard data:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const iconMap = {
    FaUsers: Users,
    FaMoneyBillWave: DollarSign,
    FaBed: Bed,
    FaClock: Clock,
    FaChartLine: TrendingUp,
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'danger': return AlertTriangle
      case 'info': return Info
      case 'success': return CheckCircle
      default: return Info
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'danger': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'success': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Executive
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoring performa rumah sakit secara real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Tidak Dapat Memuat Dashboard Executive
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tidak dapat mengambil data dari server. Kemungkinan penyebab:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 text-left space-y-1 mb-6">
            <li>• Backend server belum berjalan</li>
            <li>• Route API belum dikonfigurasi dengan benar</li>
            <li>• Masalah koneksi database</li>
            <li>• Authentication token tidak valid</li>
          </ul>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mx-auto"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    )
  }

  const periodOptions = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: '1y', label: '1 Tahun' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Manajemen RS
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoring KPI utama rumah sakit untuk pengambilan keputusan strategis
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Quick Filters */}
          <div className="flex gap-2">
            <Button
              variant={filterType === 'quick' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('quick')}
            >
              Quick Filter
            </Button>
            <Button
              variant={filterType === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('custom')}
            >
              Custom Range
            </Button>
          </div>

          {/* Period Filter */}
          {filterType === 'quick' && (
            <div className="flex gap-2">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={period === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {/* Custom Date Range */}
          {filterType === 'custom' && (
            <DateRangePicker
              startDate={customStartDate}
              endDate={customEndDate}
              onStartDateChange={(date) => setCustomStartDate(date)}
              onEndDateChange={(date) => setCustomEndDate(date)}
            />
          )}
        </div>
      </div>

      {/* Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map((alert, index) => {
            const AlertIcon = getAlertIcon(alert.type)
            return (
              <Alert key={index} className={`border-l-4 ${getAlertColor(alert.type)}`}>
                <AlertIcon className="h-4 w-4" />
                <AlertTitle className="font-semibold">{alert.title}</AlertTitle>
                <AlertDescription className="mt-1">
                  {alert.message}
                  <br />
                  <span className="font-medium text-sm">{alert.action}</span>
                </AlertDescription>
              </Alert>
            )
          })}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {data.kpis.map((kpi, index) => {
          const IconComponent = iconMap[kpi.ikon as keyof typeof iconMap] || Users
          const trend = kpi.trend === 'naik' ? 'up' : kpi.trend === 'turun' ? 'down' : 'neutral'

          return (
            <StatCard
              key={index}
              title={kpi.nama}
              value={kpi.nilai}
              description={`Hari ini: ${kpi.hari_ini}`}
              change={kpi.persentase}
              trend={trend}
              icon={IconComponent}
            />
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue 30 Hari */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Tren Pendapatan 30 Hari Terakhir
            </CardTitle>
            <CardDescription>
              Perkembangan pendapatan harian rumah sakit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line
              data={{
                labels: data.charts.pendapatan.map(item => item.tanggal),
                datasets: [{
                  label: 'Pendapatan',
                  data: data.charts.pendapatan.map(item => item.pendapatan),
                  borderColor: '#10B981',
                  backgroundColor: '#10B98115',
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Rp ${(context.parsed?.y as number)?.toLocaleString('id-ID') || 0}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `Rp ${(value as number).toLocaleString('id-ID')}`
                    }
                  }
                }
              }}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Kunjungan per Poli */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Kunjungan Pasien per Poli
            </CardTitle>
            <CardDescription>
              Distribusi kunjungan pasien berdasarkan poli klinik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: data.charts.kunjungan_per_poli.map(item => item.poli),
                datasets: [{
                  label: 'Kunjungan',
                  data: data.charts.kunjungan_per_poli.map(item => item.jumlah),
                  backgroundColor: '#3B82F6',
                  borderColor: '#2563EB',
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed?.y || 0} pasien`
                    }
                  }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Top 10 Diagnosa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Top 10 Diagnosa Terbanyak
            </CardTitle>
            <CardDescription>
              Diagnosa paling sering ditemukan pada pasien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pie
              data={{
                labels: data.charts.top_diagnosa.slice(0, 10).map(item => `${item.kode} - ${item.nama}`),
                datasets: [{
                  data: data.charts.top_diagnosa.slice(0, 10).map(item => item.jumlah),
                  backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
                  ],
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right' as const,
                    labels: { boxWidth: 12, font: { size: 11 } }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed} kasus`
                    }
                  }
                }
              }}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Top 10 Obat Terlaris */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Top 10 Obat Terlaris
            </CardTitle>
            <CardDescription>
              Obat-obatan yang paling sering diresepkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: data.charts.top_obat.slice(0, 10).map(item => item.nama_obat.length > 20 ? item.nama_obat.substring(0, 20) + '...' : item.nama_obat),
                datasets: [{
                  label: 'Total Terjual',
                  data: data.charts.top_obat.slice(0, 10).map(item => item.total_terjual),
                  backgroundColor: '#F59E0B',
                  borderColor: '#D97706',
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed?.y || 0} unit terjual`
                    }
                  }
                },
                scales: {
                  y: { beginAtZero: true },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                }
              }}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Data diperbarui pada: {new Date(data.generated_at).toLocaleString('id-ID')}
      </div>
    </div>
  )
}
