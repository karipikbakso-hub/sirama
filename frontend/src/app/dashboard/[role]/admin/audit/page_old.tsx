'use client'

import React, { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import {
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdDeleteForever,
  MdList,
  MdViewList,
  MdSearch,
  MdFileDownload
} from 'react-icons/md'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface AuditLog {
  id: number
  user_id?: number
  action: string
  resource: string
  resource_id?: number
  ip_address: string
  user_agent?: string
  payload?: any
  created_at: string
  user?: {
    id: number
    name: string
  }
}

interface StatsData {
  total_logs: number
  today_logs: number
  week_logs: number
  month_logs: number
  by_level: Record<string, number>
  by_module: Record<string, number>
  recent_users: string[]
}

const ACTION_TYPES = ['login', 'logout', 'create', 'update', 'delete', 'view']
const RESOURCE_TYPES = ['users', 'patients', 'prescriptions', 'billings', 'appointments', 'laboratory', 'radiology']

export default function AuditLogsPage() {
  // State
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50, // Changed to 50 as per spec
    total: 0
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  // Modals
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteMonths, setDeleteMonths] = useState(6) // Default 6 months as per spec

  // Expanded states
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set())

  // Stats and options
  const [stats, setStats] = useState<StatsData | null>(null)
  const [users, setUsers] = useState<{id: number, name: string}[]>([])

  // Fetch data
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        search: searchTerm,
        user_id: userFilter,
        action: actionFilter,
        resource: resourceFilter,
        date_from: dateRange.from,
        date_to: dateRange.to
      })

      const response = await api.get(`/api/audit-logs?${params}`)
      const result = response.data

      if (result.success) {
        setLogs(result.data.data)
        setPagination({
          current_page: result.data.current_page,
          last_page: result.data.last_page,
          per_page: result.data.per_page,
          total: result.data.total
        })
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Gagal memuat audit logs')
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/audit/statistics')
      const result = response.data
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const usersRes = await api.get('/api/users')
      const usersResult = usersRes.data

      if (usersResult.success) setUsers(usersResult.data)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Initialize
  useEffect(() => {
    fetchStats()
    fetchFilterOptions()
    fetchLogs()
  }, [])

  // Debounced filter effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLogs(1)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, userFilter, actionFilter, resourceFilter, dateRange])

  // Page change
  const handlePageChange = (page: number) => {
    fetchLogs(page)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setUserFilter('')
    setActionFilter('')
    setResourceFilter('')
    setDateRange({ from: '', to: '' })
  }

  // View log details
  const viewLogDetails = async (logId: number) => {
    try {
      const response = await api.get(`/api/audit-logs/${logId}`)
      const result = response.data

      if (result.success) {
        setSelectedLog(result.data)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error fetching log details:', error)
      toast.error('Gagal memuat detail log')
    }
  }

  // Export logs
  const exportLogs = async (format: 'excel' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        format,
        user_id: userFilter,
        action: actionFilter,
        resource: resourceFilter,
        date_from: dateRange.from,
        date_to: dateRange.to
      })

      const response = await api.post('/api/audit-logs/export', params)
      const result = response.data

      if (result.success) {
        // Backend generates file and returns download URL
        const link = document.createElement('a')
        link.href = result.data.download_url
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Export berhasil')
      } else {
        toast.error(result.message || 'Export gagal')
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Gagal mengekspor logs')
    }
  }

  // Delete old logs
  const deleteOldLogs = async () => {
    try {
      const response = await api.delete('/api/audit-logs/cleanup', {
        data: { months: deleteMonths }
      })

      const result = response.data

      if (result.success) {
        toast.success(result.message)
        setShowDeleteModal(false)
        fetchLogs()
        fetchStats()
      } else {
        toast.error(result.message || 'Gagal menghapus logs lama')
      }
    } catch (error) {
      console.error('Error deleting old logs:', error)
      toast.error('Gagal menghapus logs lama')
    }
  }

  // Toggle expanded
  const toggleExpanded = (logId: number) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  // Helper functions
  const formatTimestamp = (timestamp: string) => {
    return format(parseISO(timestamp), 'dd/MM/yyyy HH:mm:ss') + ' WIB'
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'logout':
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'view':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      'users': 'Users',
      'patients': 'Patients',
      'prescriptions': 'Prescriptions',
      'billings': 'Billings',
      'appointments': 'Appointments',
      'laboratory': 'Laboratory',
      'radiology': 'Radiology'
    }
    return labels[resource] || resource.charAt(0).toUpperCase() + resource.slice(1)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Log Audit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor aktivitas pengguna dan sistem
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdDeleteForever className="text-lg" />
            Hapus Logs Lama
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLogs('excel')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdFileDownload className="text-lg" />
              Excel
            </button>
            <button
              onClick={() => exportLogs('pdf')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdFileDownload className="text-lg" />
              PDF
            </button>
          </div>

          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <MdList className="text-blue-500 text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_logs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <MdViewList className="text-green-500 text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.today_logs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <MdFilterList className="text-orange-500 text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minggu Ini</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.week_logs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <MdVisibility className="text-purple-500 text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.month_logs.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Cari username, action, resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Action</option>
              {ACTION_TYPES.map(action => (
                <option key={action} value={action}>{action.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Resource</option>
              {RESOURCE_TYPES.map(resource => (
                <option key={resource} value={resource}>{getResourceLabel(resource)}</option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="lg:col-span-2 xl:col-span-1">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Pilih rentang tanggal"
              className="w-full"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <MdList className="text-5xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Tidak ada audit logs ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-sm mr-3">
                            {(log.user?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.user?.name || 'System'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getResourceLabel(log.resource)}
                          {log.resource_id && (
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              (#{log.resource_id})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewLogDetails(log.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <MdVisibility className="text-lg" />
                          </button>
                          {log.payload && (
                            <button
                              onClick={() => toggleExpanded(log.id)}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                            >
                              {expandedLogs.has(log.id) ? (
                                <MdExpandLess className="text-lg" />
                              ) : (
                                <MdExpandMore className="text-lg" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedLogs.has(log.id) && log.payload && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                          <div className="text-sm">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payload Details:</h4>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && !loading && logs.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} sampai{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari{' '}
            {pagination.total} entries
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm px-3">
              Halaman {pagination.current_page} dari {pagination.last_page}
            </span>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detail Audit Log</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">User</h3>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedLog.user?.name || 'System'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Action</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Resource</h3>
                  <p className="text-gray-900 dark:text-white">
                    {getResourceLabel(selectedLog.resource)}
                    {selectedLog.resource_id && ` (ID: ${selectedLog.resource_id})`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">IP Address</h3>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedLog.ip_address}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Timestamp</h3>
                  <p className="text-gray-900 dark:text-white">{formatTimestamp(selectedLog.created_at)}</p>
                </div>
              </div>

              {selectedLog.payload && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Payload</h3>
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto text-gray-800 dark:text-gray-200">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">User Agent</h3>
                  <p className="text-xs font-mono p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-300 break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MdDeleteForever className="text-red-500 text-2xl" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hapus Logs Lama</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Aksi ini akan menghapus permanen audit logs yang lebih lama dari jumlah bulan yang dipilih.
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hapus logs yang lebih lama dari:
                </label>
                <select
                  value={deleteMonths}
                  onChange={(e) => setDeleteMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={1}>1 bulan</option>
                  <option value={3}>3 bulan</option>
                  <option value={6}>6 bulan</option>
                  <option value={12}>1 tahun</option>
                  <option value={24}>2 tahun</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={deleteOldLogs}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Hapus Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
