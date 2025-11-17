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
  MdSearch
} from 'react-icons/md'
import { DataTable } from '@/components/ui/data-table'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface AuditLog {
  id: number
  timestamp: string
  action: string
  user: string
  details: string
  ipAddress: string
  status: 'success' | 'warning' | 'error' | 'info'
  module: string
  old_values?: any
  new_values?: any
  user_agent?: string
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

export default function AuditLogsPage() {
  // State
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [ipFilter, setIpFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Modals
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteDays, setDeleteDays] = useState(30)

  // Expanded states
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set())

  // Stats and options
  const [stats, setStats] = useState<StatsData | null>(null)
  const [users, setUsers] = useState<string[]>([])
  const [modules, setModules] = useState<{value: string, label: string}[]>([])

  // Fetch data
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        search: searchTerm,
        user: userFilter === 'all' ? '' : userFilter,
        module: moduleFilter === 'all' ? '' : moduleFilter,
        ip_address: ipFilter,
        date_from: dateFrom,
        date_to: dateTo
      })

      const response = await api.get(`/api/audit/logs?${params}`)
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
      toast.error('Failed to load audit logs')
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
      const [usersRes, modulesRes] = await Promise.all([
        api.get('/api/audit/users'),
        api.get('/api/audit/modules')
      ])

      const usersResult = usersRes.data
      const modulesResult = modulesRes.data

      if (usersResult.success) setUsers(usersResult.data)
      if (modulesResult.success) setModules(modulesResult.data)
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
  }, [searchTerm, userFilter, moduleFilter, ipFilter, dateFrom, dateTo])

  // Page change
  const handlePageChange = (page: number) => {
    fetchLogs(page)
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setUserFilter('all')
    setModuleFilter('all')
    setIpFilter('')
    setDateFrom('')
    setDateTo('')
  }

  // View log details
  const viewLogDetails = async (logId: number) => {
    try {
      const response = await api.get(`/api/audit/logs/${logId}`)
      const result = response.data

      if (result.success) {
        setSelectedLog(result.data)
        setShowDetailModal(true)
      }
    } catch (error) {
      console.error('Error fetching log details:', error)
      toast.error('Failed to load log details')
    }
  }

  // Export logs
  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        date_from: dateFrom,
        date_to: dateTo,
        module: moduleFilter === 'all' ? '' : moduleFilter
      })

      const response = await api.get(`/api/audit/export?${params}`)
      const result = response.data

      if (result.success) {
        const link = document.createElement('a')
        link.href = `data:${result.data.mime_type};base64,${result.data.content}`
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Export completed successfully')
      } else {
        toast.error(result.message || 'Export failed')
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Failed to export logs')
    }
  }

  // Delete old logs
  const deleteOldLogs = async () => {
    try {
      const response = await api.delete('/api/audit/logs/cleanup', {
        days: deleteDays
      })

      const result = response.data

      if (result.success) {
        toast.success(result.message)
        setShowDeleteModal(false)
        fetchLogs()
        fetchStats()
      } else {
        toast.error(result.message || 'Failed to delete old logs')
      }
    } catch (error) {
      console.error('Error deleting old logs:', error)
      toast.error('Failed to delete old logs')
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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('login')) {
      return 'bg-green-100 text-green-800'
    }
    if (action.toLowerCase().includes('update')) {
      return 'bg-blue-100 text-blue-800'
    }
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('logout')) {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Audit Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system activities and user actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdDeleteForever className="text-lg" />
            Clean Up
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLogs('csv')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdDownload className="text-lg" />
              CSV
            </button>
            <button
              onClick={() => exportLogs('json')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdDownload className="text-lg" />
              JSON
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.recent_users.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

          {/* User Filter */}
          <div className="w-full lg:w-48">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by user"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div className="w-full lg:w-48">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by module"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module.value} value={module.value}>
                  {module.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="w-full lg:w-32">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Start date"
            />
          </div>

          {/* Date To */}
          <div className="w-full lg:w-32">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="End date"
            />
          </div>

          {/* IP Filter */}
          <div className="w-full lg:w-32">
            <input
              type="text"
              placeholder="IP Address"
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by IP address"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <MdList className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium">
                    {log.user.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{log.module}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {format(parseISO(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>

                    <p className="text-gray-900 dark:text-white font-medium mb-2">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>User: <span className="font-medium text-blue-600 dark:text-blue-400">{log.user}</span></span>
                      <span>IP: {log.ipAddress}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => viewLogDetails(log.id)}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <MdVisibility className="text-lg" />
                        View Details
                      </button>
                      <button
                        onClick={() => toggleExpanded(log.id)}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {expandedLogs.has(log.id) ? (
                          <>
                            <MdExpandLess className="text-lg" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <MdExpandMore className="text-lg" />
                            Show More
                          </>
                        )}
                      </button>
                    </div>

                    {expandedLogs.has(log.id) && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                        {(log.old_values || log.new_values) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {log.old_values && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Previous Values</h4>
                                <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-800 dark:text-red-200 overflow-x-auto">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">New Values</h4>
                                <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded text-green-800 dark:text-green-200 overflow-x-auto">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                        {log.user_agent && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">User Agent</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{log.user_agent}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && !loading && logs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
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
            <span className="text-sm">
              Page {pagination.current_page} of {pagination.last_page}
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Audit Log Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Action</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">User</h3>
                  <p className="text-gray-900 dark:text-white">{selectedLog.user}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Module</h3>
                  <p className="text-gray-900 dark:text-white">{selectedLog.module}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">IP Address</h3>
                  <p className="text-gray-900 dark:text-white font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Timestamp</h3>
                  <p className="text-gray-900 dark:text-white">
                    {format(parseISO(selectedLog.timestamp), 'PPP pp')}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Details</h3>
                <p className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-900 dark:text-white">
                  {selectedLog.details}
                </p>
              </div>

              {(selectedLog.old_values || selectedLog.new_values) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Data Changes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLog.old_values && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Previous Values</h4>
                        <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-x-auto text-red-800 dark:text-red-200">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.new_values && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">New Values</h4>
                        <pre className="text-xs bg-green-50 dark:bg-green-900/20 p-3 rounded overflow-x-auto text-green-800 dark:text-green-200">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
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
                Close
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Clean Up Old Logs</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will permanently delete audit logs older than the specified number of days.
                This action cannot be undone.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delete logs older than:
                </label>
                <select
                  value={deleteDays}
                  onChange={(e) => setDeleteDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteOldLogs}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
