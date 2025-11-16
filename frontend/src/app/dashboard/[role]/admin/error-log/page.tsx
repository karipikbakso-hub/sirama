'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from '@/lib/toast'
import {
  MdError,
  MdWarning,
  MdInfo,
  MdRefresh,
  MdSearch,
  MdFilterList,
  MdClear,
  MdExpandMore,
  MdExpandLess,
  MdBugReport,
  MdSystemUpdate,
  MdNetworkCheck,
  MdStorage,
  MdCode,
  MdSecurity,
  MdAssessment,
  MdHistory,
  MdQueue,
  MdPlayArrow,
  MdDelete,
  MdDownload,
  MdCheckCircle,
  MdSchedule,
  MdReplay,
  MdCleaningServices,
  MdFileDownload,
  MdTab
} from 'react-icons/md'
import api from '@/lib/api'

interface SystemLog {
  id: number
  level: 'emergency' | 'alert' | 'critical' | 'error' | 'warning' | 'notice' | 'info' | 'debug'
  level_name: string
  message: string
  context?: any
  channel: string
  extra?: any
  logger_name?: string
  logged_at: string
  file?: string
  line?: number
  function?: string
  class?: string
  user_id?: number
  ip_address?: string
  user_agent?: string
  request_method?: string
  request_url?: string
  request_data?: any
  session_id?: string
  resolved: boolean
  resolved_at?: string
  resolved_by?: number
  resolution_notes?: string
  created_at: string
  updated_at: string
  user?: {
    name: string
    email: string
  }
  resolver?: {
    name: string
    email: string
  }
}

interface FailedJob {
  id: number
  uuid: string
  connection: string
  queue: string
  payload: any
  exception: string
  failed_at: string
  job_class: string
  job_data: any
}

interface ErrorStatistics {
  system_logs: {
    total: number
    today: number
    unresolved: number
    by_level: {
      emergency: number
      alert: number
      critical: number
      error: number
      warning: number
      notice: number
      info: number
      debug: number
    }
  }
  failed_jobs: {
    total: number
    today: number
    by_queue: Record<string, number>
  }
  recent_activity: {
    latest_logs: SystemLog[]
    latest_failed_jobs: any[]
  }
}

export default function ErrorLogPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'system-logs' | 'failed-jobs'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterResolved, setFilterResolved] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)
  const [showResolveModal, setShowResolveModal] = useState<SystemLog | null>(null)
  const [showBulkResolve, setShowBulkResolve] = useState(false)
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const [showRetryJob, setShowRetryJob] = useState<FailedJob | null>(null)

  const queryClient = useQueryClient()

  // Fetch error statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['error-statistics'],
    queryFn: async () => {
      const response = await api.get('/api/error-monitoring/statistics')
      return response.data.data as ErrorStatistics
    }
  })

  // Fetch system logs
  const { data: systemLogsData, isLoading: systemLogsLoading } = useQuery({
    queryKey: ['system-logs', { level: filterLevel, channel: filterChannel, resolved: filterResolved, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterLevel !== 'all') params.append('level', filterLevel)
      if (filterChannel !== 'all') params.append('channel', filterChannel)
      if (filterResolved !== 'all') params.append('resolved', filterResolved)
      if (searchTerm) params.append('search', searchTerm)

      const response = await api.get(`/api/error-monitoring/system-logs?${params}`)
      return response.data.data
    },
    enabled: activeTab === 'system-logs'
  })

  // Fetch failed jobs
  const { data: failedJobsData, isLoading: failedJobsLoading } = useQuery({
    queryKey: ['failed-jobs'],
    queryFn: async () => {
      const response = await api.get('/api/error-monitoring/failed-jobs')
      return response.data.data
    },
    enabled: activeTab === 'failed-jobs'
  })

  // Resolve system log mutation
  const resolveLogMutation = useMutation({
    mutationFn: async ({ log, notes }: { log: SystemLog, notes: string }) => {
      const response = await api.put(`/api/error-monitoring/system-logs/${log.id}/resolve`, {
        resolution_notes: notes
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Log berhasil ditandai sebagai resolved!')
      queryClient.invalidateQueries({ queryKey: ['system-logs'] })
      queryClient.invalidateQueries({ queryKey: ['error-statistics'] })
      setShowResolveModal(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal resolve log')
    }
  })

  // Retry failed job mutation
  const retryJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await api.post(`/api/error-monitoring/failed-jobs/${jobId}/retry`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Job berhasil di-queue untuk retry!')
      queryClient.invalidateQueries({ queryKey: ['failed-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['error-statistics'] })
      setShowRetryJob(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal retry job')
    }
  })

  // Delete failed job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await api.delete(`/api/error-monitoring/failed-jobs/${jobId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Failed job berhasil dihapus!')
      queryClient.invalidateQueries({ queryKey: ['failed-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['error-statistics'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal hapus failed job')
    }
  })

  const systemLogs = systemLogsData?.data || []
  const failedJobs = failedJobsData?.data || []

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'emergency':
      case 'alert':
      case 'critical':
      case 'error':
        return <MdError className="text-red-500 text-lg" />
      case 'warning':
        return <MdWarning className="text-yellow-500 text-lg" />
      case 'notice':
      case 'info':
        return <MdInfo className="text-blue-500 text-lg" />
      case 'debug':
        return <MdBugReport className="text-gray-500 text-lg" />
      default:
        return <MdInfo className="text-gray-500 text-lg" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'emergency':
      case 'alert':
      case 'critical':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'notice':
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'database':
        return <MdStorage className="text-purple-500 text-lg" />
      case 'api':
        return <MdCode className="text-green-500 text-lg" />
      case 'authentication':
        return <MdSecurity className="text-orange-500 text-lg" />
      case 'queue':
        return <MdQueue className="text-indigo-500 text-lg" />
      default:
        return <MdBugReport className="text-gray-500 text-lg" />
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterLevel('all')
    setFilterChannel('all')
    setFilterResolved('all')
  }

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: MdAssessment },
    { id: 'system-logs', label: 'System Logs', icon: MdHistory },
    { id: 'failed-jobs', label: 'Failed Jobs', icon: MdQueue }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            System Error Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage system errors and warnings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['error-statistics'] })
              if (activeTab === 'system-logs') queryClient.invalidateQueries({ queryKey: ['system-logs'] })
              if (activeTab === 'failed-jobs') queryClient.invalidateQueries({ queryKey: ['failed-jobs'] })
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className="text-lg" />
            Refresh
          </button>
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
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <MdError className="text-red-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">System Errors</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {statsLoading ? '...' : (stats?.system_logs.by_level.error || 0) + (stats?.system_logs.by_level.critical || 0) + (stats?.system_logs.by_level.emergency || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <MdWarning className="text-orange-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Failed Jobs</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {statsLoading ? '...' : stats?.failed_jobs.total || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <MdWarning className="text-yellow-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                        {statsLoading ? '...' : stats?.system_logs.by_level.warning || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-green-600 text-2xl" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Resolved</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {statsLoading ? '...' : stats?.system_logs.unresolved || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent System Logs</h3>
                <div className="space-y-3">
                  {stats?.recent_activity.latest_logs.slice(0, 5).map((log: SystemLog) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      {getLevelIcon(log.level)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{log.message.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.logged_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </div>
                  ))}
                  {(!stats?.recent_activity.latest_logs || stats.recent_activity.latest_logs.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent system logs</p>
                  )}
                </div>
              </div>

              {/* Failed Jobs Activity */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Failed Jobs</h3>
                <div className="space-y-3">
                  {stats?.recent_activity.latest_failed_jobs.slice(0, 5).map((job: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <MdQueue className="text-orange-500 text-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{job.exception?.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(job.failed_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                        Failed
                      </span>
                    </div>
                  ))}
                  {(!stats?.recent_activity.latest_failed_jobs || stats.recent_activity.latest_failed_jobs.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent failed jobs</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === 'system-logs' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Level Filter */}
                <div className="w-full lg:w-48">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="emergency">Emergency</option>
                    <option value="alert">Alert</option>
                    <option value="critical">Critical</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="notice">Notice</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                {/* Channel Filter */}
                <div className="w-full lg:w-48">
                  <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Channels</option>
                    <option value="default">Default</option>
                    <option value="database">Database</option>
                    <option value="api">API</option>
                    <option value="authentication">Authentication</option>
                  </select>
                </div>

                {/* Resolved Filter */}
                <div className="w-full lg:w-48">
                  <select
                    value={filterResolved}
                    onChange={(e) => setFilterResolved(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="false">Unresolved</option>
                    <option value="true">Resolved</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <MdClear className="text-lg" />
                  Clear
                </button>
              </div>

              {systemLogsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading system logs...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Log</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {systemLogs.map((log: SystemLog) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  {getLevelIcon(log.level)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                  {log.message.length > 100 ? `${log.message.substring(0, 100)}...` : log.message}
                                </div>
                                {log.file && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {log.file}:{log.line}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                              {getLevelIcon(log.level)}
                              {log.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {log.channel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {log.user?.name || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(log.logged_at).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${
                              log.resolved ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                              'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                            }`}>
                              {log.resolved ? 'Resolved' : 'Unresolved'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedLog(log)}
                                className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <MdInfo className="text-lg" />
                                Detail
                              </button>
                              {!log.resolved && (
                                <button
                                  onClick={() => setShowResolveModal(log)}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                >
                                  <MdCheckCircle className="text-lg" />
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {systemLogs.length === 0 && (
                    <div className="text-center py-8">
                      <MdHistory className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No system logs</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">System logs will appear here when errors occur.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Failed Jobs Tab */}
          {activeTab === 'failed-jobs' && (
            <div className="space-y-6">
              {failedJobsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading failed jobs...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Queue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Failed At</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exception</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {failedJobs.map((job: FailedJob) => (
                        <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <MdQueue className="text-orange-500 text-lg" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{job.job_class}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">ID: {job.uuid}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {job.queue}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(job.failed_at).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {job.exception.length > 100 ? `${job.exception.substring(0, 100)}...` : job.exception}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setShowRetryJob(job)}
                                className="inline-flex items-center gap-1 px-3 py-1 border border-blue-300 dark:border-blue-600 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <MdReplay className="text-lg" />
                                Retry
                              </button>
                              <button
                                onClick={() => deleteJobMutation.mutate(job.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                              >
                                <MdDelete className="text-lg" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {failedJobs.length === 0 && (
                    <div className="text-center py-8">
                      <MdQueue className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No failed jobs</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Failed jobs will appear here when queue processing fails.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getLevelColor(selectedLog.level)}`}>
                    {getLevelIcon(selectedLog.level)}
                    {selectedLog.level_name}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Channel</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">{selectedLog.channel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Logged At</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{new Date(selectedLog.logged_at).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border mt-1 ${
                    selectedLog.resolved ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                  }`}>
                    {selectedLog.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Message</p>
                <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">{selectedLog.message}</p>
              </div>

              {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Context</p>
                  <pre className="text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.extra && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Stack Trace</p>
                  <pre className="text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto max-h-60">
                    {selectedLog.extra.exception || selectedLog.extra.trace || 'No stack trace available'}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {selectedLog.user_id && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedLog.user?.name} ({selectedLog.user?.email})</p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedLog.ip_address}</p>
                  </div>
                )}
                {selectedLog.file && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">File</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedLog.file}:{selectedLog.line}</p>
                  </div>
                )}
                {selectedLog.function && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Function</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedLog.class}::{selectedLog.function}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              {!selectedLog.resolved && (
                <button
                  onClick={() => setShowResolveModal(selectedLog)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <MdCheckCircle className="text-green-500 text-2xl" />
              <button
                onClick={() => setShowResolveModal(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolve System Log</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Mark this log as resolved and add resolution notes.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resolution Notes</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe how this issue was resolved..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveLogMutation.mutate({ log: showResolveModal, notes: 'Resolved via dashboard' })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Resolve Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retry Job Modal */}
      {showRetryJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <MdReplay className="text-blue-500 text-2xl" />
              <button
                onClick={() => setShowRetryJob(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MdInfo className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Retry Failed Job</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Are you sure you want to retry this failed job? It will be re-queued for processing.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdQueue className="text-blue-500 text-lg mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Job Details</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      <strong>Class:</strong> {showRetryJob.job_class}<br/>
                      <strong>Queue:</strong> {showRetryJob.queue}<br/>
                      <strong>Failed:</strong> {new Date(showRetryJob.failed_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRetryJob(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => retryJobMutation.mutate(showRetryJob.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Retry Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
