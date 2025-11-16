'use client'

import { useState, useEffect } from 'react'
import {
  MdSearch,
  MdClear,
  MdPerson,
  MdAccessTime,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWarning,
  MdRefresh,
  MdFilterList,
  MdExpandMore,
  MdExpandLess,
  MdSecurity,
  MdDelete,
  MdDownload,
  MdVisibility,
  MdDateRange,
  MdPersonOutline,
  MdSettings,
  MdDeleteForever
} from 'react-icons/md'

interface AuditLog {
  id: string
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

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteDays, setDeleteDays] = useState(30)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audit/logs', {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const result = await response.json()
      if (result.success) {
        setAuditLogs(result.data.data)
      } else {
        throw new Error(result.message || 'Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      alert('Gagal memuat audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="text-green-500 text-lg" />
      case 'warning':
        return <MdWarning className="text-yellow-500 text-lg" />
      case 'error':
        return <MdError className="text-red-500 text-lg" />
      default:
        return <MdInfo className="text-blue-500 text-lg" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    }
  }

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'authentication':
        return <MdSecurity className="text-orange-500 text-lg" />
      case 'emr':
        return <MdPerson className="text-blue-500 text-lg" />
      case 'security':
        return <MdError className="text-red-500 text-lg" />
      case 'system':
        return <MdRefresh className="text-gray-500 text-lg" />
      default:
        return <MdInfo className="text-gray-500 text-lg" />
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus
    const matchesModule = filterModule === 'all' || log.module === filterModule

    return matchesSearch && matchesStatus && matchesModule
  })

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterModule('all')
  }

  const uniqueModules = Array.from(new Set(auditLogs.map(log => log.module)))

  const viewLogDetails = async (logId: string) => {
    try {
      const response = await fetch(`/api/audit/logs/${logId}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch log details')
      }

      const result = await response.json()
      if (result.success) {
        setSelectedLog(result.data)
        setShowDetailModal(true)
      } else {
        throw new Error(result.message || 'Failed to fetch log details')
      }
    } catch (error) {
      console.error('Error fetching log details:', error)
      alert('Gagal memuat detail log')
    }
  }

  const deleteOldLogs = async () => {
    try {
      const response = await fetch('/api/audit/logs/cleanup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ days: deleteDays })
      })

      if (!response.ok) {
        throw new Error('Failed to delete old logs')
      }

      const result = await response.json()
      if (result.success) {
        alert(result.message)
        setShowDeleteModal(false)
        fetchAuditLogs() // Refresh the list
      } else {
        throw new Error(result.message || 'Failed to delete old logs')
      }
    } catch (error) {
      console.error('Error deleting old logs:', error)
      alert('Gagal menghapus log lama')
    }
  }

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/audit/export?format=${format}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to export logs')
      }

      const result = await response.json()
      if (result.success) {
        // Create download link
        const link = document.createElement('a')
        link.href = `data:${result.data.mime_type};base64,${result.data.content}`
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        alert('Export berhasil')
      } else {
        throw new Error(result.message || 'Failed to export logs')
      }
    } catch (error) {
      console.error('Error exporting logs:', error)
      alert('Gagal mengekspor log')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
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
            Hapus Log Lama
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLogs('csv')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdDownload className="text-lg" />
              Export CSV
            </button>
            <button
              onClick={() => exportLogs('json')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdDownload className="text-lg" />
              Export JSON
            </button>
          </div>
          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

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

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Module Filter */}
          <div className="w-full lg:w-48">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by module"
            >
              <option value="all">All Modules</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
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
      </div>

      {/* Audit Logs List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center">
            <MdSecurity className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(log.status)}
                    </div>

                    {/* Log Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {log.status.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {getModuleIcon(log.module)}
                          <span>{log.module}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>

                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        {log.action}
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {log.details}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>User: <span className="font-medium text-blue-600 dark:text-blue-400">{log.user}</span></span>
                        <span>IP: {log.ipAddress}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => viewLogDetails(log.id)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <MdVisibility className="text-lg" />
                          Lihat Detail
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
                              Show Details
                            </>
                          )}
                        </button>
                      </div>

                      {/* Expandable Details */}
                      {expandedLogs.has(log.id) && (
                        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white mb-1">Action Details</p>
                              <p className="text-gray-600 dark:text-gray-400">{log.details}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white mb-1">Technical Info</p>
                              <p className="text-gray-600 dark:text-gray-400">IP: {log.ipAddress}</p>
                              <p className="text-gray-600 dark:text-gray-400">Module: {log.module}</p>
                              <p className="text-gray-600 dark:text-gray-400">Timestamp: {log.timestamp}</p>
                              {log.user_agent && (
                                <p className="text-gray-600 dark:text-gray-400">User Agent: {log.user_agent}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdCheckCircle className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {auditLogs.filter(log => log.status === 'success').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdWarning className="text-yellow-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {auditLogs.filter(log => log.status === 'warning').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdError className="text-red-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {auditLogs.filter(log => log.status === 'error').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdInfo className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Info</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {auditLogs.filter(log => log.status === 'info').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detail Audit Log</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close detail modal"
                >
                  <MdClear className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Dasar</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedLog.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Action</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedLog.action}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User</p>
                      <p className="text-gray-900 dark:text-white">{selectedLog.user}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Module</p>
                      <p className="text-gray-900 dark:text-white">{selectedLog.module}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Teknis</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timestamp</p>
                      <p className="text-gray-900 dark:text-white">{selectedLog.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IP Address</p>
                      <p className="text-gray-900 dark:text-white">{selectedLog.ipAddress}</p>
                    </div>
                    {selectedLog.user_agent && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Agent</p>
                        <p className="text-gray-900 dark:text-white text-sm break-all">{selectedLog.user_agent}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Aktivitas</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedLog.details}</p>
                </div>
              </div>

              {/* Old/New Values */}
              {(selectedLog.old_values || selectedLog.new_values) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedLog.old_values && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nilai Lama</h3>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <pre className="text-red-800 dark:text-red-200 text-sm whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLog.new_values && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nilai Baru</h3>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <pre className="text-green-800 dark:text-green-200 text-sm whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MdDeleteForever className="text-red-500 text-2xl" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hapus Log Lama</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Apakah Anda yakin ingin menghapus audit logs yang lebih lama dari jumlah hari yang ditentukan?
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hapus logs yang lebih lama dari:
                </label>
                <select
                  value={deleteDays}
                  onChange={(e) => setDeleteDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-label="Select number of days for log deletion"
                >
                  <option value={7}>7 hari</option>
                  <option value={30}>30 hari</option>
                  <option value={60}>60 hari</option>
                  <option value={90}>90 hari</option>
                  <option value={180}>180 hari</option>
                  <option value={365}>1 tahun</option>
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
