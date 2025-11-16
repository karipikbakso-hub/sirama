'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MdSearch,
  MdDownload,
  MdRefresh,
  MdInfo,
  MdCheckCircle,
  MdSchedule,
  MdError,
  MdCloudUpload,
  MdStorage,
  MdSettings,
  MdPlayArrow,
  MdPause,
  MdDelete,
  MdAdd,
  MdRestore,
  MdSchedule as MdScheduleIcon,
  MdBackup,
  MdSecurity,
  MdTimer,
  MdCalendarToday,
  MdAccessTime,
  MdCompress,
  MdLock,
  MdLockOpen,
  MdTableChart,
  MdFolder,
  MdAssessment,
  MdHistory,
  MdCreate,
  MdTab
} from 'react-icons/md'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface BackupSchedule {
  id: number
  name: string
  description?: string
  backup_type: 'full' | 'incremental' | 'differential'
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  schedule_time: string
  schedule_config?: any
  is_active: boolean
  storage_path: string
  retention_days: number
  compress_backup: boolean
  encrypt_backup: boolean
  include_tables?: string[]
  exclude_tables?: string[]
  last_run_at?: string
  next_run_at?: string
  status: 'active' | 'paused' | 'disabled'
  notes?: string
  created_by: number
  created_at: string
  updated_at: string
  creator?: {
    name: string
    email: string
  }
}

interface BackupHistory {
  id: number
  backup_name: string
  filename: string
  backup_type: 'full' | 'incremental' | 'differential' | 'manual' | 'restore'
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  file_size_bytes?: number
  file_size_human?: string
  file_path?: string
  checksum?: string
  duration_seconds?: number
  started_at: string
  completed_at?: string
  error_message?: string
  backup_config?: any
  statistics?: any
  is_compressed: boolean
  is_encrypted: boolean
  storage_location: string
  schedule_id?: number
  created_by: number
  notes?: string
  created_at: string
  updated_at: string
  schedule?: BackupSchedule
  creator?: {
    name: string
    email: string
  }
}

interface BackupStatistics {
  total_schedules: number
  active_schedules: number
  total_backups: number
  successful_backups: number
  failed_backups: number
  running_backups: number
  total_backup_size: number
  total_backup_size_human: string
  average_backup_time: number
  average_backup_time_human?: string
  last_backup_date?: string
  next_scheduled_backup?: string
}

export default function BackupPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedules' | 'histories' | 'manual'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<BackupSchedule | null>(null)
  const [selectedHistory, setSelectedHistory] = useState<BackupHistory | null>(null)
  const [showCreateSchedule, setShowCreateSchedule] = useState(false)
  const [showCreateBackup, setShowCreateBackup] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<BackupHistory | null>(null)

  const queryClient = useQueryClient()

  // Fetch backup statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['backup-statistics'],
    queryFn: async () => {
      const response = await api.get('/api/backups/statistics')
      return response.data.data as BackupStatistics
    }
  })

  // Fetch backup schedules
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['backup-schedules'],
    queryFn: async () => {
      const response = await api.get('/api/backups/schedules')
      return response.data.data
    },
    enabled: activeTab === 'schedules'
  })

  // Fetch backup histories
  const { data: historiesData, isLoading: historiesLoading } = useQuery({
    queryKey: ['backup-histories'],
    queryFn: async () => {
      const response = await api.get('/api/backups/histories')
      return response.data.data
    },
    enabled: activeTab === 'histories'
  })

  // Create manual backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/backups/manual', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Backup manual berhasil dibuat!')
      queryClient.invalidateQueries({ queryKey: ['backup-histories'] })
      queryClient.invalidateQueries({ queryKey: ['backup-statistics'] })
      setShowCreateBackup(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat backup')
    }
  })

  // Restore backup mutation
  const restoreMutation = useMutation({
    mutationFn: async ({ history, notes }: { history: BackupHistory, notes: string }) => {
      const response = await api.post(`/api/backups/histories/${history.id}/restore`, {
        confirm_restore: true,
        restore_notes: notes
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Database berhasil direstore!')
      queryClient.invalidateQueries({ queryKey: ['backup-histories'] })
      setShowRestoreConfirm(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal restore database')
    }
  })

  const schedules = schedulesData?.data || []
  const histories = historiesData?.data || []

  const filteredHistories = histories.filter((history: BackupHistory) =>
    history.backup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle className="text-green-500 text-lg" />
      case 'running':
        return <MdSchedule className="text-yellow-500 text-lg" />
      case 'failed':
        return <MdError className="text-red-500 text-lg" />
      case 'cancelled':
        return <MdError className="text-gray-500 text-lg" />
      default:
        return <MdInfo className="text-gray-500 text-lg" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'running':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getBackupTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <MdStorage className="text-blue-500 text-lg" />
      case 'incremental':
        return <MdBackup className="text-green-500 text-lg" />
      case 'differential':
        return <MdBackup className="text-purple-500 text-lg" />
      case 'manual':
        return <MdCloudUpload className="text-orange-500 text-lg" />
      case 'restore':
        return <MdRestore className="text-indigo-500 text-lg" />
      default:
        return <MdStorage className="text-gray-500 text-lg" />
    }
  }

  const handleCreateManualBackup = (data: any) => {
    createBackupMutation.mutate(data)
  }

  const handleRestore = (history: BackupHistory, notes: string) => {
    restoreMutation.mutate({ history, notes })
  }

  const handleDownload = async (history: BackupHistory) => {
    try {
      const response = await api.get(`/api/backups/histories/${history.id}/download`)
      if (response.data.data?.download_url) {
        window.open(response.data.data.download_url, '_blank')
        toast.success('Download dimulai!')
      }
    } catch (error: any) {
      toast.error('Gagal mendownload backup')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: MdAssessment },
    { id: 'schedules', label: 'Jadwal Backup', icon: MdScheduleIcon },
    { id: 'histories', label: 'Riwayat Backup', icon: MdHistory },
    { id: 'manual', label: 'Backup Manual', icon: MdCreate }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Backup & Recovery
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola backup database dan sistem recovery
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['backup-statistics'] })
              if (activeTab === 'schedules') queryClient.invalidateQueries({ queryKey: ['backup-schedules'] })
              if (activeTab === 'histories') queryClient.invalidateQueries({ queryKey: ['backup-histories'] })
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className="text-lg" />
            Refresh
          </button>
          {activeTab === 'manual' && (
            <button
              onClick={() => setShowCreateBackup(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdCloudUpload className="text-lg" />
              Buat Backup
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <MdStorage className="text-blue-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Schedules</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {statsLoading ? '...' : stats?.total_schedules || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Active Schedules</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {statsLoading ? '...' : stats?.active_schedules || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <MdBackup className="text-purple-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Backups</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {statsLoading ? '...' : stats?.total_backups || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <MdTimer className="text-orange-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Avg Time</p>
                      <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                        {statsLoading ? '...' : stats?.average_backup_time_human || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {histories.slice(0, 5).map((history: BackupHistory) => (
                    <div key={history.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      {getBackupTypeIcon(history.backup_type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{history.backup_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(history.started_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(history.status)}`}>
                        {getStatusIcon(history.status)}
                        {history.status}
                      </span>
                    </div>
                  ))}
                  {histories.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No backup history available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="space-y-6">
              {schedulesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading schedules...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Run</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {schedules.map((schedule: BackupSchedule) => (
                        <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{schedule.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{schedule.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {schedule.backup_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {schedule.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {schedule.schedule_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${
                              schedule.is_active ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                              'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
                            }`}>
                              {schedule.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleString('id-ID') : 'Not scheduled'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedSchedule(schedule)}
                              className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MdInfo className="text-lg" />
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {schedules.length === 0 && (
                    <div className="text-center py-8">
                      <MdScheduleIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No backup schedules</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create your first backup schedule to get started.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Histories Tab */}
          {activeTab === 'histories' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Cari backup..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {historiesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading backup histories...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Backup</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredHistories.map((history: BackupHistory) => (
                        <tr key={history.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  {getBackupTypeIcon(history.backup_type)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{history.backup_name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{history.filename}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white capitalize">{history.backup_type}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(history.status)}`}>
                              {getStatusIcon(history.status)}
                              {history.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {history.file_size_human || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {history.duration_seconds ? `${Math.round(history.duration_seconds)}s` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(history.started_at).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedHistory(history)}
                                className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <MdInfo className="text-lg" />
                                Detail
                              </button>
                              {history.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => handleDownload(history)}
                                    className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    <MdDownload className="text-lg" />
                                    Download
                                  </button>
                                  <button
                                    onClick={() => setShowRestoreConfirm(history)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                                  >
                                    <MdRestore className="text-lg" />
                                    Restore
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHistories.length === 0 && (
                    <div className="text-center py-8">
                      <MdHistory className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No backup histories</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Backup histories will appear here after running backups.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Backup Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <MdCloudUpload className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Manual Backup</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Buat backup database secara manual sesuai kebutuhan Anda
                  </p>
                  <button
                    onClick={() => setShowCreateBackup(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <MdCreate className="text-lg" />
                    Buat Backup Sekarang
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <MdStorage className="text-blue-500 text-2xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Full Backup</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Backup seluruh database termasuk semua tabel dan data
                  </p>
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Buat Full Backup
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <MdBackup className="text-green-500 text-2xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Incremental</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Backup hanya data yang berubah sejak backup terakhir
                  </p>
                  <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                    Buat Incremental
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <MdBackup className="text-purple-500 text-2xl" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Differential</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Backup semua perubahan sejak full backup terakhir
                  </p>
                  <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                    Buat Differential
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detail Backup</h3>
              <button
                onClick={() => setSelectedHistory(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Backup Name</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedHistory.backup_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedHistory.backup_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedHistory.status)}`}>
                    {selectedHistory.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedHistory.file_size_human || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Started At</p>
                <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedHistory.started_at).toLocaleString('id-ID')}</p>
              </div>

              {selectedHistory.completed_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed At</p>
                  <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedHistory.completed_at).toLocaleString('id-ID')}</p>
                </div>
              )}

              {selectedHistory.checksum && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Checksum</p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">{selectedHistory.checksum}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedHistory(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              {selectedHistory.status === 'completed' && (
                <>
                  <button
                    onClick={() => handleDownload(selectedHistory)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setShowRestoreConfirm(selectedHistory)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Restore
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Modal */}
      {showCreateBackup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Manual Backup</h3>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdInfo className="text-blue-500 text-lg mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Backup Information</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Manual backup will save all current data. This process may take several minutes depending on database size.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backup Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="full">Full Backup</option>
                  <option value="incremental">Incremental Backup</option>
                  <option value="differential">Differential Backup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes for this backup..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateBackup(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateManualBackup({
                  backup_type: 'full',
                  compress_backup: true,
                  encrypt_backup: false,
                  notes: 'Manual backup created from dashboard'
                })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <MdRestore className="text-orange-500 text-2xl" />
              <button
                onClick={() => setShowRestoreConfirm(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Database Restore</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Are you sure you want to restore the database from backup "{showRestoreConfirm.backup_name}"?
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdError className="text-red-500 text-lg mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Warning</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      This action will overwrite all current data. Make sure you have a recent backup before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Restore Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes for this restore operation..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRestoreConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRestore(showRestoreConfirm, 'Restore from dashboard')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
