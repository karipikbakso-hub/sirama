'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaShieldAlt,
  FaUserCheck,
  FaClock,
  FaFileMedical,
  FaIdCard,
  FaHospital,
  FaCalendarAlt,
  FaUserMd,
  FaInfoCircle,
  FaSync,
  FaEye,
  FaFilter,
  FaDownload,
  FaPrint,
  FaExternalLinkAlt,
  FaCheck,
  FaTimes,
  FaArrowRight,
  FaHistory,
  FaChartBar,
  FaDatabase
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

type SEP = {
  id: number
  patient_id: number
  registration_id: number
  sep_number: string
  bpjs_number: string
  service_type: string
  diagnosis: string
  status: 'active' | 'inactive' | 'rejected' | 'pending_bpjs'
  notes?: string
  created_at: string
  updated_at: string
  patient?: {
    id: number
    mrn: string
    name: string
    nik?: string
  }
  registration?: {
    id: number
    registration_no: string
    created_at: string
  }
  creator?: {
    id: number
    name: string
  }
}

type SEPValidationResult = {
  success: boolean
  message: string
  data?: {
    sep?: {
      noSep?: string
      tglSep?: string
      jnsPelayanan?: string
      status?: string
      diagnosa?: string
    }
    participant?: {
      nama?: string
      noKartu?: string
      statusPeserta?: {
        keterangan?: string
      }
    }
  }
  response_time?: number
  error?: string
}

type VerificationHistory = {
  id: number
  sep_id: number
  verification_type: 'status_check' | 'detail_validation'
  result: 'success' | 'failed' | 'error'
  response_data: any
  checked_at: string
  checked_by: number
  response_time_ms: number
}

export default function VerifikasiSEPPage() {
  const [activeTab, setActiveTab] = useState<'verification' | 'history'>('verification')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // Verification states
  const [selectedSEP, setSelectedSEP] = useState<SEP | null>(null)
  const [verificationResult, setVerificationResult] = useState<SEPValidationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const queryClient = useQueryClient()

  // API calls with React Query
  const { data: seps, isLoading: sepsLoading, refetch: refetchSEPs } = useQuery({
    queryKey: ['seps-verification', currentPage, perPage, searchTerm, statusFilter, serviceTypeFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (serviceTypeFilter) params.append('service_type', serviceTypeFilter)
      if (dateFilter) params.append('date', dateFilter)

      const response = await api.get(`/api/seps?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
        return paginationData.data || []
      }
      return []
    },
    enabled: activeTab === 'verification'
  })

  const { data: verificationHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['sep-verification-history'],
    queryFn: async () => {
      const response = await api.get('api/sep-verifications/history')
      return response.data.success ? response.data.data : []
    },
    enabled: activeTab === 'history'
  })

  const { data: verificationStats } = useQuery({
    queryKey: ['sep-verification-stats'],
    queryFn: async () => {
      const response = await api.get('api/sep-verifications/stats')
      return response.data.success ? response.data.data : null
    }
  })

  // Mutations
  const verifySEPMutation = useMutation({
    mutationFn: async (sepId: number) => {
      const response = await api.post(`api/seps/${sepId}/verify-status`)
      return response.data
    },
    onSuccess: (result) => {
      setVerificationResult(result)
      if (result.success) {
        refetchSEPs()
        queryClient.invalidateQueries({ queryKey: ['sep-verification-history'] })
        queryClient.invalidateQueries({ queryKey: ['sep-verification-stats'] })
      }
    }
  })

  // Helper functions
  const handleVerification = async (sep: SEP) => {
    setSelectedSEP(sep)
    setIsVerifying(true)
    setVerificationResult(null)

    try {
      await verifySEPMutation.mutateAsync(sep.id)
    } finally {
      setIsVerifying(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending_bpjs': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Nonaktif'
      case 'rejected': return 'Ditolak'
      case 'pending_bpjs': return 'Menunggu BPJS'
      default: return status
    }
  }

  const getVerificationStatusColor = (result: string) => {
    switch (result) {
      case 'success': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'error': return 'text-orange-600'
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
  const columns = useMemo<ColumnDef<SEP>[]>(() => [
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
      accessorKey: 'sep_number',
      header: 'No. SEP',
      cell: ({ row }) => (
        <span className="font-medium font-mono text-blue-600">{row.original.sep_number}</span>
      ),
    },
    {
      accessorKey: 'bpjs_number',
      header: 'No. BPJS',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.bpjs_number}</span>
      ),
    },
    {
      accessorKey: 'service_type',
      header: 'Jenis Pelayanan',
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
          {row.original.service_type}
        </span>
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
      accessorKey: 'created_at',
      header: 'Tanggal Dibuat',
      cell: ({ row }) => (
        <span className="text-sm">{formatDateTime(row.original.created_at).date}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedSEP(row.original)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Lihat Detail"
          >
            <FaEye className="text-xs" />
          </button>
          <button
            onClick={() => handleVerification(row.original)}
            disabled={verifySEPMutation.isPending}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
            title="Cek Status Online"
          >
            {verifySEPMutation.isPending && selectedSEP?.id === row.original.id ? (
              <FaSpinner className="text-xs animate-spin" />
            ) : (
              <FaUserCheck className="text-xs" />
            )}
          </button>
        </div>
      ),
    },
  ], [selectedSEP, verifySEPMutation.isPending])

  const table = useReactTable({
    data: seps || [],
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
          <FaShieldAlt className="text-blue-500" />
          <span className="truncate">Verifikasi SEP Online</span>
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total SEP</p>
                <p className="text-2xl font-bold">
                  {verificationStats?.total_seps || 0}
                </p>
              </div>
              <FaFileMedical className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terverifikasi</p>
                <p className="text-2xl font-bold text-green-600">
                  {verificationStats?.verified_today || 0}
                </p>
              </div>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gagal Verifikasi</p>
                <p className="text-2xl font-bold text-red-600">
                  {verificationStats?.failed_verifications || 0}
                </p>
              </div>
              <FaTimesCircle className="text-2xl text-red-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Response</p>
                <p className="text-2xl font-bold text-purple-600">
                  {verificationStats?.average_response_time ? `${verificationStats.average_response_time}ms` : 'N/A'}
                </p>
              </div>
              <FaClock className="text-2xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
              activeTab === 'verification'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FaUserCheck className="inline mr-2" />
            Verifikasi SEP
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
            Riwayat Verifikasi
          </button>
        </div>

        {/* Verification Tab */}
        {activeTab === 'verification' && (
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
                    placeholder="Cari SEP, nama pasien..."
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
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="rejected">Ditolak</option>
                  <option value="pending_bpjs">Menunggu BPJS</option>
                </select>

                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Semua Jenis Pelayanan</option>
                  <option value="Rawat Jalan">Rawat Jalan</option>
                  <option value="Rawat Inap">Rawat Inap</option>
                  <option value="Rawat Darurat">Rawat Darurat</option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* SEP Table */}
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
                    {sepsLoading ? (
                      <tr>
                        <td colSpan={columns.length} className="px-4 py-8 text-center">
                          <FaSpinner className="animate-spin mx-auto text-blue-500" />
                          <div className="mt-2">Memuat data SEP...</div>
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
                          Tidak ada data SEP ditemukan
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
                    Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalRecords)} dari {totalRecords} SEP
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

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <FaHistory className="text-blue-500" />
                Riwayat Verifikasi SEP
              </h2>

              <div className="space-y-4">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <FaSpinner className="animate-spin mx-auto text-blue-500" />
                    <div className="mt-2">Memuat riwayat verifikasi...</div>
                  </div>
                ) : verificationHistory?.length > 0 ? (
                  verificationHistory.map((history: VerificationHistory) => (
                    <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getVerificationStatusColor(history.result)}`}>
                            {history.result === 'success' ? 'Berhasil' : history.result === 'failed' ? 'Gagal' : 'Error'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {history.verification_type === 'status_check' ? 'Cek Status' : 'Validasi Detail'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(history.checked_at).date} {formatDateTime(history.checked_at).time}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Response time: {history.response_time_ms}ms
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada riwayat verifikasi
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEP Detail Modal */}
        {selectedSEP && !isVerifying && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Detail SEP
                  </h2>
                  <button
                    onClick={() => setSelectedSEP(null)}
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        No. SEP
                      </label>
                      <p className="font-mono text-lg font-bold text-blue-600">{selectedSEP.sep_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSEP.status)}`}>
                        {getStatusText(selectedSEP.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Pasien
                    </label>
                    <p className="text-lg">{selectedSEP.patient?.name}</p>
                    <p className="text-sm text-gray-500">MRN: {selectedSEP.patient?.mrn}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        No. BPJS
                      </label>
                      <p className="font-mono">{selectedSEP.bpjs_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jenis Pelayanan
                      </label>
                      <p>{selectedSEP.service_type}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diagnosis
                    </label>
                    <p>{selectedSEP.diagnosis}</p>
                  </div>

                  {selectedSEP.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catatan
                      </label>
                      <p>{selectedSEP.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal Dibuat
                      </label>
                      <p>{formatDateTime(selectedSEP.created_at).date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dibuat Oleh
                      </label>
                      <p>{selectedSEP.creator?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleVerification(selectedSEP)}
                    disabled={verifySEPMutation.isPending}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifySEPMutation.isPending ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaUserCheck />
                    )}
                    Cek Status Online
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result Modal */}
        {verificationResult && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {verificationResult.success ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                    Hasil Verifikasi SEP
                  </h2>
                  <button
                    onClick={() => setVerificationResult(null)}
                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${verificationResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`font-medium ${verificationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {verificationResult.message}
                    </p>
                    {verificationResult.response_time && (
                      <p className="text-sm text-gray-600 mt-1">
                        Response time: {verificationResult.response_time}ms
                      </p>
                    )}
                  </div>

                  {verificationResult.success && verificationResult.data && (
                    <div className="space-y-4">
                      {verificationResult.data.sep && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h3 className="font-medium mb-3 flex items-center gap-2">
                            <FaFileMedical className="text-blue-500" />
                            Data SEP dari BPJS
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">No. SEP:</span>
                              <p className="font-mono font-medium">{verificationResult.data.sep.noSep}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Tanggal SEP:</span>
                              <p>{verificationResult.data.sep.tglSep}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Jenis Pelayanan:</span>
                              <p>{verificationResult.data.sep.jnsPelayanan}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <p className={verificationResult.data.sep.status === '1' ? 'text-green-600' : 'text-red-600'}>
                                {verificationResult.data.sep.status === '1' ? 'Aktif' : 'Nonaktif'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {verificationResult.data.participant && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h3 className="font-medium mb-3 flex items-center gap-2">
                            <FaIdCard className="text-blue-500" />
                            Data Peserta BPJS
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Nama:</span>
                              <p className="font-medium">{verificationResult.data.participant.nama}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">No. Kartu:</span>
                              <p className="font-mono">{verificationResult.data.participant.noKartu}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Status Peserta:</span>
                              <p className={verificationResult.data.participant.statusPeserta?.keterangan?.includes('AKTIF') ? 'text-green-600' : 'text-red-600'}>
                                {verificationResult.data.participant.statusPeserta?.keterangan}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {verificationResult.error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium">Error Detail:</p>
                      <p className="text-red-700 text-sm mt-1">{verificationResult.error}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setVerificationResult(null)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
