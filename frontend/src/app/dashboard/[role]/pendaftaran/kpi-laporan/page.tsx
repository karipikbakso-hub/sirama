'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select } from '@/components/ui/select'
import { useGet } from '@/hooks/useApi'
import { format, subDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { FaSync, FaEye, FaDownload, FaFileAlt, FaEnvelope, FaPrint, FaChartBar, FaClock, FaShieldAlt, FaUsers, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa'
import toast from '@/lib/toast'

// Types
interface KPIMetric {
  label: string
  value: number | string
  unit?: string
  change?: number
  changeUnit?: string
  status?: 'good' | 'warning' | 'danger'
  target?: number
  color?: string
}

interface ChartDataPoint {
  date: string
  label: string
  total: number
  baru: number
  lama: number
  bpjs: number
  umum: number
  avgTime: number
  target: number
}

interface PieDataPoint extends Record<string, any> {
  name: string
  value: number
  color: string
}

const COLORS = {
  good: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  orange: '#F97316'
}

export default function KPIPendaftaranPage() {
  const router = useRouter()

  // Filters
  const [dateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [compareWith, setCompareWith] = useState<'previous_period' | 'last_year' | 'custom'>('previous_period')
  const [poliFilter, setPoliFilter] = useState<string>('all')
  const [staffFilter, setStaffFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)

  // Data states
  const [kpiSummary, setKpiSummary] = useState<KPIMetric[]>([])
  const [trendData, setTrendData] = useState<ChartDataPoint[]>([])
  const [peakHoursData, setPeakHoursData] = useState<ChartDataPoint[]>([])
  const [serviceTimeData, setServiceTimeData] = useState<PieDataPoint[]>([])
  const [patientTypeData, setPatientTypeData] = useState<PieDataPoint[]>([])
  const [activeTab, setActiveTab] = useState('daily')
  
  // API calls - commented out for now
  // const { data: kpiApiData } = useGet(

  // API calls - commented out for now
  // const { data: kpiApiData } = useGet(
  //   `/api/pendaftaran/kpi/summary?date_from=${format(dateRange.from, 'yyyy-MM-dd')}&date_to=${format(dateRange.to, 'yyyy-MM-dd')}`
  // )

  // Mock data for development - replace with real API calls
  const mockKPISummary: KPIMetric[] = [
    {
      label: 'Total Kunjungan',
      value: 145,
      change: 12.5,
      changeUnit: '%',
      color: COLORS.blue
    },
    {
      label: 'Avg Registration Time',
      value: 8.5,
      unit: 'min',
      status: 'good',
      target: 10,
      color: COLORS.good
    },
    {
      label: 'Avg Waiting Time',
      value: 12,
      unit: 'min',
      status: 'good',
      target: 15,
      color: COLORS.good
    },
    {
      label: 'BPJS Success Rate',
      value: 94,
      unit: '%',
      status: 'good',
      target: 95,
      color: COLORS.good
    },
    {
      label: 'SEP Generation Success',
      value: 92,
      unit: '%',
      status: 'good',
      color: COLORS.good
    },
    {
      label: 'Data Quality Score',
      value: 89,
      unit: '%',
      status: 'warning',
      color: COLORS.yellow
    }
  ]

  const mockTrendData: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'dd/MM', { locale: id }),
      total: Math.floor(Math.random() * 20) + 10,
      baru: Math.floor(Math.random() * 8) + 3,
      lama: Math.floor(Math.random() * 12) + 5,
      bpjs: Math.floor(Math.random() * 15) + 8,
      umum: Math.floor(Math.random() * 5) + 2,
      avgTime: Math.floor(Math.random() * 5) + 5,
      target: 10
    }
  })

  const mockPeakHoursData: ChartDataPoint[] = Array.from({ length: 9 }, (_, i) => ({
    date: '2025-01-01',
    label: `${8 + i}:00`,
    total: i === 7 ? 25 : Math.floor(Math.random() * 15) + 5,
    baru: Math.floor(Math.random() * 10) + 2,
    lama: Math.floor(Math.random() * 8) + 3,
    bpjs: Math.floor(Math.random() * 12) + 4,
    umum: Math.floor(Math.random() * 6) + 1,
    avgTime: Math.floor(Math.random() * 3) + 6,
    target: 8
  }))

  const mockServiceTimeData: PieDataPoint[] = [
    { name: '<5 min', value: 45, color: COLORS.good },
    { name: '5-10 min', value: 40, color: COLORS.good },
    { name: '10-15 min', value: 12, color: COLORS.yellow },
    { name: '>15 min', value: 3, color: COLORS.danger }
  ]

  const mockPatientTypeData: PieDataPoint[] = [
    { name: 'BPJS', value: 65, color: COLORS.blue },
    { name: 'Asuransi', value: 20, color: COLORS.green },
    { name: 'Umum', value: 15, color: COLORS.orange }
  ]

  // Initialize data
  useEffect(() => {
    setKpiSummary(mockKPISummary)
    setTrendData(mockTrendData)
    setPeakHoursData(mockPeakHoursData)
    setServiceTimeData(mockServiceTimeData)
    setPatientTypeData(mockPatientTypeData)
  }, [dateRange, poliFilter, staffFilter])

  // Auto refresh timer - disabled since refreshInterval doesn't exist
  useEffect(() => {
    if (!autoRefresh) return

    const timer = setInterval(() => {
      // Refresh data logic here
      console.log('Auto refreshing KPI data...')
    }, 300000) // 5 minutes hardcoded

    return () => clearInterval(timer)
  }, [autoRefresh])

  // Actions
  const handleExportReport = (format: 'pdf' | 'excel') => {
    toast.success(`Laporan KPI sedang di-generate dalam format ${format.toUpperCase()}...`)
    // Implement export logic
  }

  const handleEmailReport = () => {
    toast.success('Fitur email report akan segera tersedia.')
  }

  const handleDrillDown = (metric: string, value: any) => {
    toast.success(`Melihat detail untuk ${metric}: ${value}`)
    // Implement drill-down navigation
  }

  const sepsSuccessRate = 94

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
          KPI Pendaftaran - Kinerja Unit Pendaftaran
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Monitoring metrik kinerja dan evaluasi layanan pendaftaran pasien
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Periode Tanggal</label>
            <Select value="30_days" onChange={() => {}}>
              <option value="today">Hari Ini</option>
              <option value="7_days">7 Hari Terakhir</option>
              <option value="30_days">30 Hari Terakhir</option>
              <option value="custom">Custom</option>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Bandingkan Dengan</label>
            <Select value={compareWith} onChange={(e) => setCompareWith(e.target.value as 'previous_period' | 'last_year' | 'custom')}>
              <option value="previous_period">Periode Sebelumnya</option>
              <option value="last_year">Tahun Lalu</option>
              <option value="custom">Custom</option>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Filter Poli</label>
            <Select value={poliFilter} onChange={(e) => setPoliFilter(e.target.value)}>
              <option value="all">Semua Poli</option>
              <option value="umum">Poli Umum</option>
              <option value="anak">Poli Anak</option>
              <option value="dalam">Poli Penyakit Dalam</option>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">Filter Staff</label>
            <Select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
              <option value="all">Semua Staff</option>
              <option value="petugas_a">Petugas A</option>
              <option value="petugas_b">Petugas B</option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''}
            >
              <FaSync className={`mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {kpiSummary.map((metric, index) => (
          <Card
            key={index}
            className="p-4 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md hover:scale-105 transition-transform duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.label}
              </span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
            </div>
            <div className="text-2xl font-bold mb-1">
              {metric.value}
              <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {metric.change && (
                  <>
                    {metric.change > 0 ? (
                      <FaArrowUp className="text-green-500 text-xs" />
                    ) : metric.change < 0 ? (
                      <FaArrowDown className="text-red-500 text-xs" />
                    ) : (
                      <FaEquals className="text-gray-500 text-xs" />
                    )}
                    <span className={`text-xs ${
                      metric.change > 0 ? 'text-green-500' :
                      metric.change < 0 ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {Math.abs(metric.change)}{metric.changeUnit}
                    </span>
                  </>
                )}
              </div>
              {metric.status && (
                <Badge variant="secondary" className={`text-xs ${
                  metric.status === 'good' ? 'bg-green-100 text-green-800' :
                  metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {metric.status === 'good' ? '✓ Baik' : metric.status === 'warning' ? '⚠ Waspada' : '✗ Perlu Perbaikan'}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Kunjungan Trend */}
        <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaChartBar className="text-blue-500" />
              Tren Kunjungan Harian
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDrillDown('trend', 'daily')}>
                <FaEye className="mr-2" />
                Detail
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
                <FaDownload className="mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  stroke="#3B82F6"
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="baru"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Baru"
                />
                <Line
                  type="monotone"
                  dataKey="lama"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Lama"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peak Hours */}
        <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaClock className="text-orange-500" />
              Jam Sibuk Pendaftaran
            </h3>
            <Button variant="outline" size="sm" onClick={() => handleDrillDown('peak_hours', 'today')}>
              <FaEye className="mr-2" />
              Detail
            </Button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#F97316" name="Total Kunjungan" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Service Time Distribution */}
        <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaClock className="text-green-500" />
              Distribusi Waktu Layanan
            </h3>
            <Button variant="outline" size="sm" onClick={() => handleDrillDown('service_time', 'distribution')}>
              <FaEye className="mr-2" />
              Detail
            </Button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTimeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {serviceTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Patient Type Distribution */}
        <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaUsers className="text-purple-500" />
              Jenis Pasien
            </h3>
            <Button variant="outline" size="sm" onClick={() => handleDrillDown('patient_type', 'distribution')}>
              <FaEye className="mr-2" />
              Detail
            </Button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {patientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* SEP Success Rate - Gauge Chart */}
        <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaShieldAlt className="text-blue-500" />
              Tingkat Keberhasilan SEP
            </h3>
          </div>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${
                sepsSuccessRate >= 95 ? 'text-green-500' :
                sepsSuccessRate >= 90 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {sepsSuccessRate}%
              </div>
              <div className="w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className={`${
                      sepsSuccessRate >= 95 ? 'text-green-500' :
                      sepsSuccessRate >= 90 ? 'text-yellow-500' : 'text-red-500'
                    }`}
                    strokeDasharray={`${sepsSuccessRate * 2.51} 251`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Target: 95%</p>
              <Badge variant="secondary" className={`mt-2 ${
                sepsSuccessRate >= 95 ? 'bg-green-100 text-green-800' :
                sepsSuccessRate >= 90 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {sepsSuccessRate >= 95 ? '✓ Excellent' : sepsSuccessRate >= 90 ? '⚠ Good' : '✗ Needs Attention'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Staff Productivity */}
        <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaUsers className="text-indigo-500" />
              Produktivitas Staff
            </h3>
            <Button variant="outline" size="sm" onClick={() => handleDrillDown('staff_productivity', 'details')}>
              <FaEye className="mr-2" />
              Detail
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Petugas A', registrations: 45, target: 40, avgTime: 8.5 },
              { name: 'Petugas B', registrations: 38, target: 40, avgTime: 9.2 },
              { name: 'Petugas C', registrations: 42, target: 40, avgTime: 8.1 },
            ].map((staff, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{staff.name}</p>
                  <p className="text-xs text-gray-500">{staff.registrations} registrasi • {staff.avgTime}min rata-rata</p>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(staff.registrations / staff.target) * 100}
                    className="w-16 h-2"
                  />
                  <span className={`text-xs font-medium ${
                    staff.registrations >= staff.target ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {staff.registrations >= staff.target ? '✓' : '⚠'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detail Tables */}
      <Card className="p-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="daily">Ringkasan Harian</TabsTrigger>
              <TabsTrigger value="staff">Performa Staff</TabsTrigger>
              <TabsTrigger value="errors">Log Error</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={() => handleExportReport('excel')}>
              <FaFileAlt className="mr-2" />
              Export Data
            </Button>
          </div>

          <TabsContent value="daily">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Baru</TableHead>
                  <TableHead>Lama</TableHead>
                  <TableHead>SEP</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trendData.slice(0, 10).map((row, index) => (
                  <TableRow
                    key={index}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => handleDrillDown('daily_detail', row.date)}
                  >
                    <TableCell>{row.label}</TableCell>
                    <TableCell className="font-medium">{row.total}</TableCell>
                    <TableCell>{row.baru}</TableCell>
                    <TableCell>{row.lama}</TableCell>
                    <TableCell className="text-green-600">{Math.floor(row.total * 0.8)}</TableCell>
                    <TableCell>{row.avgTime} min</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FaEye className="text-blue-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="staff">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Registrasi</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>SEP Count</TableHead>
                  <TableHead>Error Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Petugas A', registrations: 45, avgTime: 8.5, sepCount: 38, errorRate: 2.1 },
                  { name: 'Petugas B', registrations: 38, avgTime: 9.2, sepCount: 32, errorRate: 3.5 },
                  { name: 'Petugas C', registrations: 42, avgTime: 8.1, sepCount: 35, errorRate: 1.8 },
                ].map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.registrations}</TableCell>
                    <TableCell>{staff.avgTime} min</TableCell>
                    <TableCell className="text-green-600">{staff.sepCount}</TableCell>
                    <TableCell className={`${
                      staff.errorRate > 3 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {staff.errorRate}%
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FaEye className="text-blue-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="errors">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Tipe Error</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    time: '08:15',
                    type: 'BPJS Validation',
                    description: 'NIK tidak valid',
                    staff: 'Petugas A',
                    status: 'resolved'
                  },
                  {
                    time: '10:22',
                    type: 'SEP Generation',
                    description: 'Koneksi BPJS timeout',
                    staff: 'Petugas B',
                    status: 'pending'
                  },
                  {
                    time: '14:33',
                    type: 'Data Entry',
                    description: 'Duplikasi nomor registrasi',
                    staff: 'Petugas C',
                    status: 'investigating'
                  },
                ].map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>{error.time}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="text-xs">
                        {error.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{error.description}</TableCell>
                    <TableCell>{error.staff}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${
                        error.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        error.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {error.status === 'resolved' ? 'Diresolusi' :
                         error.status === 'pending' ? 'Pending' : 'Sedang Investigasi'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Quick Actions Footer */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button onClick={() => handleExportReport('pdf')} className="bg-red-500 hover:bg-red-600">
          <FaDownload className="mr-2" />
          Export PDF Report
        </Button>
        <Button onClick={() => handleExportReport('excel')} variant="outline">
          <FaFileAlt className="mr-2" />
          Export Excel Data
        </Button>
        <Button onClick={handleEmailReport} variant="outline">
          <FaEnvelope className="mr-2" />
          Email Report
        </Button>
        <Button onClick={() => window.print()} variant="outline">
          <FaPrint className="mr-2" />
          Print Dashboard
        </Button>
      </div>
    </div>
  )
}
