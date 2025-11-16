'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FaShieldAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaPrint,
  FaUserCheck,
  FaLink,
  FaDatabase,
  FaClock,
  FaChartBar,
  FaSync,
  FaIdCard,
  FaHospital,
  FaCalendarAlt,
  FaUserMd,
  FaStethoscope,
  FaFileMedical,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaExternalLinkAlt
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
  }
  registration?: {
    id: number
    registration_no: string
    created_at: string
  }
}

type BPJSValidationResult = {
  participant?: {
    nama?: string
    nik?: string
    noKartu?: string
    tglLahir?: string
    statusPeserta?: {
      kode?: string
      keterangan?: string
    }
    jenisPeserta?: {
      kode?: string
      keterangan?: string
    }
    hakKelas?: {
      kode?: string
      keterangan?: string
    }
  }
  existing_patient?: any
  is_registered: boolean
  response_time: number
}

type SEPForm = {
  patient_id: string
  registration_id: string
  bpjs_number: string
  service_type: string
  diagnosis: string
  notes: string
  create_bpjs_sep: boolean
}

export default function BPJSBridgingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'validation' | 'sep-management'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [perPage, setPerPage] = useState(10)

  // BPJS Validation states
  const [validationIdentifier, setValidationIdentifier] = useState('')
  const [validationType, setValidationType] = useState<'nik' | 'bpjs'>('bpjs')
  const [validationResult, setValidationResult] = useState<BPJSValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingSEP, setEditingSEP] = useState<SEP | null>(null)
  const [formData, setFormData] = useState<SEPForm>({
    patient_id: '',
    registration_id: '',
    bpjs_number: '',
    service_type: '',
    diagnosis: '',
    notes: '',
    create_bpjs_sep: true
  })

  // Patient and registration search states
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [searchingPatients, setSearchingPatients] = useState(false)

  const [registrationSearchTerm, setRegistrationSearchTerm] = useState('')
  const [registrationSearchResults, setRegistrationSearchResults] = useState<any[]>([])
  const [showRegistrationDropdown, setShowRegistrationDropdown] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null)
  const [searchingRegistrations, setSearchingRegistrations] = useState(false)

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const queryClient = useQueryClient()

  // API calls with React Query
  const { data: bpjsDashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['bpjs-dashboard'],
    queryFn: async () => {
      const response = await api.get('api/seps/bpjs-dashboard')
      return response.data.data
    },
    enabled: activeTab === 'dashboard'
  })

  const { data: seps, isLoading: sepsLoading, refetch: refetchSEPs } = useQuery({
    queryKey: ['seps', currentPage, perPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await api.get(`/api/seps?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
        return paginationData.data || []
      }
      return []
    },
    enabled: activeTab === 'sep-management'
  })

  // Mutations
  const validateParticipantMutation = useMutation({
    mutationFn: async (data: { identifier: string; type: 'nik' | 'bpjs' }) => {
      const response = await api.post('api/seps/validate-participant', data)
      return response.data
    },
    onSuccess: (result) => {
      if (result.success) {
        setValidationResult(result.data)
      }
    }
  })

  const createSEPMutation = useMutation({
    mutationFn: async (data: SEPForm) => {
      const response = await api.post('api/seps/create-with-bpjs', data)
      return response.data
    },
    onSuccess: () => {
      refetchSEPs()
      setActiveTab('sep-management')
      setShowForm(false)
      resetForm()
    }
  })

  const deleteSEPMutation = useMutation({
    mutationFn: async (sepId: number) => {
      const response = await api.delete(`api/seps/${sepId}`)
      return response.data
    },
    onSuccess: () => {
      refetchSEPs()
    }
  })

  // Helper functions
  const resetForm = () => {
    setFormData({
      patient_id: '',
      registration_id: '',
      bpjs_number: '',
      service_type: '',
      diagnosis: '',
      notes: '',
      create_bpjs_sep: true
    })
    setPatientSearchTerm('')
    setRegistrationSearchTerm('')
    setSelectedPatient(null)
    setSelectedRegistration(null)
    setEditingSEP(null)
  }

  const handleValidation = async () => {
    if (!validationIdentifier.trim()) return

    setIsValidating(true)
    try {
      await validateParticipantMutation.mutateAsync({
        identifier: validationIdentifier,
        type: validationType
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleCreateSEP = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await createSEPMutation.mutateAsync(formData)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSEP = async (sepId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus SEP ini?')) return
    await deleteSEPMutation.mutateAsync(sepId)
  }

  // Search functions
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

  const searchRegistrations = async (query: string) => {
    if (query.length < 2) return
    setSearchingRegistrations(true)
    try {
      const response = await api.get(`/api/registrations?search=${encodeURIComponent(query)}&per_page=10`)
      if (response.data.success) {
        setRegistrationSearchResults(response.data.data.data || [])
      }
    } catch (err: any) {
      console.error('Error searching registrations:', err)
      setRegistrationSearchResults([])
    } finally {
      setSearchingRegistrations(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Status helpers
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
            <span className="text-xs text-gray-500">{patient?.mrn || 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'sep_number',
      header: 'No. SEP',
      cell: ({ row }) => (
        <span className="font-medium font-mono">{row.original.sep_number}</span>
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
        <span>{row.original.service_type}</span>
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
        <div className="flex gap-1">
          <button
            onClick={() => handleDeleteSEP(row.original.id)}
            disabled={deleteSEPMutation.isPending}
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-50"
            title="Hapus SEP"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ),
    },
  ], [])

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
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaLink className="text-blue-500" />
        <span className="truncate">BPJS Bridging Dashboard</span>
      </h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
            activeTab === 'dashboard'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaChartBar className="inline mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
            activeTab === 'validation'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaUserCheck className="inline mr-2" />
          Validasi BPJS
        </button>
        <button
          onClick={() => setActiveTab('sep-management')}
          className={`flex-1 px-4 py-2 rounded-xl font-medium transition ${
            activeTab === 'sep-management'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaShieldAlt className="inline mr-2" />
          Kelola SEP
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SEP Hari Ini</p>
                  <p className="text-2xl font-bold">
                    {dashboardLoading ? '...' : (bpjsDashboard?.sep_stats?.total_today || 0)}
                  </p>
                </div>
                <FaShieldAlt className="text-2xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SEP Aktif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardLoading ? '...' : (bpjsDashboard?.sep_stats?.active_today || 0)}
                  </p>
                </div>
                <FaCheckCircle className="text-2xl text-green-500" />
              </div>
            </div>

            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu BPJS</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardLoading ? '...' : (bpjsDashboard?.sep_stats?.pending_bpjs_today || 0)}
                  </p>
                </div>
                <FaClock className="text-2xl text-yellow-500" />
              </div>
            </div>

            <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Response Time</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardLoading ? '...' : `${bpjsDashboard?.api_stats?.average_response_time || 0}ms`}
                  </p>
                </div>
                <FaSync className="text-2xl text-purple-500" />
              </div>
            </div>
          </div>

          {/* Service Type Distribution */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Distribusi Jenis Pelayanan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboardLoading ? (
                <div className="col-span-full text-center py-8">Loading...</div>
              ) : bpjsDashboard?.service_type_distribution && Object.keys(bpjsDashboard.service_type_distribution).length > 0 ? (
                Object.entries(bpjsDashboard.service_type_distribution).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{type}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">Belum ada data distribusi</div>
              )}
            </div>
          </div>

          {/* Recent SEPs */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">SEP Terbaru</h2>
            <div className="space-y-3">
              {dashboardLoading ? (
                <div className="text-center py-8">Loading recent SEPs...</div>
              ) : bpjsDashboard?.recent_seps?.length > 0 ? (
                bpjsDashboard.recent_seps.map((sep: SEP) => (
                  <div key={sep.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FaFileMedical className="text-blue-500" />
                      <div>
                        <div className="font-medium">{sep.patient?.name}</div>
                        <div className="text-sm text-gray-500">{sep.sep_number}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sep.status)}`}>
                        {getStatusText(sep.status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(sep.created_at).date}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">Belum ada SEP hari ini</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BPJS Validation Tab */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          {/* Validation Form */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <FaUserCheck className="text-blue-500" />
              Validasi Peserta BPJS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Identitas
                </label>
                <select
                  value={validationType}
                  onChange={(e) => setValidationType(e.target.value as 'nik' | 'bpjs')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  aria-label="Tipe identitas untuk validasi"
                >
                  <option value="bpjs">Nomor BPJS</option>
                  <option value="nik">NIK</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {validationType === 'bpjs' ? 'Nomor BPJS' : 'NIK'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={validationIdentifier}
                    onChange={(e) => setValidationIdentifier(e.target.value)}
                    placeholder={validationType === 'bpjs' ? 'Masukkan nomor BPJS 16 digit' : 'Masukkan NIK 16 digit'}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  />
                  <button
                    onClick={handleValidation}
                    disabled={isValidating || !validationIdentifier.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {isValidating ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  Hasil Validasi
                </h3>

                {validationResult.participant ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Data Peserta</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nama:</span>
                          <span className="font-medium">{validationResult.participant.nama || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">NIK:</span>
                          <span className="font-mono">{validationResult.participant.nik || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">No. Kartu:</span>
                          <span className="font-mono">{validationResult.participant.noKartu || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={validationResult.participant.statusPeserta?.kode === '0' ? 'text-green-600' : 'text-red-600'}>
                            {validationResult.participant.statusPeserta?.keterangan || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Status & Hak</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Jenis Peserta:</span>
                          <span>{validationResult.participant.jenisPeserta?.keterangan || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Hak Kelas:</span>
                          <span>{validationResult.participant.hakKelas?.keterangan || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
                          <span className="text-green-600">{validationResult.response_time}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Terdaftar di Sistem:</span>
                          <span className={validationResult.is_registered ? 'text-green-600' : 'text-red-600'}>
                            {validationResult.is_registered ? 'Ya' : 'Tidak'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-red-600">
                    <FaTimes className="mx-auto text-2xl mb-2" />
                    Data peserta tidak ditemukan atau terjadi kesalahan
                  </div>
                )}

                {validationResult.is_registered && validationResult.existing_patient && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCheck className="text-green-600" />
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Pasien sudah terdaftar: {validationResult.existing_patient.name}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          MRN: {validationResult.existing_patient.mrn}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('sep-management')}
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-3"
            >
              <FaShieldAlt className="text-xl" />
              <div className="text-left">
                <div className="font-medium">Buat SEP Baru</div>
                <div className="text-sm opacity-90">Dengan data BPJS yang tervalidasi</div>
              </div>
            </button>

            <button
              onClick={() => {/* TODO: Implement bulk validation */}}
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-3"
            >
              <FaDatabase className="text-xl" />
              <div className="text-left">
                <div className="font-medium">Validasi Massal</div>
                <div className="text-sm opacity-90">Validasi multiple peserta</div>
              </div>
            </button>

            <button
              onClick={() => {/* TODO: Implement patient sync */}}
              className="p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition flex items-center gap-3"
            >
              <FaSync className="text-xl" />
              <div className="text-left">
                <div className="font-medium">Sinkronisasi Data</div>
                <div className="text-sm opacity-90">Update data dari BPJS</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* SEP Management Tab */}
      {activeTab === 'sep-management' && (
        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari SEP..."
                  className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                <FaPlus />
                <span className="hidden sm:inline">Buat SEP Baru</span>
              </button>
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

      {/* SEP Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingSEP ? 'Edit SEP' : 'Buat SEP Baru dengan BPJS'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateSEP}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Patient Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cari Pasien *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ketik nama atau MRN pasien..."
                        value={patientSearchTerm}
                        onChange={(e) => {
                          setPatientSearchTerm(e.target.value)
                          setShowPatientDropdown(true)
                          if (e.target.value.length > 2) {
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

                    {/* Patient Search Results */}
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
                                bpjs_number: patient.bpjs_number || ''
                              }))
                              setPatientSearchTerm(`${patient.name} - ${patient.mrn}`)
                              setShowPatientDropdown(false)
                            }}
                          >
                            <div className="font-medium text-gray-800 dark:text-white">{patient.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              MRN: {patient.mrn} | BPJS: {patient.bpjs_number || 'N/A'}
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
                              MRN: {selectedPatient.mrn} | BPJS: {selectedPatient.bpjs_number || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Registration Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cari Registrasi *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ketik nomor registrasi..."
                        value={registrationSearchTerm}
                        onChange={(e) => {
                          setRegistrationSearchTerm(e.target.value)
                          setShowRegistrationDropdown(true)
                          if (e.target.value.length > 2) {
                            searchRegistrations(e.target.value)
                          } else {
                            setRegistrationSearchResults([])
                          }
                        }}
                        onFocus={() => setShowRegistrationDropdown(true)}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      />
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      {searchingRegistrations && (
                        <FaSpinner className="absolute right-3 top-3 animate-spin text-gray-400" />
                      )}
                    </div>

                    {/* Registration Search Results */}
                    {showRegistrationDropdown && registrationSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {registrationSearchResults.map((registration) => (
                          <div
                            key={registration.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setFormData(prev => ({
                                ...prev,
                                registration_id: registration.id.toString()
                              }))
                              setRegistrationSearchTerm(`${registration.registration_no} - ${registration.patient?.name || 'N/A'}`)
                              setShowRegistrationDropdown(false)
                            }}
                          >
                            <div className="font-medium text-gray-800 dark:text-white">{registration.registration_no}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Pasien: {registration.patient?.name || 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Registration Display */}
                    {selectedRegistration && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-blue-600" />
                          <div>
                            <div className="font-medium text-blue-800 dark:text-blue-200">
                              Registrasi Ditemukan: {selectedRegistration.registration_no}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-300">
                              Pasien: {selectedRegistration.patient?.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BPJS Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nomor BPJS *
                    </label>
                    <input
                      type="text"
                      name="bpjs_number"
                      value={formData.bpjs_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Masukkan nomor BPJS 16 digit"
                      required
                    />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jenis Pelayanan *
                    </label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                      aria-label="Jenis pelayanan"
                    >
                      <option value="">Pilih jenis pelayanan</option>
                      <option value="Rawat Jalan">Rawat Jalan</option>
                      <option value="Rawat Inap">Rawat Inap</option>
                      <option value="Rawat Darurat">Rawat Darurat</option>
                    </select>
                  </div>

                  {/* Diagnosis */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diagnosis *
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Masukkan diagnosis"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>

                  {/* Create BPJS SEP Checkbox */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="create_bpjs_sep"
                        checked={formData.create_bpjs_sep}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Buat SEP di BPJS Kesehatan
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Centang untuk langsung membuat SEP di sistem BPJS Kesehatan
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    {submitting ? 'Menyimpan...' : 'Buat SEP'}
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
