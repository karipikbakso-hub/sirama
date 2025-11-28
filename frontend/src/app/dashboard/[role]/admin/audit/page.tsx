'use client'

import React, { useState, useEffect } from 'react'
import {
  MdVisibility,
  MdDownload,
  MdRefresh,
  MdDeleteForever,
  MdSearch,
  MdFilterList,
  MdList,
  MdViewList,
  MdArrowUpward,
  MdArrowDownward,
  MdError,
  MdInfo,
  MdWarning
} from 'react-icons/md'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface AuditLog {
  id: number
  user_id: number | null
  action: string
  resource: string | null
  resource_id: number | null
  ip_address: string | null
  user_agent: string | null
  payload: string | null
  created_at: string
  timestamp_formatted: string
  user_name: string
}

interface StatsData {
  total_logs: number
  today_logs: number
  week_logs: number
  month_logs: number
  by_action: Record<string, number>
  by_resource: Record<string, number>
  recent_users: string[]
}

export default function AuditLogsPage() {
  // State
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50, // As per spec: 50 items/page
    total: 0
  })

  // Filters
   const [searchTerm, setSearchTerm] = useState('')
   const [userIdFilter, setUserIdFilter] = useState('')
   const [actionFilter, setActionFilter] = useState('')
   const [resourceFilter, setResourceFilter] = useState('')
   const [dateFrom, setDateFrom] = useState('')
   const [dateTo, setDateTo] = useState('')

   // Sorting
   const [sortBy, setSortBy] = useState('created_at')
   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

   // Dropdown options
   const [users, setUsers] = useState<{value: string, label: string}[]>([])
   const [actions, setActions] = useState<{value: string, label: string}[]>([])
   const [resources, setResources] = useState<{value: string, label: string}[]>([])

  // Modals
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteDays, setDeleteDays] = useState(180) // Default 6 months as per spec

  // Stats
  const [stats, setStats] = useState<StatsData | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [filtersLoading, setFiltersLoading] = useState(true)

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
    fetchLogs(1) // Reset to first page when sorting
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchLogs(page)
  }

  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      setFiltersLoading(true)
      const [usersRes, actionsRes, resourcesRes] = await Promise.allSettled([
        api.get('/api/audit-logs/users'),
        api.get('/api/audit-logs/actions'),
        api.get('/api/audit-logs/resources')
      ])

      // Handle users response
      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
        setUsers(usersRes.value.data.data)
      } else {
        console.warn('Failed to load users for filter')
        // Only set fallback if it's not a 404 error
        if (usersRes.status === 'rejected' && usersRes.reason?.response?.status !== 404) {
          setUsers([]) // Set empty array as fallback
        }
      }
      
      // Handle actions response
      if (actionsRes.status === 'fulfilled' && actionsRes.value.data.success) {
        setActions(actionsRes.value.data.data)
      } else {
        console.warn('Failed to load actions for filter')
        // Only set fallback if it's not a 404 error
        if (actionsRes.status === 'rejected' && actionsRes.reason?.response?.status !== 404) {
          setActions([
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
            { value: 'view', label: 'View' },
            { value: 'login', label: 'Login' },
            { value: 'logout', label: 'Logout' }
          ]) // Set default actions as fallback
        }
      }
      
      // Handle resources response
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value.data.success) {
        setResources(resourcesRes.value.data.data)
      } else {
        console.warn('Failed to load resources for filter')
        // Only set fallback if it's not a 404 error
        if (resourcesRes.status === 'rejected' && resourcesRes.reason?.response?.status !== 404) {
          setResources([
            { value: 'users', label: 'Users' },
            { value: 'patients', label: 'Patients' },
            { value: 'prescriptions', label: 'Prescriptions' },
            { value: 'billings', label: 'Billings' }
          ]) // Set default resources as fallback
        }
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
      toast.error('Gagal memuat opsi filter')
    } finally {
      setFiltersLoading(false)
    }
  }

  // Fetch data
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        search: searchTerm,
        user_id: userIdFilter,
        action: actionFilter,
        resource: resourceFilter,
        date_from: dateFrom,
        date_to: dateTo,
        sort_by: sortBy,
        sort_direction: sortDirection
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
      } else {
        setError(result.message || 'Gagal memuat data audit log')
        toast.error(result.message || 'Gagal memuat data audit log')
        // Set empty logs as fallback
        setLogs([])
      }
    } catch (error: any) {
      console.error('Error fetching audit logs:', error)
      // Only show error message if it's not a 404
      if (error.response?.status !== 404) {
        setError(error.response?.data?.message || 'Terjadi kesalahan saat memuat data')
        toast.error('Gagal memuat audit logs')
      }
      // Set empty logs as fallback
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await api.get('/api/audit-logs/statistics')
      const result = response.data
      
      if (result.success) {
        setStats(result.data)
      } else {
        console.warn('Failed to load statistics:', result.message)
        setStats(null)
      }
    } catch (error: any) {
      // Handle 404 specifically
      if (error.response?.status === 404) {
        console.warn('Statistics endpoint not found (404)')
      } else {
        console.error('Error fetching stats:', error)
      }
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }

  // View log details
  const viewLogDetails = async (logId: number) => {
    try {
      const response = await api.get(`/api/audit-logs/${logId}`)
      const result = response.data

      if (result.success) {
        setSelectedLog(result.data)
        setShowDetailModal(true)
      } else {
        toast.error(result.message || 'Gagal memuat detail log')
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching log details:', error)
        toast.error('Gagal memuat detail log')
      }
    }
  }

  // Export logs
  const exportLogs = async (format: 'excel' | 'pdf') => {
    if (loading) return;
    
    try {
      const params = new URLSearchParams({
        format,
        user_id: userIdFilter,
        action: actionFilter,
        resource: resourceFilter,
        date_from: dateFrom,
        date_to: dateTo
      })

      const response = await api.post(`/api/audit-logs/export`, Object.fromEntries(params))
      const result = response.data

      if (result.success) {
        const link = document.createElement('a')
        link.href = `data:${result.data.mime_type};base64,${result.data.content}`
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('Ekspor berhasil')
      } else {
        toast.error(result.message || 'Ekspor gagal')
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error exporting logs:', error)
        toast.error('Gagal mengekspor logs')
      }
    }
  }

  // Delete old logs
  const deleteOldLogs = async () => {
    if (loading) return;
    
    try {
      const response = await api.delete('/api/audit-logs/cleanup', {
        data: { days: deleteDays }
      })

      const result = response.data

      if (result.success) {
        toast.success(result.message)
        setShowDeleteModal(false)
        fetchLogs()
        fetchStats()
      } else {
        toast.error(result.message || 'Gagal menghapus log lama')
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error deleting old logs:', error)
        toast.error('Gagal menghapus log lama')
      }
    }
  }

  // Helper functions
  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower === 'login' || actionLower === 'create') {
      return 'bg-green-100 text-green-800 border-green-200'
    }
    if (actionLower === 'update' || actionLower === 'view') {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    if (actionLower === 'delete' || actionLower === 'logout') {
      return 'bg-red-100 text-red-800 border-red-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setUserIdFilter('')
    setActionFilter('')
    setResourceFilter('')
    setDateFrom('')
    setDateTo('')
    setSortBy('created_at')
    setSortDirection('desc')
  }

  const formatPayload = (payload: string | null) => {
    if (!payload) return null
    try {
      return JSON.parse(payload)
    } catch {
      return payload
    }
  }

  // Effects
  useEffect(() => {
    fetchDropdownOptions()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [searchTerm, userIdFilter, actionFilter, resourceFilter, dateFrom, dateTo, sortBy, sortDirection])

  // Format timestamp according to spec: DD/MM/YYYY HH:mm:ss WIB
  const formatTimestamp = (dateString: string, formatted?: string) => {
    if (formatted) {
      // Ensure it ends with WIB
      return formatted.endsWith('WIB') ? formatted : `${formatted} WIB`
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} WIB`
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Log Audit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor aktivitas user dan sistem rumah sakit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdDeleteForever className="text-lg" />
            <span className="hidden sm:inline">Hapus Log Lama</span>
            <span className="sm:hidden">Hapus</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLogs('excel')}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdDownload className="text-lg" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => exportLogs('pdf')}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MdDownload className="text-lg" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>

          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <MdList className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Log</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_logs.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MdViewList className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.today_logs.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <MdFilterList className="text-orange-600 dark:text-orange-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minggu Ini</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.week_logs.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <MdVisibility className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.recent_users.length}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <MdWarning className="text-yellow-500 dark:text-yellow-400 text-xl mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Statistik Tidak Tersedia</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Statistik audit log tidak dapat dimuat. Fungsi ini akan aktif ketika backend sudah dikonfigurasi dengan benar.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Cari log berdasarkan username, action, atau resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* User Filter */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 User
               </label>
               {filtersLoading ? (
                 <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
               ) : (
                 <SearchableSelect
                   options={users}
                   value={userIdFilter}
                   onChange={setUserIdFilter}
                   placeholder="Pilih user..."
                   className="w-full"
                 />
               )}
             </div>

             {/* Action Filter */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Action
               </label>
               {filtersLoading ? (
                 <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
               ) : (
                 <select
                   value={actionFilter}
                   onChange={(e) => setActionFilter(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   aria-label="Filter berdasarkan action"
                 >
                   <option value="">Semua Action</option>
                   {actions.map((action) => (
                     <option key={action.value} value={action.value}>
                       {action.label}
                     </option>
                   ))}
                 </select>
               )}
             </div>

             {/* Resource Filter */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Resource
               </label>
               {filtersLoading ? (
                 <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
               ) : (
                 <SearchableSelect
                   options={resources}
                   value={resourceFilter}
                   onChange={setResourceFilter}
                   placeholder="Pilih resource..."
                   className="w-full"
                 />
               )}
             </div>

             {/* Date Range Filter */}
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Rentang Tanggal
               </label>
               {filtersLoading ? (
                 <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
               ) : (
                 <DateRangePicker
                   startDate={dateFrom}
                   endDate={dateTo}
                   onStartDateChange={setDateFrom}
                   onEndDateChange={setDateTo}
                 />
               )}
             </div>
           </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Bersihkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Memuat audit logs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdError className="text-2xl text-red-500" />
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Gagal memuat data audit log</p>
            <button
              onClick={() => fetchLogs()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdList className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Tidak ada audit logs ditemukan</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Timestamp
                        {sortBy === 'created_at' && (
                          sortDirection === 'asc' ? 
                            <MdArrowUpward className="text-xs" /> : 
                            <MdArrowDownward className="text-xs" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      <button
                        onClick={() => handleSort('user_name')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        User
                        {sortBy === 'user_name' && (
                          sortDirection === 'asc' ? 
                            <MdArrowUpward className="text-xs" /> : 
                            <MdArrowDownward className="text-xs" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      <button
                        onClick={() => handleSort('action')}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Action
                        {sortBy === 'action' && (
                          sortDirection === 'asc' ? 
                            <MdArrowUpward className="text-xs" /> : 
                            <MdArrowDownward className="text-xs" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      Resource
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTimestamp(log.created_at, log.timestamp_formatted)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.user_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                          {log.action?.toUpperCase() || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {log.resource} {log.resource_id ? `(${log.resource_id})` : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewLogDetails(log.id)}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <MdVisibility className="text-lg" />
                          <span className="hidden md:inline">Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Menampilkan <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> sampai{' '}
                      <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> dari{' '}
                      <span className="font-medium">{pagination.total}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        Sebelumnya
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Halaman {pagination.current_page} dari {pagination.last_page}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        Selanjutnya
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] my-8 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <MdVisibility className="text-blue-600 dark:text-blue-400 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detail Log Audit</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <MdList className="text-blue-500" />
                      Informasi Dasar
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Timestamp</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatTimestamp(selectedLog.created_at, selectedLog.timestamp_formatted)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">User</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.user_name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Action</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(selectedLog.action)}`}>
                          {selectedLog.action?.toUpperCase() || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <MdFilterList className="text-green-500" />
                      Resource Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Resource</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.resource || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Resource ID</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{selectedLog.resource_id || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <MdVisibility className="text-purple-500" />
                      Technical Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">IP Address</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{selectedLog.ip_address || '-'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">User Agent</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all block">{selectedLog.user_agent || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedLog.payload && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <MdSearch className="text-orange-500" />
                    Payload (JSON)
                  </h3>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                    {JSON.stringify(formatPayload(selectedLog.payload), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full my-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MdDeleteForever className="text-red-500 text-2xl" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hapus Log Lama</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Aksi ini akan menghapus log audit yang lebih lama dari jumlah hari yang ditentukan.
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hapus log yang lebih lama dari:
                </label>
                <select
                  value={deleteDays}
                  onChange={(e) => setDeleteDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-label="Pilih periode penghapusan log"
                >
                  <option value={30}>30 hari</option>
                  <option value={60}>60 hari</option>
                  <option value={90}>90 hari</option>
                  <option value={180}>180 hari (6 bulan)</option>
                  <option value={365}>365 hari (1 tahun)</option>
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
                  Hapus Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}