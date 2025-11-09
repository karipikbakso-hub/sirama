'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaHospital,
  FaMoneyBillWave,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown
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
import { useAuthContext } from '@/hooks/AuthContext'
import api from '@/lib/apiAuth'

// Tipe data untuk registrasi dari API
type Registration = {
  id: number
  patient_id: number
  registration_no: string
  service_unit: string
  doctor_id?: number
  arrival_type: 'mandiri' | 'rujukan' | 'igd'
  referral_source?: string
  payment_method: 'tunai' | 'bpjs' | 'asuransi'
  insurance_number?: string
  queue_number: string
  status: 'registered' | 'checked-in' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  patient?: {
    id: number
    mrn: string
    name: string
    nik?: string
    birth_date: string
    phone?: string
    address?: string
  }
  doctor?: {
    id: number
    name: string
  }
  creator?: {
    id: number
    name: string
  }
}

// Tipe data untuk statistik
type Statistics = {
  total_registrations: number
  registered: number
  checked_in: number
  completed: number
  cancelled: number
  by_payment_method: {
    tunai: number
    bpjs: number
    asuransi: number
  }
  by_service_unit: Record<string, number>
}

// Tipe data untuk patient
type Patient = {
  id: number
  mrn: string
  name: string
  nik?: string
  birth_date: string
  phone?: string
  address?: string
}

export default function RegistrasiPage() {
  const { user } = useAuthContext()

  // State untuk data registrasi
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // State untuk form registrasi
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // State untuk modal detail dan edit
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null)

  // State untuk form input
  const [formData, setFormData] = useState({
    // Patient data (for new patients)
    name: '',
    nik: '',
    birth_date: '',
    gender: 'L' as 'L' | 'P',
    phone: '',
    address: '',
    emergency_contact: '',

    // Registration data
    patient_id: '',
    service_unit: '',
    doctor_id: '',
    arrival_type: 'mandiri' as 'mandiri' | 'rujukan' | 'igd',
    referral_source: '',
    payment_method: 'tunai' as 'tunai' | 'bpjs' | 'asuransi',
    insurance_number: '',
    notes: ''
  })

  // State untuk pencarian pasien
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchingPatients, setSearchingPatients] = useState(false)
  const [isExistingPatient, setIsExistingPatient] = useState(false)

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Fetch registrations with pagination
  const fetchRegistrations = async (page = 1, search = '', newPerPage?: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (newPerPage || perPage).toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await api.get(`/api/registrations?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setRegistrations(paginationData.data || [])
        setCurrentPage(paginationData.current_page || 1)
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
      } else {
        throw new Error(response.data.message || 'Failed to fetch registrations')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
      console.error('Error fetching registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await api.get('/api/registrations-statistics')
      if (response.data.success) {
        setStatistics(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching statistics:', err)
    }
  }



  useEffect(() => {
    fetchRegistrations()
    fetchStatistics()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await api.post('/api/registrations', formData)
      if (response.data.success) {
        await fetchRegistrations() // Refresh data
        await fetchStatistics() // Refresh statistics
        setIsRegistrationFormOpen(false)
        setFormData({
          name: '',
          nik: '',
          birth_date: '',
          gender: 'L',
          phone: '',
          address: '',
          emergency_contact: '',
          patient_id: '',
          service_unit: '',
          doctor_id: '',
          arrival_type: 'mandiri',
          referral_source: '',
          payment_method: 'tunai',
          insurance_number: '',
          notes: ''
        })
      } else {
        throw new Error(response.data.message || 'Failed to create registration')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
      console.error('Error creating registration:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Open registration form
  const openRegistrationForm = () => {
    setIsRegistrationFormOpen(true)
  }

  // Close registration form
  const closeRegistrationForm = () => {
    setIsRegistrationFormOpen(false)
    setPatientSearchTerm('')
    setPatientSearchResults([])
    setSelectedPatient(null)
    setShowPatientDropdown(false)
  }

  // Handle view detail
  const handleViewDetail = (registration: Registration) => {
    setSelectedRegistration(registration)
    setIsDetailModalOpen(true)
  }

  // Handle edit
  const handleEdit = (registration: Registration) => {
    setEditingRegistration(registration)
    setFormData({
      patient_id: registration.patient_id?.toString() || '',
      service_unit: registration.service_unit,
      doctor_id: registration.doctor_id?.toString() || '',
      arrival_type: registration.arrival_type,
      referral_source: registration.referral_source || '',
      payment_method: registration.payment_method,
      insurance_number: registration.insurance_number || '',
      notes: '',
      // Patient data for display
      name: registration.patient?.name || '',
      nik: registration.patient?.nik || '',
      birth_date: registration.patient?.birth_date || '',
      gender: 'L', // Default, will be updated if needed
      phone: registration.patient?.phone || '',
      address: registration.patient?.address || '',
      emergency_contact: ''
    })
    setIsEditModalOpen(true)
  }

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedRegistration(null)
  }

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingRegistration(null)
    setFormData({
      name: '',
      nik: '',
      birth_date: '',
      gender: 'L',
      phone: '',
      address: '',
      emergency_contact: '',
      patient_id: '',
      service_unit: '',
      doctor_id: '',
      arrival_type: 'mandiri',
      referral_source: '',
      payment_method: 'tunai',
      insurance_number: '',
      notes: ''
    })
  }

  // Search patients function
  const searchPatients = async (query: string) => {
    if (query.length < 2) return

    setSearchingPatients(true)
    try {
      const response = await api.get(`/api/patients-search?q=${encodeURIComponent(query)}`)
      if (response.data.success) {
        setPatientSearchResults(response.data.data || [])
      }
    } catch (err: any) {
      console.error('Error searching patients:', err)
      setPatientSearchResults([])
    } finally {
      setSearchingPatients(false)
    }
  }

  // Filter registrasi berdasarkan pencarian
  const filteredRegistrations = registrations.filter(registration =>
    registration.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.patient?.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.queue_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.registration_no.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'checked-in': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Terdaftar'
      case 'checked-in': return 'Check-in'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      default: return status
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
  const columns = useMemo<ColumnDef<Registration>[]>(() => [
    {
      accessorKey: 'registration_no',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>No. Registrasi</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.registration_no}</span>
      ),
      filterFn: 'includesString',
    },
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
      cell: ({ row }) => (
        <span className="font-medium">{row.original.patient?.name || 'N/A'}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'patient.mrn',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>MRN</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.patient?.mrn || 'N/A'}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Tanggal</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="hidden md:inline">{formatDateTime(row.original.created_at).date}</span>
      ),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'service_unit',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Unit Pelayanan</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{row.original.service_unit}</span>
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.original.status)}`}>
          {getStatusText(row.original.status)}
        </span>
      ),
      filterFn: 'includesString',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleViewDetail(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Lihat Detail"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Edit Registrasi"
          >
            <FaEdit />
          </button>
        </div>
      ),
    },
  ], [])

  // TanStack Table instance
  const table = useReactTable({
    data: registrations,
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

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto text-4xl text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data registrasi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaUserPlus className="text-blue-500" />
        <span className="truncate">Registrasi Pasien</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari registrasi berdasarkan nama, MRN, atau nomor antrian..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openRegistrationForm}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2"
          >
            <FaUserPlus />
            <span className="hidden sm:inline">Registrasi Baru</span>
            <span className="sm:hidden">Baru</span>
          </button>
        </div>



        {/* TanStack Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700"
                    >
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
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
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data registrasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Menampilkan</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span>dari {table.getFilteredRowModel().rows.length} registrasi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              ‹‹ Pertama
            </button>
            <button
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ‹ Sebelumnya
            </button>

            <span className="flex items-center gap-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Halaman</span>
              <strong className="text-sm text-gray-900 dark:text-white">
                {table.getState().pagination.pageIndex + 1} dari{' '}
                {table.getPageCount()}
              </strong>
            </span>

            <button
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Selanjutnya ›
            </button>
            <button
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Terakhir ››
            </button>
          </div>
        </div>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Registrasi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Terdaftar</p>
              <p className="text-lg md:text-2xl font-bold">
                {statistics?.registered || 0}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Check-in</p>
              <p className="text-lg md:text-2xl font-bold">
                {statistics?.checked_in || 0}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {statistics?.completed || 0}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Dibatalkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {statistics?.cancelled || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Metode Pembayaran</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Tunai</span>
              <span className="font-bold">
                {statistics?.by_payment_method.tunai || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>BPJS</span>
              <span className="font-bold">
                {statistics?.by_payment_method.bpjs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Asuransi</span>
              <span className="font-bold">
                {statistics?.by_payment_method.asuransi || 0}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-zinc-800 pt-2 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{statistics?.total_registrations || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Registrasi Pasien */}
      {isRegistrationFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Registrasi Pasien Baru</h2>
                <button
                  onClick={closeRegistrationForm}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Data Pasien */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FaUserPlus /> Data Pasien
                    </h3>

                    {/* Search for existing patient */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cari Pasien Terdaftar (Opsional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ketik nama atau MRN pasien untuk auto-fill..."
                          value={patientSearchTerm}
                          onChange={(e) => {
                            setPatientSearchTerm(e.target.value)
                            setShowPatientDropdown(true)
                            // Search patients as user types
                            if (e.target.value.length > 1) {
                              searchPatients(e.target.value)
                            } else {
                              setPatientSearchResults([])
                            }
                          }}
                          onFocus={() => setShowPatientDropdown(true)}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        {searchingPatients && (
                          <FaSpinner className="absolute right-3 top-3 animate-spin text-gray-400" />
                        )}
                      </div>

                      {/* Search Results Dropdown */}
                      {showPatientDropdown && patientSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {patientSearchResults.map((patient) => (
                            <div
                              key={patient.id}
                              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                              onClick={() => {
                                setSelectedPatient(patient)
                                setFormData(prev => ({
                                  ...prev,
                                  patient_id: patient.id.toString(),
                                  name: patient.name,
                                  nik: patient.nik || '',
                                  birth_date: patient.birth_date || '',
                                  phone: patient.phone || '',
                                  address: patient.address || ''
                                }))
                                setPatientSearchTerm(`${patient.name} - ${patient.mrn}`)
                                setShowPatientDropdown(false)
                              }}
                            >
                              <div className="font-medium text-gray-800 dark:text-white">{patient.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                MRN: {patient.mrn} | NIK: {patient.nik || 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Selected Patient Display */}
                      {selectedPatient && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-600" />
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-200">
                                Pasien Ditemukan: {selectedPatient.name}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-300">
                                MRN: {selectedPatient.mrn} | NIK: {selectedPatient.nik || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No results message */}
                      {patientSearchTerm.length > 1 && !searchingPatients && patientSearchResults.length === 0 && showPatientDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 text-center text-gray-500 dark:text-gray-400">
                          Tidak ada pasien ditemukan - isi form di bawah
                        </div>
                      )}
                    </div>

                    {/* Patient Form Fields */}
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          NIK (16 digit)
                        </label>
                        <input
                          type="text"
                          name="nik"
                          value={formData.nik}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                            setFormData(prev => ({ ...prev, nik: value }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan 16 digit NIK"
                          maxLength={16}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Jenis Kelamin *
                        </label>
                        <div className="flex gap-4 text-gray-800 dark:text-gray-200">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="L"
                              checked={formData.gender === 'L'}
                              onChange={handleInputChange}
                              className="mr-2"
                              required
                            />
                            Laki-laki
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gender"
                              value="P"
                              checked={formData.gender === 'P'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            Perempuan
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nomor Telepon
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan nomor telepon"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Alamat
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan alamat lengkap"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Kontak Darurat
                        </label>
                        <input
                          type="text"
                          name="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan kontak darurat"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detail Registrasi */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FaHospital /> Detail Registrasi
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unit Pelayanan *
                      </label>
                      <select
                        name="service_unit"
                        value={formData.service_unit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        required
                      >
                        <option value="">Pilih unit pelayanan</option>
                        <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                        <option value="Poli Anak">Poli Anak</option>
                        <option value="Poli Kandungan">Poli Kandungan</option>
                        <option value="IGD">IGD</option>
                        <option value="Rawat Inap">Rawat Inap</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jenis Kedatangan *
                      </label>
                      <div className="flex gap-4 text-gray-800 dark:text-gray-200">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="arrival_type"
                            value="mandiri"
                            checked={formData.arrival_type === 'mandiri'}
                            onChange={handleInputChange}
                            className="mr-2"
                            required
                          />
                          Mandiri
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="arrival_type"
                            value="rujukan"
                            checked={formData.arrival_type === 'rujukan'}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          Rujukan
                        </label>
                      </div>
                    </div>

                    {formData.arrival_type === 'rujukan' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sumber Rujukan *
                        </label>
                        <input
                          type="text"
                          name="referral_source"
                          value={formData.referral_source}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan sumber rujukan"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Metode Pembayaran *
                      </label>
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        required
                      >
                        <option value="">Pilih metode pembayaran</option>
                        <option value="tunai">Tunai</option>
                        <option value="bpjs">BPJS</option>
                        <option value="asuransi">Asuransi</option>
                      </select>
                    </div>

                    {formData.payment_method === 'bpjs' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nomor SEP
                        </label>
                        <input
                          type="text"
                          name="insurance_number"
                          value={formData.insurance_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan nomor SEP"
                        />
                      </div>
                    )}

                    {formData.payment_method === 'asuransi' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nomor Polis
                        </label>
                        <input
                          type="text"
                          name="insurance_number"
                          value={formData.insurance_number}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                          placeholder="Masukkan nomor polis"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catatan
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={closeRegistrationForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    {submitting ? 'Menyimpan...' : 'Simpan Registrasi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Registrasi */}
      {isDetailModalOpen && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Detail Registrasi</h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                {/* Info Utama */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Informasi Utama</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">No. Registrasi:</span>
                      <p className="font-mono text-gray-800 dark:text-white">{selectedRegistration.registration_no}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">No. Antrian:</span>
                      <p className="font-mono text-gray-800 dark:text-white">{selectedRegistration.queue_number}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRegistration.status)}`}>
                          {getStatusText(selectedRegistration.status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Tanggal Registrasi:</span>
                      <p className="text-gray-800 dark:text-white">{formatDateTime(selectedRegistration.created_at).date}</p>
                    </div>
                  </div>
                </div>

                {/* Data Pasien */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <FaUserPlus /> Data Pasien
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Nama:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.patient?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">MRN:</span>
                      <p className="font-mono text-gray-800 dark:text-white">{selectedRegistration.patient?.mrn || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">NIK:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.patient?.nik || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Tanggal Lahir:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.patient?.birth_date || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Telepon:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.patient?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Alamat:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.patient?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Detail Registrasi */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-green-200 flex items-center gap-2">
                    <FaHospital /> Detail Registrasi
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Unit Pelayanan:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.service_unit}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Jenis Kedatangan:</span>
                      <p className="text-gray-800 dark:text-white capitalize">{selectedRegistration.arrival_type}</p>
                    </div>
                    {selectedRegistration.referral_source && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Sumber Rujukan:</span>
                        <p className="text-gray-800 dark:text-white">{selectedRegistration.referral_source}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Metode Pembayaran:</span>
                      <p className="text-gray-800 dark:text-white capitalize">{selectedRegistration.payment_method}</p>
                    </div>
                    {selectedRegistration.insurance_number && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {selectedRegistration.payment_method === 'bpjs' ? 'No. SEP:' : 'No. Polis:'}
                        </span>
                        <p className="text-gray-800 dark:text-white">{selectedRegistration.insurance_number}</p>
                      </div>
                    )}
                    {selectedRegistration.doctor && (
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Dokter:</span>
                        <p className="text-gray-800 dark:text-white">{selectedRegistration.doctor.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Sistem */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Informasi Sistem</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Dibuat Oleh:</span>
                      <p className="text-gray-800 dark:text-white">{selectedRegistration.creator?.name || 'System'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Terakhir Update:</span>
                      <p className="text-gray-800 dark:text-white">{formatDateTime(selectedRegistration.updated_at).date}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Registrasi */}
      {isEditModalOpen && editingRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Registrasi</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                // Handle edit submission here
                console.log('Edit registration:', formData)
                closeEditModal()
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Pelayanan *
                    </label>
                    <select
                      name="service_unit"
                      value={formData.service_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                    >
                      <option value="">Pilih unit pelayanan</option>
                      <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
                      <option value="Poli Anak">Poli Anak</option>
                      <option value="Poli Kandungan">Poli Kandungan</option>
                      <option value="IGD">IGD</option>
                      <option value="Rawat Inap">Rawat Inap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status Registrasi *
                    </label>
                    <select
                      name="status"
                      value={editingRegistration.status}
                      onChange={(e) => {
                        // Update editing registration status
                        setEditingRegistration(prev => prev ? { ...prev, status: e.target.value as any } : null)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                    >
                      <option value="registered">Terdaftar</option>
                      <option value="checked-in">Check-in</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Catatan tambahan (opsional)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <FaCheckCircle />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
