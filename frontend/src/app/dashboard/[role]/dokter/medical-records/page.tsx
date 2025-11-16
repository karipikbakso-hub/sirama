'use client'

import { useState, useMemo } from 'react'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaFileMedical, FaSearch, FaEye, FaPlus, FaEdit, FaTrash, FaSpinner, FaExclamationTriangle, FaSort, FaSortUp, FaSortDown, FaCalendarAlt, FaUserMd, FaStethoscope, FaPrescription, FaFlask, FaHeartbeat } from 'react-icons/fa'
import api from '@/lib/apiAuth'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

type MedicalRecord = {
  id: number
  patient_id: number
  doctor_id: number
  visit_date: string
  diagnosis: string
  symptoms: string
  treatment: string
  notes: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  patient?: {
    id: number
    mrn: string
    name: string
    birth_date: string
    gender: string
  }
  doctor?: {
    id: number
    name: string
    specialty: string
  }
  prescriptions?: Array<{
    id: number
    medication: string
    dosage: string
    frequency: string
  }>
  lab_results?: Array<{
    id: number
    test_name: string
    result: string
    normal_range: string
  }>
}

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const queryClient = useQueryClient()

  // Fetch medical records with pagination
  const fetchMedicalRecords = async (page = 1, search = '', newPerPage?: number) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (newPerPage || 10).toString(),
      })

      if (search) {
        params.append('search', search)
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await api.get(`/api/medical-records?${params}`)
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to fetch medical records')
      }
    } catch (err: any) {
      console.error('Error fetching medical records:', err)
      throw err
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/medical-records/statistics')
      if (response.data.success) {
        return response.data.data
      }
      return null
    } catch (err: any) {
      console.error('Error fetching stats:', err)
      return null
    }
  }

  // TanStack Query for medical records
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
    refetch
  } = useQuery({
    queryKey: ['medical-records', currentPage, perPage, searchTerm, statusFilter],
    queryFn: () => fetchMedicalRecords(currentPage, searchTerm, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // TanStack Query for stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['medical-records-stats'],
    queryFn: fetchStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const records = recordsData?.data || []
  const pagination = recordsData ? {
    current_page: recordsData.current_page,
    last_page: recordsData.last_page,
    per_page: recordsData.per_page,
    total: recordsData.total
  } : null

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: async (recordData: any) => {
      const response = await api.post('/api/medical-records', recordData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['medical-records-stats'] })
      setShowCreateModal(false)
      setSelectedPatient(null)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await api.put(`/api/medical-records/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['medical-records-stats'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (recordId: number) => {
      const response = await api.delete(`/api/medical-records/${recordId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['medical-records-stats'] })
    }
  })

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowViewModal(true)
  }

  const handleCreateRecord = () => {
    setShowCreateModal(true)
  }

  const handleSaveCreateRecord = async () => {
    // Implementation for creating medical record
    alert('Create medical record functionality would be implemented here')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaHeartbeat className="text-xs" />
          Aktif
        </span>
      case 'archived':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaFileMedical className="text-xs" />
          Diarsipkan
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('id-ID'),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // TanStack Table column definitions
  const columns = useMemo<ColumnDef<MedicalRecord>[]>(() => [
    {
      accessorKey: 'patient.name',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Nama Pasien</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient
        return (
          <div className="flex flex-col">
            <span className="font-medium">{patient?.name || 'N/A'}</span>
            <span className="text-xs text-gray-500">{patient?.mrn || 'N/A'}</span>
          </div>
        )
      },
      filterFn: 'includesString',
    },
    {
      accessorKey: 'patient.mrn',
      header: 'MRN',
      cell: ({ row }) => {
        const patient = row.original.patient
        return (
          <span className="font-mono text-sm">{patient?.mrn || 'N/A'}</span>
        )
      },
      filterFn: 'includesString',
    },
    {
      accessorKey: 'doctor.name',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Dokter</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => {
        const doctor = row.original.doctor
        return (
          <div className="flex flex-col">
            <span className="font-medium">{doctor?.name || 'N/A'}</span>
            <span className="text-xs text-gray-500">{doctor?.specialty || 'N/A'}</span>
          </div>
        )
      },
      filterFn: 'includesString',
    },
    {
      accessorKey: 'visit_date',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Tanggal Kunjungan</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{formatDateTime(row.original.visit_date).date}</span>
      ),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'diagnosis',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Diagnosis</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="max-w-xs truncate" title={row.original.diagnosis}>
          {row.original.diagnosis}
        </span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Status</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{getStatusBadge(row.original.status)}</span>
      ),
      filterFn: 'includesString',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleViewRecord(row.original)}
            className="p-2 text-blue-500 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Lihat Detail"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleViewRecord(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Edit Rekam Medis"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin menghapus rekam medis ini?')) {
                deleteMutation.mutate(row.original.id)
              }
            }}
            className="p-2 text-white bg-red-500 hover:bg-red-600 border border-red-500 rounded-lg transition"
            title="Hapus Rekam Medis"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ], [])

  // TanStack Table instance
  const table = useReactTable({
    data: records,
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
    initialState: {
      pagination: {
        pageSize: perPage,
      },
    },
  })

  if (recordsLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto text-4xl text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data rekam medis...</p>
        </div>
      </div>
    )
  }

  if (recordsError) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 dark:text-gray-400">Gagal memuat data rekam medis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaFileMedical className="text-green-500" />
        <span className="truncate">Rekam Medis</span>
      </h1>

      {/* Medical Records Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rekam Medis</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.total_records || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">semua waktu</p>
            </div>
            <FaFileMedical className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rekam Medis Aktif</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.active_records || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">dalam perawatan</p>
            </div>
            <FaHeartbeat className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kunjungan Bulan Ini</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.monthly_visits || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">total kunjungan</p>
            </div>
            <FaCalendarAlt className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Diagnosis</p>
              <p className="text-2xl font-bold">
                {statsLoading ? '...' : (stats?.avg_diagnoses || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">per pasien</p>
            </div>
            <FaStethoscope className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleCreateRecord}
            className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex flex-col items-center gap-2"
          >
            <FaPlus className="text-2xl text-blue-500" />
            <span className="font-medium">Buat Rekam Medis</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Tambah catatan baru</span>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex flex-col items-center gap-2">
            <FaEye className="text-2xl text-green-500" />
            <span className="font-medium">Lihat Detail</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Riwayat lengkap</span>
          </button>
          <button className="p-4 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition flex flex-col items-center gap-2">
            <FaPrescription className="text-2xl text-orange-500" />
            <span className="font-medium">Resep Obat</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Kelola resep</span>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex flex-col items-center gap-2">
            <FaFlask className="text-2xl text-purple-500" />
            <span className="font-medium">Hasil Lab</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Lihat hasil lab</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Cari Rekam Medis</h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien, diagnosis, atau dokter..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'active'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => handleStatusFilter('archived')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'archived'
                  ? 'bg-gray-500 text-white border-gray-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Diarsipkan
            </button>
          </div>
        </div>
      </div>

      {/* Medical Records Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Daftar Rekam Medis</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Kelola semua rekam medis pasien</p>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700 text-left">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-2">
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
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-800 hover:bg-green-500/10 dark:hover:bg-green-400/10 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data rekam medis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} rekam medis
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.current_page === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ‹ Sebelumnya
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum
                  if (pagination.last_page <= 5) {
                    pageNum = i + 1
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.current_page >= pagination.last_page - 2) {
                    pageNum = pagination.last_page - 4 + i
                  } else {
                    pageNum = pagination.current_page - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg transition ${
                        pagination.current_page === pageNum
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                disabled={pagination.current_page === pagination.last_page}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Selanjutnya ›
              </button>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tampilkan:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  const newPerPage = Number(e.target.value)
                  setPerPage(newPerPage)
                  setCurrentPage(1)
                }}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-600 dark:text-gray-400">per halaman</span>
            </div>
          </div>
        )}
      </div>

      {/* View Medical Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Detail Rekam Medis
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaUserMd className="text-blue-500" />
                    Informasi Pasien
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nama:</span>
                      <span className="font-medium">{selectedRecord.patient?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">MRN:</span>
                      <span className="font-mono">{selectedRecord.patient?.mrn || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tanggal Lahir:</span>
                      <span>{selectedRecord.patient?.birth_date ? new Date(selectedRecord.patient.birth_date).toLocaleDateString('id-ID') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Jenis Kelamin:</span>
                      <span>{selectedRecord.patient?.gender === 'male' ? 'Laki-laki' : selectedRecord.patient?.gender === 'female' ? 'Perempuan' : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaStethoscope className="text-green-500" />
                    Informasi Dokter
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nama:</span>
                      <span className="font-medium">{selectedRecord.doctor?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Spesialis:</span>
                      <span>{selectedRecord.doctor?.specialty || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tanggal Kunjungan:</span>
                      <span>{formatDateTime(selectedRecord.visit_date).date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span>{getStatusBadge(selectedRecord.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FaHeartbeat className="text-red-500" />
                    Informasi Medis
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gejala
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 p-2 rounded">
                        {selectedRecord.symptoms || 'Tidak ada catatan gejala'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Diagnosis
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 p-2 rounded">
                        {selectedRecord.diagnosis || 'Tidak ada diagnosis'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pengobatan
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 p-2 rounded">
                        {selectedRecord.treatment || 'Tidak ada catatan pengobatan'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catatan Tambahan
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 p-2 rounded">
                        {selectedRecord.notes || 'Tidak ada catatan tambahan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prescriptions */}
                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FaPrescription className="text-orange-500" />
                      Resep Obat
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.prescriptions.map((prescription, index) => (
                        <div key={index} className="bg-white dark:bg-gray-600 p-3 rounded">
                          <div className="font-medium">{prescription.medication}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.dosage} - {prescription.frequency}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab Results */}
                {selectedRecord.lab_results && selectedRecord.lab_results.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <FaFlask className="text-purple-500" />
                      Hasil Laboratorium
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.lab_results.map((result, index) => (
                        <div key={index} className="bg-white dark:bg-gray-600 p-3 rounded">
                          <div className="font-medium">{result.test_name}</div>
                          <div className="text-sm">
                            <span className="text-green-600 dark:text-green-400 font-medium">{result.result}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              (Normal: {result.normal_range})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Medical Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Buat Rekam Medis Baru
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pasien *
                  </label>
                  <SearchableSelect
                    onChange={(selected) => {
                      if (selected) {
                        setSelectedPatient(selected.patient)
                      } else {
                        setSelectedPatient(null)
                      }
                    }}
                    placeholder="Cari dan pilih pasien..."
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Kunjungan *
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dokter *
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      <option value="">Pilih dokter</option>
                      <option value="1">Dr. Ahmad Santoso - Spesialis Penyakit Dalam</option>
                      <option value="2">Dr. Siti Nurhaliza - Spesialis Anak</option>
                      <option value="3">Dr. Budi Setiawan - Spesialis Bedah</option>
                      <option value="4">Dr. Maya Sari - Spesialis Kandungan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gejala *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Deskripsikan gejala yang dialami pasien..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diagnosis *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Diagnosis medis..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pengobatan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Rencana pengobatan dan tindakan medis..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Catatan tambahan (opsional)..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveCreateRecord}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Buat Rekam Medis'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
