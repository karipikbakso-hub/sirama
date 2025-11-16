'use client'

import { useState, useEffect, useCallback } from 'react'
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaClock, FaUsers, FaServer, FaPlay, FaPause, FaRedo, FaEye, FaSearch, FaFilter, FaDownload, FaUpload } from 'react-icons/fa'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/lib/toast'
import apiData from '@/lib/apiData'

// Types
interface SyncStats {
  total_patients: number
  synced_patients: number
  pending_sync: number
  failed_sync: number
  last_sync: string | null
  sync_success_rate: number
}

interface ConfigStatus {
  configured: boolean
  status: 'connected' | 'offline' | 'not_configured'
  message: string
  last_sync?: string
}

interface SyncLog {
  id: number
  patient_id: number
  resource_type: string
  resource_id: string | null
  local_resource_id: string
  sync_status: 'pending' | 'success' | 'failed'
  sync_attempted_at: string | null
  sync_completed_at: string | null
  error_message: string | null
  retry_count: number
  created_at: string
  updated_at: string
  patient: {
    id: number
    mrn: string
    name: string
  }
}

interface Patient {
  id: number
  mrn: string
  name: string
  birth_date: string | null
  gender: string | null
}

export default function SatusehatSyncPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sync' | 'logs' | 'patients'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPatients, setSelectedPatients] = useState<number[]>([])
  const [syncProgress, setSyncProgress] = useState<{ current: number, total: number, message: string } | null>(null)

  const queryClient = useQueryClient()

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['satusehat-dashboard'],
    queryFn: async () => {
      const response = await apiData.get('/satusehat/dashboard')
      return response.data.data as {
        stats: SyncStats
        recent_syncs: SyncLog[]
        config_status: ConfigStatus
      }
    }
  })

  // Fetch sync logs
  const { data: syncLogsData, isLoading: logsLoading } = useQuery({
    queryKey: ['satusehat-sync-logs', searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await apiData.get(`/satusehat/sync-logs?${params}`)
      return response.data
    },
    enabled: activeTab === 'logs'
  })

  // Fetch available patients
  const { data: availablePatientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ['satusehat-available-patients', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)

      const response = await apiData.get(`/satusehat/available-patients?${params}`)
      return response.data
    },
    enabled: activeTab === 'patients'
  })

  // Sync single patient mutation
  const syncPatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      const response = await apiData.post('/satusehat/sync-patient', { patient_id: patientId })
      return response.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message)
        queryClient.invalidateQueries({ queryKey: ['satusehat-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['satusehat-sync-logs'] })
        queryClient.invalidateQueries({ queryKey: ['satusehat-available-patients'] })
      } else {
        toast.error(data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal sync pasien')
    }
  })

  // Bulk sync mutation
  const bulkSyncMutation = useMutation({
    mutationFn: async (patientIds: number[]) => {
      const response = await apiData.post('/satusehat/bulk-sync', {
        patient_ids: patientIds,
        limit: 50
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message)
        queryClient.invalidateQueries({ queryKey: ['satusehat-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['satusehat-sync-logs'] })
        queryClient.invalidateQueries({ queryKey: ['satusehat-available-patients'] })
        setSelectedPatients([])
      } else {
        toast.error(data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal bulk sync')
    }
  })

  // Retry failed syncs mutation
  const retryFailedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiData.post('/satusehat/retry-failed', { limit: 20 })
      return response.data
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message)
        queryClient.invalidateQueries({ queryKey: ['satusehat-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['satusehat-sync-logs'] })
      } else {
        toast.error(data.message)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal retry sync')
    }
  })

  const handlePatientSelect = (patientId: number, selected: boolean) => {
    if (selected) {
      setSelectedPatients(prev => [...prev, patientId])
    } else {
      setSelectedPatients(prev => prev.filter(id => id !== patientId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected && availablePatientsData?.data) {
      setSelectedPatients(availablePatientsData.data.map((p: Patient) => p.id))
    } else {
      setSelectedPatients([])
    }
  }

  const handleBulkSync = () => {
    if (selectedPatients.length === 0) {
      toast.error('Pilih minimal 1 pasien untuk sync')
      return
    }
    bulkSyncMutation.mutate(selectedPatients)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Berhasil
        </span>
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Gagal
        </span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaClock className="text-xs" />
          Pending
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getConfigStatusBadge = (status: ConfigStatus) => {
    switch (status.status) {
      case 'connected':
        return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-2">
          <FaCheckCircle />
          Terhubung
        </span>
      case 'offline':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-sm font-medium flex items-center gap-2">
          <FaExclamationTriangle />
          Offline
        </span>
      case 'not_configured':
        return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium flex items-center gap-2">
          <FaExclamationTriangle />
          Belum Konfigurasi
        </span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-sm font-medium">{status.status}</span>
    }
  }

  const currentData = activeTab === 'logs' ? syncLogsData?.data?.data || [] :
                     activeTab === 'patients' ? availablePatientsData?.data?.data || [] : []

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
          <FaSync className="text-blue-500" />
          <span className="truncate">SATUSEHAT Sync</span>
        </h1>
        <div className="flex items-center gap-2">
          {dashboardData?.config_status && getConfigStatusBadge(dashboardData.config_status)}
        </div>
      </div>

      {/* Statistics Cards */}
      {dashboardData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pasien</p>
                <p className="text-2xl font-bold">{dashboardData.stats.total_patients}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">di database</p>
              </div>
              <FaUsers className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sudah Sync</p>
                <p className="text-2xl font-bold">{dashboardData.stats.synced_patients}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">ke SATUSEHAT</p>
              </div>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Sync</p>
                <p className="text-2xl font-bold">{dashboardData.stats.pending_sync}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">menunggu proses</p>
              </div>
              <FaClock className="text-2xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Sukses</p>
                <p className="text-2xl font-bold">{dashboardData.stats.sync_success_rate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">sync berhasil</p>
              </div>
              <FaServer className="text-2xl text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: FaServer },
            { key: 'sync', label: 'Sync Data', icon: FaSync },
            { key: 'logs', label: 'Log Sync', icon: FaClock },
            { key: 'patients', label: 'Daftar Pasien', icon: FaUsers },
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
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Recent Sync Activity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Aktivitas Sync Terbaru</h3>
              {dashboardLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : dashboardData?.recent_syncs?.length ? (
                <div className="space-y-3">
                  {dashboardData.recent_syncs.map((sync: SyncLog) => (
                    <div key={sync.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${sync.sync_status === 'success' ? 'bg-green-100 text-green-600' : sync.sync_status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {sync.sync_status === 'success' ? <FaCheckCircle /> : sync.sync_status === 'failed' ? <FaExclamationTriangle /> : <FaClock />}
                        </div>
                        <div>
                          <p className="font-medium">{sync.patient.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sync.resource_type} • {new Date(sync.updated_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(sync.sync_status)}
                        {sync.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs truncate" title={sync.error_message}>
                            {sync.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaClock className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>Belum ada aktivitas sync</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('sync')}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex flex-col items-center gap-2"
              >
                <FaSync className="text-2xl text-blue-500" />
                <span className="font-medium">Sync Manual</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sync pasien individual</span>
              </button>

              <button
                onClick={() => setActiveTab('patients')}
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition flex flex-col items-center gap-2"
              >
                <FaUsers className="text-2xl text-green-500" />
                <span className="font-medium">Bulk Sync</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sync multiple pasien</span>
              </button>

              <button
                onClick={() => retryFailedMutation.mutate()}
                disabled={retryFailedMutation.isPending}
                className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <FaRedo className="text-2xl text-orange-500" />
                <span className="font-medium">Retry Failed</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Ulangi sync gagal</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="text-center">
              <FaSync className="text-6xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sync Data Pasien ke SATUSEHAT</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Kirim data pasien dalam format FHIR ke platform SATUSEHAT
              </p>

              <div className="max-w-md mx-auto">
                <input
                  type="number"
                  placeholder="Masukkan ID Pasien"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 mb-4"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const patientId = parseInt((e.target as HTMLInputElement).value)
                      if (patientId) {
                        syncPatientMutation.mutate(patientId)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement
                    const patientId = parseInt(input?.value || '')
                    if (patientId) {
                      syncPatientMutation.mutate(patientId)
                      input.value = ''
                    }
                  }}
                  disabled={syncPatientMutation.isPending}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {syncPatientMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sedang Sync...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Sync Pasien
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'logs' || activeTab === 'patients') && (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={activeTab === 'logs' ? "Cari berdasarkan nama pasien..." : "Cari berdasarkan nama atau MRN..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>

              {activeTab === 'logs' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="success">Berhasil</option>
                  <option value="failed">Gagal</option>
                  <option value="pending">Pending</option>
                </select>
              )}

              {activeTab === 'patients' && selectedPatients.length > 0 && (
                <button
                  onClick={handleBulkSync}
                  disabled={bulkSyncMutation.isPending}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  {bulkSyncMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Sync {selectedPatients.length} Pasien
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Data Table */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              {activeTab === 'logs' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold">Log Sync SATUSEHAT</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {syncLogsData?.data?.length || 0} log
                    </span>
                  </div>

                  {logsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">MRN</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Resource</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Waktu</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Error</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-800 dark:text-gray-200">
                          {currentData?.map((log: SyncLog) => (
                            <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                              <td className="px-4 py-3 font-mono text-sm">{log.patient.mrn}</td>
                              <td className="px-4 py-3 font-medium">{log.patient.name}</td>
                              <td className="px-4 py-3">{log.resource_type}</td>
                              <td className="px-4 py-3">{getStatusBadge(log.sync_status)}</td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(log.updated_at).toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 py-3 max-w-xs truncate" title={log.error_message || ''}>
                                {log.error_message || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'patients' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold">Pasien Tersedia untuk Sync</h2>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={availablePatientsData?.data?.length > 0 && selectedPatients.length === availablePatientsData.data.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded"
                        />
                        Pilih Semua
                      </label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPatients.length} dipilih
                      </span>
                    </div>
                  </div>

                  {patientsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                              <input
                                type="checkbox"
                                checked={availablePatientsData?.data?.length > 0 && selectedPatients.length === availablePatientsData.data.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="rounded"
                              />
                            </th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">MRN</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tanggal Lahir</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Jenis Kelamin</th>
                            <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-800 dark:text-gray-200">
                          {currentData?.map((patient: Patient) => (
                            <tr key={patient.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedPatients.includes(patient.id)}
                                  onChange={(e) => handlePatientSelect(patient.id, e.target.checked)}
                                  className="rounded"
                                />
                              </td>
                              <td className="px-4 py-3 font-mono text-sm">{patient.mrn}</td>
                              <td className="px-4 py-3 font-medium">{patient.name}</td>
                              <td className="px-4 py-3">
                                {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('id-ID') : '-'}
                              </td>
                              <td className="px-4 py-3">{patient.gender || '-'}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => syncPatientMutation.mutate(patient.id)}
                                  disabled={syncPatientMutation.isPending}
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1 disabled:opacity-50"
                                >
                                  <FaUpload className="text-xs" />
                                  Sync
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
