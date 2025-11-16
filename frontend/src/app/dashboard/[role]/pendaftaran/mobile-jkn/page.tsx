'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FaSync,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaClock,
  FaChartBar,
  FaDatabase,
  FaArrowRight,
  FaHistory,
  FaPlay,
  FaPause,
  FaRedo,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaCog
} from 'react-icons/fa'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import api from '@/lib/apiAuth'

type MobileJknAppointment = {
  id: number
  patient_id: number
  bpjs_number: string
  booking_code: string | null
  source: string
  appointment_date: string
  appointment_time: string
  doctor_name: string
  poli_name: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  jkn_data: any
  sync_status: 'pending' | 'success' | 'failed' | 'partial'
  synced_at: string | null
  last_sync_attempt: string | null
  sync_error: string | null
  created_at: string
  updated_at: string
  patient?: {
    id: number
    mrn: string
    name: string
  }
}

type SyncResult = {
  total_processed: number
  successful: number
  failed: number
  skipped: number
  duration_ms: number
  errors: Array<{
    patient_id: number
    bpjs_number: string
    error: string
  }>
}

type DashboardStats = {
  total_appointments: number
  today_appointments: number
  upcoming_appointments: number
  completed_today: number
  sync_stats: {
    successful: number
    failed: number
    pending: number
  }
  status_distribution: Record<string, number>
  last_sync: string | null
  average_sync_time: number | null
}

export default function MobileJKNPage() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'sync' | 'history'>('appointments')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // Sync states
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncFilters, setSyncFilters] = useState({
    sync_all: false,
    bpjs_numbers: [] as string[],
    date_from: '',
    date_to: ''
  })

  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [syncStatusFilter, setSyncStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const queryClient = useQueryClient()

  // API calls with React Query
  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ['mobile-jkn-appointments', currentPage, perPage, searchTerm, statusFilter, syncStatusFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (syncStatusFilter) params.append('sync_status', syncStatusFilter)
      if (dateFilter) params.append('date_from', dateFilter)

      const response = await api.get(`/api/mobile-jkn/appointments?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
        return paginationData.data || []
      }
      return []
    },
    enabled: activeTab === 'appointments'
  })

  const { data: dashboardStats } = useQuery({
    queryKey: ['mobile-jkn-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('api/mobile-jkn/dashboard-stats')
      return response.data.success ? response.data.data : null
    }
  })

  const { data: syncHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['mobile-jkn-sync-history'],
    queryFn: async () => {
      const response = await api.get('api/mobile-jkn/sync-history')
      return response.data.success ? response.data.data : []
    },
    enabled: activeTab === 'history'
  })

  // Mutations
  const syncMutation = useMutation({
    mutationFn: async (filters: typeof syncFilters) => {
      const response = await api.post('api/mobile-jkn/sync-appointments', filters)
      return response.data
    },
    onSuccess: (result) => {
      setSyncResult(result.data)
      if (result.success) {
        refetchAppointments()
        queryClient.invalidateQueries({ queryKey: ['mobile-jkn-dashboard-stats'] })
        queryClient.invalidateQueries({ queryKey: ['mobile-jkn-sync-history'] })
      }
    }
  })

  // Helper functions
  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      await syncMutation.mutateAsync(syncFilters)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'no_show': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Terjadwal'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      case 'no_show': return 'Tidak Hadir'
      default: return status
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
      case 'partial': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Table columns
  const columns = useMemo<ColumnDef<MobileJknAppointment>[]>(() => [
    {
      accessorKey: 'patient.name',
      header: 'Nama Pasien',
      cell: ({ row }) => {
        const patient = row.original.patient
        return (
          <div className="flex flex-col">
            <span className="font-medium">{patient?.name || 'N/A'}</span>
            <span className="text-xs text-gray-500">MRN: {patient?.mrn || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'bpjs_number',
      header: 'No. BPJS',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.bpjs_number}</span>
      ),
    },
    {
      accessorKey: 'booking_code',
      header: 'Kode Booking',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-blue-600">
          {row.original.booking_code || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'appointment_date',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm">{formatDateTime(row.original.appointment_date).date}</span>
      ),
    },
    {
      accessorKey: 'appointment_time',
      header: 'Waktu',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.appointment_time}</span>
      ),
    },
    {
      accessorKey: 'doctor_name',
      header: 'Dokter',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.doctor_name}</span>
      ),
    },
    {
      accessorKey: 'poli_name',
      header: 'Poli',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.poli_name}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.original.status)}`}>
          {getStatusText(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: 'sync_status',
      header: 'Status Sync',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSyncStatusColor(row.original.sync_status)}`}>
          {row.original.sync_status === 'success' ? 'Berhasil' :
           row.original.sync_status === 'failed' ? 'Gagal' :
           row.original.sync_status === 'pending' ? 'Menunggu' : 'Sebagian'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Lihat Detail"
          >
            <FaEye className="text-xs" />
          </button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: appointments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
          <FaHospital className="text-blue-500" />
          <span className="truncate">Mobile JKN - Tarik Data Janji Temu</span>
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Janji Temu</p>
                <p className="text-2xl font-bold">
                  {dashboardStats?.total_appointments || 0}
                </p>
              </div>
              <FaCalendarAlt className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Janji Temu Hari Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats?.today_appointments || 0}
                </p>
              </div>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sinkronisasi Berhasil</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardStats?.sync_stats?.successful || 0}
                </p>
              </div>
              <FaSync className="text-2xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Response</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardStats?.average_sync_time ? `${dashboardStats.average_sync_time}ms` : 'N/A'}
                </p>
              </div>
              <FaClock className="text-2xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'appointments'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Janji Temu
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'sync'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FaSync className="inline mr-2" />
            Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FaHistory className="inline mr-2" />
            Riwayat Sync
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama pasien, kode booking..."
                    className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Semua Status</option>
                  <option value="scheduled">Terjadwal</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                  <option value="no_show">Tidak Hadir</option>
                </select>

                <select
                  value={syncStatusFilter}
                  onChange={(e) => setSyncStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Semua Status Sync</option>
                  <option value="success">Berhasil</option>
                  <option value="failed">Gagal</option>
                  <option value="pending">Menunggu</option>
                  <option value="partial">Sebagian</option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Appointments Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-200">
                    {appointmentsLoading ? (
                      <tr>
                        <td colSpan={columns.length} className="px-4 py-8 text-center">
                          <FaSpinner className="animate-spin mx-auto text-blue-500" />
                          <div className="mt-2">Memuat data janji temu...</div>
                        </td>
                      </tr>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-200 dark:border-gray-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                          Tidak ada data janji temu ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalRecords)} dari {totalRecords} janji temu
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      ‹ Sebelumnya
                    </button>

                    <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      Halaman {currentPage} dari {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Selanjutnya ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sync Tab */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <FaSync className="text-blue-500" />
                Sinkronisasi Data Janji Temu Mobile JKN
              </h2>

              <div className="space-y-4">
                {/* Sync Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={syncFilters.sync_all}
                        onChange={(e) => setSyncFilters(prev => ({ ...prev, sync_all: e.target.checked }))}
                        className="mr-2"
                      />
                      Sinkronisasi semua pasien aktif
                    </label>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={syncFilters.date_from}
                        onChange={(e) => setSyncFilters(prev => ({ ...prev, date_from: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Tanggal Akhir</label>
                      <input
                        type="date"
                        value={syncFilters.date_to}
                        onChange={(e) => setSyncFilters(prev => ({ ...prev, date_to: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Informasi Sinkronisasi</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Data akan diambil dari API Mobile JKN BPJS</p>
                      <p>• Janji temu baru akan ditambahkan</p>
                      <p>• Status yang ada akan diperbarui</p>
                      <p>• Proses ini mungkin memakan waktu</p>
                    </div>
                  </div>
                </div>

                {/* Sync Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing || syncMutation.isPending}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-3 font-medium"
                  >
                    {isSyncing || syncMutation.isPending ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Sedang Sinkronisasi...
                      </>
                    ) : (
                      <>
                        <FaSync />
                        Mulai Sinkronisasi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sync Result */}
            {syncResult && (
              <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaChartBar className="text-green-500" />
                  Hasil Sinkronisasi
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{syncResult.total_processed}</div>
                    <div className="text-sm text-gray-600">Diproses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{syncResult.successful}</div>
                    <div className="text-sm text-gray-600">Berhasil</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{syncResult.failed}</div>
                    <div className="text-sm text-gray-600">Gagal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{syncResult.duration_ms}ms</div>
                    <div className="text-sm text-gray-600">Durasi</div>
                  </div>
                </div>

                {syncResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-red-600 mb-2">Error Details:</h4>
                    <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      {syncResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700 dark:text-red-300 mb-1">
                          {error.bpjs_number}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <FaHistory className="text-blue-500" />
                Riwayat Sinkronisasi Mobile JKN
              </h2>

              <div className="space-y-4">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <FaSpinner className="animate-spin mx-auto text-blue-500" />
                    <div className="mt-2">Memuat riwayat sinkronisasi...</div>
                  </div>
                ) : syncHistory?.data?.length > 0 ? (
                  syncHistory.data.map((history: any) => (
                    <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            history.status === 'success' ? 'bg-green-100 text-green-800' :
                            history.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {history.status === 'success' ? 'Berhasil' :
                             history.status === 'partial' ? 'Sebagian' : 'Gagal'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Mobile JKN Sync
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(history.created_at).date} {formatDateTime(history.created_at).time}
                        </span>
                      </div>

                      {history.response_data && (
                        <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                          <div>
                            <span className="text-gray-600">Diproses:</span>
                            <span className="font-medium ml-1">{history.response_data.total_processed || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Berhasil:</span>
                            <span className="font-medium ml-1 text-green-600">{history.response_data.successful || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Gagal:</span>
                            <span className="font-medium ml-1 text-red-600">{history.response_data.failed || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Durasi:</span>
                            <span className="font-medium ml-1">{history.response_data.duration_ms || 0}ms</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada riwayat sinkronisasi
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
