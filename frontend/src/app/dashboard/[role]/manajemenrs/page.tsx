'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import apiData from '@/lib/apiData'
import { FaUsers, FaMoneyBillWave, FaBed, FaClock, FaEye } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

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

interface ExecutiveData {
  kpis: KPIMetric[]
  charts: {
    kunjungan: ChartData[]
    pendapatan: ChartData[]
    bor: ChartData[]
    los: any[]
  }
  period: string
  generated_at: string
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<ExecutiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await apiData.get(`/backend/public/api/executive-dashboard/kpi?period=${period}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching executive dashboard data:', error)
      setData(null) // Pastikan data null jika error
    } finally {
      setLoading(false)
    }
  }

  const iconMap = {
    FaUsers: FaUsers,
    FaMoneyBillWave: FaMoneyBillWave,
    FaBed: FaBed,
    FaClock: FaClock,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Executive
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoring KPI rumah sakit — kunjungan, pendapatan, BOR & LOS
          </p>
        </div>

        {/* Period Filter */}
        <div className="mt-4 sm:mt-0 flex gap-2">
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.kpis.map((kpi, index) => {
          const IconComponent = iconMap[kpi.ikon as keyof typeof iconMap] || FaUsers
          const trendColor = kpi.trend === 'naik' ? 'text-green-600' : kpi.trend === 'turun' ? 'text-red-600' : 'text-gray-600'
          const bgColor = `${kpi.warna}15` // Add transparency

          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div
                className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl opacity-10"
                style={{ backgroundColor: kpi.warna }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <IconComponent className="h-5 w-5" style={{ color: kpi.warna }} />
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <FaEye className="h-3 w-3" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {kpi.nilai}
                </CardTitle>
                <CardDescription className="text-sm font-medium">
                  {kpi.nama}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Hari ini: {kpi.hari_ini}
                  </span>
                  <span className={`font-medium ${trendColor}`}>
                    {kpi.persentase > 0 ? '+' : ''}{kpi.persentase}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kunjungan Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FaUsers className="h-5 w-5 text-blue-600" />
              Tren Kunjungan Pasien
            </CardTitle>
            <CardDescription>
              Perkembangan jumlah kunjungan hari ini vs hari sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line
              data={{
                labels: data.charts.kunjungan.map(item => item.tanggal),
                datasets: [{
                  label: 'Kunjungan',
                  data: data.charts.kunjungan.map(item => item.kunjungan),
                  borderColor: '#3B82F6',
                  backgroundColor: '#3B82F615',
                  tension: 0.4,
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
              height={200}
            />
          </CardContent>
        </Card>

        {/* Pendapatan Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FaMoneyBillWave className="h-5 w-5 text-green-600" />
              Tren Pendapatan
            </CardTitle>
            <CardDescription>
              Perkembangan pendapatan harian (status: lunas)
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
              height={200}
            />
          </CardContent>
        </Card>

        {/* BOR Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FaBed className="h-5 w-5 text-purple-600" />
              Tren Bed Occupancy Rate (BOR)
            </CardTitle>
            <CardDescription>
              Tingkat hunian tempat tidur rawat inap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line
              data={{
                labels: data.charts.bor.map(item => item.tanggal),
                datasets: [{
                  label: 'BOR (%)',
                  data: data.charts.bor.map(item => item.bor),
                  borderColor: '#8B5CF6',
                  backgroundColor: '#8B5CF615',
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${(context.parsed?.y as number)?.toFixed(1) || 0}%`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
              height={200}
            />
          </CardContent>
        </Card>

        {/* LOS Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FaClock className="h-5 w-5 text-orange-600" />
              Distribusi Length of Stay (LOS)
            </CardTitle>
            <CardDescription>
              Durasi rata-rata rawat inap berdasarkan kategori
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: data.charts.los.map(item => item.range),
                datasets: [{
                  label: 'Jumlah Pasien',
                  data: data.charts.los.map(item => item.pasien),
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
                      label: (context) => `${context.parsed?.y || 0} pasien`
                    }
                  }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
              height={200}
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
