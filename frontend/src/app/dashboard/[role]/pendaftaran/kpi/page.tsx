'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaEye,
  FaStar,
  FaUserCheck,
  FaHourglassHalf,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import toast from '@/lib/toast'
import apiData from '@/lib/apiData'

// Types
interface KPISummary {
  total_registrations: number
  today_registrations: number
  completed_today: number
  pending_today: number
  completion_rate_today: number
  avg_wait_time: number
  avg_service_time: number
  satisfaction_score: number
}

interface TrendData {
  date: string
  total: number
  completed: number
  cancelled: number
  completion_rate: number
}

interface ServicePerformance {
  service_unit: string
  total_registrations: number
  completed: number
  cancelled: number
  completion_rate: number
  avg_service_time: number
}

interface QueueEfficiency {
  total_served: number
  total_skipped: number
  skip_rate: number
  avg_wait_time: number
  avg_service_time: number
  efficiency_score: number
}

interface PeakHours {
  daily_patterns: Array<{
    day: string
    hours: Array<{
      hour: number
      registrations: number
    }>
  }>
  peak_hour: number
  peak_registrations: number
}

interface PaymentDistribution {
  method: string
  count: number
  percentage: number
}

interface ReferralSource {
  source: string
  count: number
  percentage: number
}

interface StaffPerformance {
  staff_id: number
  staff_name: string
  total_registrations: number
  completed: number
  completion_rate: number
  avg_processing_time: number
  efficiency_score: number
}

interface KPITargets {
  daily_registrations_target: number
  completion_rate_target: number
  avg_wait_time_target: number
  avg_service_time_target: number
  satisfaction_score_target: number
  skip_rate_target: number
}

interface KPIData {
  summary: KPISummary
  trends: TrendData[]
  service_performance: ServicePerformance[]
  queue_efficiency: QueueEfficiency
  peak_hours: PeakHours
  payment_distribution: PaymentDistribution[]
  referral_sources: ReferralSource[]
  staff_performance: StaffPerformance[]
  targets: KPITargets
}

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6'
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.warning,
  COLORS.danger,
  COLORS.success,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
  COLORS.teal
]

export default function KPIPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performance' | 'queue' | 'staff'>('overview')
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<string>('all')

  // Fetch KPI data
  const { data: kpiData, isLoading, error, refetch } = useQuery<KPIData>({
    queryKey: ['kpi-dashboard', period],
    queryFn: async () => {
      const response = await apiData.get(`/kpi/dashboard?period=${period}`)
      return response.data
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  })

  const handleExportData = useCallback(() => {
    if (!kpiData) return

    const exportData = {
      summary: kpiData.summary,
      trends: kpiData.trends,
      service_performance: kpiData.service_performance,
      queue_efficiency: kpiData.queue_efficiency,
      peak_hours: kpiData.peak_hours,
      payment_distribution: kpiData.payment_distribution,
      referral_sources: kpiData.referral_sources,
      staff_performance: kpiData.staff_performance,
      exported_at: new Date().toISOString(),
      period: period
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kpi-pendaftaran-${period}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Data berhasil diekspor')
  }, [kpiData, period])

  const getTrendIndicator = (current: number, target: number) => {
    const diff = current - target
    const percentage = target > 0 ? ((diff / target) * 100) : 0

    if (Math.abs(percentage) < 5) {
      return { icon: FaEquals, color: 'text-gray-500', text: 'Sesuai Target' }
    } else if (diff > 0) {
      return { icon: FaArrowUp, color: 'text-green-500', text: `+${percentage.toFixed(1)}%` }
    } else {
      return { icon: FaArrowDown, color: 'text-red-500', text: `${percentage.toFixed(1)}%` }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gagal Memuat Data KPI</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Terjadi kesalahan saat mengambil data KPI pendaftaran
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
            <FaChartLine className="text-blue-500" />
            <span className="truncate">KPI Pendaftaran</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dashboard Kinerja Unit Pendaftaran
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Pilih periode analisis KPI"
          >
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
            <option value="90d">90 Hari</option>
            <option value="1y">1 Tahun</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition"
          >
            <FaDownload className="text-sm" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {kpiData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendaftaran</p>
                <p className="text-2xl font-bold">{kpiData.summary.total_registrations.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">dalam {period}</p>
              </div>
              <FaUsers className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendaftaran Hari Ini</p>
                <p className="text-2xl font-bold">{kpiData.summary.today_registrations}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {kpiData.summary.completed_today} selesai
                </p>
              </div>
              <FaCalendarAlt className="text-2xl text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Penyelesaian</p>
                <p className="text-2xl font-bold">{kpiData.summary.completion_rate_today}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {(() => {
                    const indicator = getTrendIndicator(kpiData.summary.completion_rate_today, kpiData.targets.completion_rate_target)
                    const Icon = indicator.icon
                    return (
                      <>
                        <Icon className={`text-sm ${indicator.color}`} />
                        <span className={`text-xs ${indicator.color}`}>{indicator.text}</span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <FaCheckCircle className="text-2xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Waktu Tunggu Rata-rata</p>
                <p className="text-2xl font-bold">{kpiData.summary.avg_wait_time}min</p>
                <div className="flex items-center gap-1 mt-1">
                  {(() => {
                    const indicator = getTrendIndicator(kpiData.targets.avg_wait_time_target, kpiData.summary.avg_wait_time)
                    const Icon = indicator.icon
                    return (
                      <>
                        <Icon className={`text-sm ${indicator.color}`} />
                        <span className={`text-xs ${indicator.color}`}>{indicator.text}</span>
                      </>
                    )
                  })()}
                </div>
              </div>
              <FaClock className="text-2xl text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'overview', label: 'Ringkasan', icon: FaChartLine },
            { key: 'trends', label: 'Tren', icon: FaChartBar },
            { key: 'performance', label: 'Performa Unit', icon: FaChartPie },
            { key: 'queue', label: 'Antrian', icon: FaHourglassHalf },
            { key: 'staff', label: 'Performa Staff', icon: FaUserCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeTab === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Kepuasan Pasien</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">{kpiData?.summary.satisfaction_score}%</p>
                  </div>
                  <FaStar className="text-2xl text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Waktu Pelayanan</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{kpiData?.summary.avg_service_time}min</p>
                  </div>
                  <FaClock className="text-2xl text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Pending Hari Ini</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{kpiData?.summary.pending_today}</p>
                  </div>
                  <FaHourglassHalf className="text-2xl text-purple-500" />
                </div>
              </div>
            </div>

            {/* Payment Distribution & Referral Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">Distribusi Pembayaran</h3>
                {kpiData?.payment_distribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={kpiData.payment_distribution as any}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, percentage }: any) => `${method}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {kpiData.payment_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Referral Sources */}
              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">Sumber Rujukan</h3>
                {kpiData?.referral_sources && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={kpiData.referral_sources}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Tren Pendaftaran Harian</h3>
              {kpiData?.trends && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={kpiData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total" fill={COLORS.primary} name="Total" />
                    <Line yAxisId="right" type="monotone" dataKey="completion_rate" stroke={COLORS.success} strokeWidth={3} name="Tingkat Penyelesaian (%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Performa Unit Pelayanan</h3>
              {kpiData?.service_performance && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={kpiData.service_performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service_unit" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_registrations" fill={COLORS.primary} name="Total Pendaftaran" />
                    <Bar dataKey="completed" fill={COLORS.success} name="Selesai" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Service Performance Table */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Detail Performa Unit</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Unit Pelayanan</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Total</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Selesai</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Tingkat Penyelesaian</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Waktu Rata-rata</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-200">
                    {kpiData?.service_performance?.map((service, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium">{service.service_unit}</td>
                        <td className="px-4 py-3">{service.total_registrations}</td>
                        <td className="px-4 py-3">{service.completed}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.completion_rate >= 90 ? 'bg-green-100 text-green-700' :
                            service.completion_rate >= 75 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {service.completion_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3">{service.avg_service_time}min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Queue Efficiency Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Dilayani</p>
                    <p className="text-2xl font-bold">{kpiData?.queue_efficiency.total_served}</p>
                  </div>
                  <FaCheckCircle className="text-2xl text-green-500" />
                </div>
              </div>

              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tidak Hadir</p>
                    <p className="text-2xl font-bold">{kpiData?.queue_efficiency.total_skipped}</p>
                  </div>
                  <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
              </div>

              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Absensi</p>
                    <p className="text-2xl font-bold">{kpiData?.queue_efficiency.skip_rate}%</p>
                  </div>
                  <FaChartPie className="text-2xl text-orange-500" />
                </div>
              </div>

              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efisiensi</p>
                    <p className="text-2xl font-bold">{kpiData?.queue_efficiency.efficiency_score}%</p>
                  </div>
                  <FaStar className="text-2xl text-purple-500" />
                </div>
              </div>
            </div>

            {/* Peak Hours Analysis */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Analisis Jam Sibuk</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Jam Puncak: {kpiData?.peak_hours.peak_hour}:00</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {kpiData?.peak_hours.peak_registrations} pendaftaran
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Array.from({ length: 24 }, (_, i) => ({
                      hour: i,
                      registrations: Math.floor(Math.random() * 50) + 10 // Mock data
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="registrations" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Pola Harian</h4>
                  <div className="space-y-2">
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day, index) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm">{day}</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 8 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded ${
                                Math.random() > 0.5 ? 'bg-blue-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Performa Staff Pendaftaran</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Nama Staff</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Total Pendaftaran</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Selesai</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Tingkat Penyelesaian</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Waktu Proses</th>
                      <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Skor Efisiensi</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-200">
                    {kpiData?.staff_performance?.map((staff, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-medium">{staff.staff_name}</td>
                        <td className="px-4 py-3">{staff.total_registrations}</td>
                        <td className="px-4 py-3">{staff.completed}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            staff.completion_rate >= 95 ? 'bg-green-100 text-green-700' :
                            staff.completion_rate >= 85 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {staff.completion_rate}%
                          </span>
                        </td>
                        <td className="px-4 py-3">{staff.avg_processing_time}min</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${staff.efficiency_score}%` }}
                              />
                            </div>
                            <span className="text-xs">{staff.efficiency_score}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Performance Chart */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Perbandingan Efisiensi Staff</h3>
              {kpiData?.staff_performance && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kpiData.staff_performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="staff_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completion_rate" fill={COLORS.success} name="Tingkat Penyelesaian (%)" />
                    <Bar dataKey="efficiency_score" fill={COLORS.primary} name="Skor Efisiensi (%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
