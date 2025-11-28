'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaUsers, FaCalendarAlt, FaListAlt, FaShieldAlt, FaChartBar,
  FaClock, FaUserCheck, FaFileAlt, FaHospital, FaStethoscope,
  FaHeartbeat, FaAmbulance, FaUserMd, FaClipboardList,
  FaExclamationTriangle, FaCheckCircle, FaHourglassHalf,
  FaArrowUp, FaArrowDown, FaEquals, FaEye, FaDownload,
  FaRedo, FaFilter, FaSync
} from 'react-icons/fa'
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { usePendaftaranDashboard } from '@/hooks/role/usePendaftaranDashboard'
import { useGet } from '@/hooks/useApi'
import type { QueueRealtimeData } from '@/hooks/role/usePendaftaranDashboard'

// 定义integration status的类型接口
interface IntegrationStatus {
  data?: {
    bpjs?: {
      status?: {
        connected?: boolean
      }
    }
  }
}

interface SystemStatus {
  database: 'online' | 'offline' | 'maintenance'
  bpjsApi: 'connected' | 'disconnected' | 'maintenance'
  antrianServer: 'online' | 'offline' | 'maintenance'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function PendaftaranDashboard() {
  const router = useRouter()

  // Use the proper hook for real dashboard data
  const dashboardHookResult = usePendaftaranDashboard()
  
  const stats = dashboardHookResult.stats
  const chart = dashboardHookResult.chart
  const queueRealtime = dashboardHookResult.queueRealtime
  const patientsToday = dashboardHookResult.patientsToday
  const loading = dashboardHookResult.loading
  const error = dashboardHookResult.error
  const refreshData = dashboardHookResult.refreshData

  // Fetch real integration status
  const { data: integrationStatus } = useGet<IntegrationStatus>('/api/integrations/configurations')

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    bpjsApi: 'disconnected', // Default to disconnected until API confirms
    antrianServer: 'online'
  })

  // Update BPJS status when API data loads
  useEffect(() => {
    if (integrationStatus?.data?.bpjs?.status?.connected !== undefined) {
      setSystemStatus(prev => ({
        ...prev,
        bpjsApi: integrationStatus.data?.bpjs?.status?.connected ? 'connected' : 'disconnected'
      }))
    } else if (integrationStatus?.data) {
      // If we have data but no BPJS status or it's disconnected
      setSystemStatus(prev => ({
        ...prev,
        bpjsApi: 'disconnected'
      }))
    }
  }, [integrationStatus])

  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
    } finally {
      setRefreshing(false)
    }
  }

  const exportReport = () => {
    // Implement export functionality - placeholder
    console.log('Exporting report...')
    const dataStr = JSON.stringify({ stats, chart, queueRealtime }, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'dashboard-report.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FaClock className="mx-auto text-4xl text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FaFileAlt className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
          Dashboard Pendaftaran
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Selamat datang di sistem pendaftaran pasien Rumah Sakit Sirama
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kunjungan Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalKunjunganHariIni.value.toLocaleString() || 0}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Rawat Jalan: {stats?.totalKunjunganHariIni.breakdown.rawatJalan || 0}</span>
                <span className="text-xs text-gray-500">IGD: {stats?.totalKunjunganHariIni.breakdown.igd || 0}</span>
              </div>
            </div>
            <FaUsers className="text-3xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasien Dalam Antrian</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pasienDalamAntrian.value.toLocaleString() || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                {stats?.pasienDalamAntrian.trend !== undefined && (
                  <>
                    {stats.pasienDalamAntrian.trend > 0 ? (
                      <FaArrowUp className="text-red-500 text-xs" />
                    ) : stats.pasienDalamAntrian.trend < 0 ? (
                      <FaArrowDown className="text-green-500 text-xs" />
                    ) : (
                      <FaEquals className="text-gray-500 text-xs" />
                    )}
                    <span className={`text-xs ${stats.pasienDalamAntrian.trend > 0 ? 'text-red-500' : stats.pasienDalamAntrian.trend < 0 ? 'text-green-500' : 'text-gray-500'}`}>
                      {Math.abs(stats.pasienDalamAntrian.trend).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <FaListAlt className="text-3xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasien Baru Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pasienBaruHariIni.value.toLocaleString() || 0}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">vs kemarin: {stats?.pasienBaruHariIni.vsKemarin || 0}</span>
                {stats?.pasienBaruHariIni.trend !== undefined && (
                  <>
                    {stats.pasienBaruHariIni.trend > 0 ? (
                      <FaArrowUp className="text-green-500 text-xs" />
                    ) : stats.pasienBaruHariIni.trend < 0 ? (
                      <FaArrowDown className="text-red-500 text-xs" />
                    ) : (
                      <FaEquals className="text-gray-500 text-xs" />
                    )}
                    <span className={`text-xs ${stats.pasienBaruHariIni.trend > 0 ? 'text-green-500' : stats.pasienBaruHariIni.trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {Math.abs(stats.pasienBaruHariIni.trend).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <FaUserCheck className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Waktu Layanan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.rataRataWaktuLayanan.value?.toFixed(1) || 0} menit</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">
                  Target: ≤{(stats?.rataRataWaktuLayanan.target !== undefined) ? stats.rataRataWaktuLayanan.target : '15'} menit
                </span>
                <span className={`text-xs px-1 py-0.5 rounded ${
                  stats?.rataRataWaktuLayanan.status === 'good' ? 'bg-green-100 text-green-700' :
                  stats?.rataRataWaktuLayanan.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  stats?.rataRataWaktuLayanan.status === 'critical' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {stats?.rataRataWaktuLayanan.status === 'good' ? 'Baik' :
                   stats?.rataRataWaktuLayanan.status === 'warning' ? 'Waspada' : 
                   stats?.rataRataWaktuLayanan.status === 'critical' ? 'Perlu Perbaikan' : 'Tidak Diketahui'}
                </span>
              </div>
            </div>
            <FaClock className="text-3xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <FaChartBar className="text-green-500" />
          Status Sistem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Database Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.database === 'online' ? 'bg-green-500' :
                systemStatus.database === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Database</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Koneksi database utama</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              systemStatus.database === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              systemStatus.database === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {systemStatus.database === 'online' ? 'Online' :
               systemStatus.database === 'maintenance' ? 'Maintenance' : 'Offline'}
            </span>
          </div>

          {/* BPJS API Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.bpjsApi === 'connected' ? 'bg-green-500' :
                systemStatus.bpjsApi === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">BPJS API</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Integrasi BPJS Kesehatan</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              systemStatus.bpjsApi === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              systemStatus.bpjsApi === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {systemStatus.bpjsApi === 'connected' ? 'Connected' :
               systemStatus.bpjsApi === 'maintenance' ? 'Maintenance' : 'Disconnected'}
            </span>
          </div>

          {/* Antrian Server Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.antrianServer === 'online' ? 'bg-green-500' :
                systemStatus.antrianServer === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Antrian Server</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sistem manajemen antrian</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              systemStatus.antrianServer === 'online' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              systemStatus.antrianServer === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {systemStatus.antrianServer === 'online' ? 'Online' :
               systemStatus.antrianServer === 'maintenance' ? 'Maintenance' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients Today */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaUsers className="text-blue-500" />
            Pasien Terdaftar Hari Ini
          </h2>

          <div className="space-y-3">
            {patientsToday && Array.isArray(patientsToday) && patientsToday.length > 0 ? (
              patientsToday.slice(0, 5).map((patient: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{patient.patientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{patient.serviceType} - {patient.doctorName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patient.status === 'completed' ? 'bg-green-100 text-green-700' :
                    patient.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaUsers className="mx-auto text-3xl mb-2 opacity-50" />
                <p>Belum ada pasien terdaftar hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Replace Quick Actions with Information Section */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaFileAlt className="text-blue-500" />
            Informasi Penting
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <FaExclamationTriangle className="text-blue-500" />
                Pengumuman Jadwal
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                Jam pelayanan pendaftaran hari ini sampai dengan pukul 16.00 WIB
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Status Sistem
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Semua sistem berjalan normal. Tidak ada gangguan yang dilaporkan saat ini.
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                <FaSync className="text-purple-500" />
                Pembaruan Terakhir
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                Dashboard diperbarui setiap 5 menit sekali secara otomatis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Daily Registration Trends */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <FaChartBar className="text-blue-500" />
              Tren Registrasi Harian
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <FaRedo className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportReport}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export report"
              >
                <FaDownload className="text-lg" />
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart?.data || []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rawatJalan"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Rawat Jalan"
                />
                <Line
                  type="monotone"
                  dataKey="igd"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="IGD"
                />
                <Line
                  type="monotone"
                  dataKey="kontrol"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Kontrol"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Queue Realtime Monitor */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaListAlt className="text-orange-500" />
            Antrian Realtime
          </h2>

          <div className="space-y-3">
            {queueRealtime?.recentQueues && queueRealtime.recentQueues.length > 0 ? (
              queueRealtime.recentQueues.slice(0, 5).map((queue: QueueRealtimeData['recentQueues'][0], index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      queue.status === 'waiting' ? 'bg-blue-500' :
                      queue.status === 'called' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{queue.patientName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No. {queue.queueNumber} - {queue.doctorName}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    queue.status === 'waiting' ? 'bg-blue-100 text-blue-700' :
                    queue.status === 'called' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {queue.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaListAlt className="mx-auto text-3xl mb-2 opacity-50" />
                <p>Belum ada antrian aktif</p>
              </div>
            )}
          </div>

          {queueRealtime?.lastUpdated && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Terakhir update: {new Date(queueRealtime.lastUpdated).toLocaleTimeString('id-ID')}
            </div>
          )}
        </div>
      </div>

      {/* Queue Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Current Queue Status */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaListAlt className="text-orange-500" />
            Status Antrian Saat Ini
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaHourglassHalf className="text-blue-600 text-xl" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Menunggu</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Pasien dalam antrian</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {queueRealtime?.status.waiting || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaUserMd className="text-orange-600 text-xl" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Sedang Dipanggil</p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Dalam proses pemanggilan</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {queueRealtime?.status.called || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-600 text-xl" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Selesai</p>
                  <p className="text-sm text-green-600 dark:text-green-300">Pelayanan selesai</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                {queueRealtime?.status.completed || 0}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total dalam Antrian
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {(queueRealtime?.status.waiting || 0) + (queueRealtime?.status.called || 0)} pasien
              </span>
            </div>
          </div>
        </div>

        {/* Queue Summary */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaChartBar className="text-green-500" />
            Ringkasan Antrian
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-300">Rata-rata Waktu Tunggu</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{(queueRealtime?.avgWaitTime || 12)} menit</p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-300">Efektivitas Layanan</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{(queueRealtime?.status.completed || 0) > 0 ?
                Math.round(((queueRealtime?.status.completed || 0) / ((queueRealtime?.status.waiting || 0) + (queueRealtime?.status.completed || 0))) * 100) : 0}%</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p className="text-sm text-purple-600 dark:text-purple-300">Total Dilayani Hari Ini</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{queueRealtime?.status.completed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <FaCalendarAlt className="text-indigo-500" />
          Pengumuman & Informasi Sistem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Sistem Pendaftaran Online</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pasien dapat melakukan pendaftaran secara online melalui aplikasi mobile rumah sakit.
            </p>
          </div>

          <div className="border-l-4 border-green-500 pl-4 py-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Integrasi BPJS Kesehatan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sistem SEP telah terintegrasi dengan sistem BPJS untuk validasi real-time.
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 py-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Pembaruan Sistem Antrian</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Antrian digital telah diperbarui dengan estimasi waktu tunggu yang lebih akurat.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}