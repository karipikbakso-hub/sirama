'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaShieldAlt, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaSort, FaSortUp, FaSortDown, FaPrint } from 'react-icons/fa'
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
  status: 'active' | 'inactive' | 'rejected'
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

type SEPForm = {
  patient_id: string
  registration_id: string
  bpjs_number: string
  service_type: string
  diagnosis: string
  notes: string
}

export default function SEPPatientPage() {
  const [seps, setSEPs] = useState<SEP[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [perPage, setPerPage] = useState(10)

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
    notes: ''
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

  // Fetch SEPs with pagination
  const fetchSEPs = async (page = 1, search = '', newPerPage?: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (newPerPage || perPage).toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await api.get(`/api/seps?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setSEPs(paginationData.data || [])
        setCurrentPage(paginationData.current_page || 1)
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
      } else {
        throw new Error(response.data.message || 'Failed to fetch SEPs')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load SEPs')
      console.error('Error fetching SEPs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSEPs()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        patient_id: formData.patient_id,
        registration_id: formData.registration_id,
        bpjs_number: formData.bpjs_number,
        service_type: formData.service_type,
        diagnosis: formData.diagnosis,
        notes: formData.notes
      }

      if (editingSEP) {
        await api.put(`/api/seps/${editingSEP.id}`, submitData)
      } else {
        await api.post('/api/seps', submitData)
      }

      await fetchSEPs() // Refresh data
      setShowForm(false)
      setFormData({
        patient_id: '',
        registration_id: '',
        bpjs_number: '',
        service_type: '',
        diagnosis: '',
        notes: ''
      })
      setPatientSearchTerm('')
      setRegistrationSearchTerm('')
      setSelectedPatient(null)
      setSelectedRegistration(null)
      setEditingSEP(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save SEP')
      console.error('Error saving SEP:', err)
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

  // Open form
  const handleTambah = () => {
    setFormData({
      patient_id: '',
      registration_id: '',
      bpjs_number: '',
      service_type: '',
      diagnosis: '',
      notes: ''
    })
    setEditingSEP(null)
    setPatientSearchTerm('')
    setRegistrationSearchTerm('')
    setSelectedPatient(null)
    setSelectedRegistration(null)
    setShowForm(true)
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setPatientSearchTerm('')
    setRegistrationSearchTerm('')
    setSelectedPatient(null)
    setSelectedRegistration(null)
  }

  // Search patients
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

  // Search registrations
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

  // Handle edit SEP
  const handleEdit = (sep: SEP) => {
    setEditingSEP(sep)
    setFormData({
      patient_id: sep.patient_id.toString(),
      registration_id: sep.registration_id.toString(),
      bpjs_number: sep.bpjs_number,
      service_type: sep.service_type,
      diagnosis: sep.diagnosis,
      notes: sep.notes || ''
    })
    const patient = sep.patient
    const registration = sep.registration
    const patientName = patient?.name || 'N/A'
    const patientMRN = patient?.mrn || 'N/A'
    const registrationNo = registration?.registration_no || 'N/A'

    setPatientSearchTerm(`${patientName} - ${patientMRN}`)
    setRegistrationSearchTerm(`${registrationNo} - ${patientName}`)
    setSelectedPatient(patient || null)
    setSelectedRegistration(registration || null)
    setShowForm(true)
  }

  // Handle delete SEP
  const handleDelete = async (sepId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus SEP ini?')) return

    try {
      await api.delete(`/api/seps/${sepId}`)
      await fetchSEPs() // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete SEP')
      console.error('Error deleting SEP:', err)
    }
  }

  // Handle print SEP
  const handleCetak = (sep: SEP) => {
    // Create print content for SEP
    const patientName = sep.patient?.name || 'N/A'
    const patientMRN = sep.patient?.mrn || 'N/A'
    const statusText = sep.status === 'active' ? 'AKTIF' :
                      sep.status === 'inactive' ? 'NONAKTIF' :
                      sep.status === 'rejected' ? 'DITOLAK' : 'N/A'

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SEP - ${patientName}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .sep {
              max-width: 400px;
              margin: 0 auto;
              border: 2px solid #2563eb;
              border-radius: 10px;
              padding: 20px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .hospital-name {
              font-size: 16px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 3px;
            }
            .sep-title {
              font-size: 12px;
              color: #666;
            }
            .sep-number {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin: 15px 0;
              padding: 10px;
              background: #f0f9ff;
              border-radius: 8px;
              border: 2px solid #2563eb;
            }
            .info-section {
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              margin-bottom: 6px;
            }
            .label {
              font-weight: bold;
              width: 100px;
              color: #333;
              font-size: 11px;
            }
            .value {
              color: #666;
              font-size: 11px;
            }
            .service-type {
              text-align: center;
              font-weight: bold;
              color: #2563eb;
              margin: 15px 0;
              padding: 8px;
              background: #f8fafc;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              font-size: 10px;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            .status {
              text-align: center;
              margin: 10px 0;
              padding: 5px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 12px;
            }
            .status-active { background: #dcfce7; color: #166534; }
            .status-inactive { background: #f3f4f6; color: #374151; }
            .status-rejected { background: #fee2e2; color: #dc2626; }
            @media print {
              body { margin: 0; }
              .sep { border: none; max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="sep">
            <div class="header">
              <div class="hospital-name">RUMAH SAKIT SIRAMA</div>
              <div class="sep-title">SURAT ELIGIBILITAS PESERTA</div>
            </div>

            <div class="sep-number">
              ${sep.sep_number}
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Nama:</span>
                <span class="value">${patientName}</span>
              </div>
              <div class="info-row">
                <span class="label">MRN:</span>
                <span class="value">${patientMRN}</span>
              </div>
              <div class="info-row">
                <span class="label">BPJS:</span>
                <span class="value">${sep.bpjs_number}</span>
              </div>
              <div class="info-row">
                <span class="label">Diagnosis:</span>
                <span class="value">${sep.diagnosis}</span>
              </div>
            </div>

            <div class="service-type">
              ${sep.service_type}
            </div>

            <div class="status status-${sep.status}">
              ${statusText}
            </div>

            <div class="footer">
              <div>Dibuat pada: ${new Date(sep.created_at).toLocaleString('id-ID')}</div>
              <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
              <div>SEP ini berlaku untuk pelayanan kesehatan sesuai ketentuan BPJS</div>
            </div>
          </div>
        </body>
      </html>
    `

    // Open print window
    const printWindow = window.open('', '_blank', 'width=500,height=700')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    } else {
      alert('Popup blocker mungkin aktif. Silakan izinkan popup untuk mencetak SEP.')
    }
  }

  // Filter SEPs based on search
  const filteredSEPs = seps.filter(sep => {
    const patient = sep.patient
    const searchLower = searchTerm.toLowerCase()
    return (
      (patient?.name || '').toLowerCase().includes(searchLower) ||
      (patient?.mrn || '').toLowerCase().includes(searchLower) ||
      sep.sep_number.toLowerCase().includes(searchLower)
    )
  })

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Nonaktif'
      case 'rejected': return 'Ditolak'
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
  const columns = useMemo<ColumnDef<SEP>[]>(() => [
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
            <span className="text-xs text-gray-500 md:hidden">{patient?.mrn || 'N/A'}</span>
          </div>
        )
      },
      filterFn: 'includesString',
    },
    {
      accessorKey: 'patient.mrn',
      header: 'No. Rekam Medis',
      cell: ({ row }) => {
        const patient = row.original.patient
        return (
          <span className="hidden md:inline">{patient?.mrn || 'N/A'}</span>
        )
      },
      filterFn: 'includesString',
    },
    {
      accessorKey: 'sep_number',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>No. SEP</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium font-mono">{row.original.sep_number}</span>
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
        <span className="hidden sm:inline">{formatDateTime(row.original.created_at).date}</span>
      ),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'service_type',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Jenis Pelayanan</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{row.original.service_type}</span>
      ),
      filterFn: 'includesString',
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
        <span className="hidden md:inline">{row.original.diagnosis}</span>
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
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleCetak(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Cetak SEP"
          >
            <FaPrint />
          </button>
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Edit SEP"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 text-white bg-red-500 hover:bg-red-600 border border-red-500 rounded-lg transition"
            title="Hapus SEP"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ], [])

  // TanStack Table instance
  const table = useReactTable({
    data: seps,
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
          <p className="text-gray-600 dark:text-gray-400">Memuat data SEP...</p>
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
        <FaShieldAlt className="text-blue-500" />
        <span className="truncate">Surat Eligibilitas Peserta (SEP)</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
            onClick={handleTambah}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2"
          >
            <FaShieldAlt />
            <span className="hidden sm:inline">Buat SEP Baru</span>
            <span className="sm:hidden">SEP Baru</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-zinc-700 text-left">
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
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
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
                    Tidak ada data SEP.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredSEPs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaShieldAlt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada SEP yang ditemukan</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalRecords)} dari {totalRecords} SEP
            </div>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => fetchSEPs(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ‹ Sebelumnya
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchSEPs(pageNum)}
                      className={`px-3 py-2 border rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white border-indigo-600'
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
                onClick={() => fetchSEPs(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Selanjutnya ›
              </button>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tampilkan:</span>
              <select
                title="Jumlah data per halaman"
                value={perPage}
                onChange={(e) => {
                  const newPerPage = Number(e.target.value)
                  setPerPage(newPerPage)
                  setCurrentPage(1)
                  fetchSEPs(1, '', newPerPage)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik SEP</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Aktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {seps.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Nonaktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {seps.filter(s => s.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Ditolak</p>
              <p className="text-lg md:text-2xl font-bold">
                {seps.filter(s => s.status === 'rejected').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total SEP</p>
              <p className="text-lg md:text-2xl font-bold">{seps.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Jenis Pelayanan</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Rawat Jalan</span>
              <span className="font-bold">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rawat Inap</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rawat Darurat</span>
              <span className="font-bold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Prosedur</span>
              <span className="font-bold">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingSEP ? 'Edit SEP' : 'Buat SEP Baru'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
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
                                bpjs_number: patient.bpjs_number || ''
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
                        Tidak ada pasien ditemukan
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
                        placeholder="Ketik nomor registrasi atau nama pasien..."
                        value={registrationSearchTerm}
                        onChange={(e) => {
                          setRegistrationSearchTerm(e.target.value)
                          setShowRegistrationDropdown(true)
                          if (e.target.value.length > 1) {
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

                    {/* Search Results Dropdown */}
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

                    {/* No results message */}
                    {registrationSearchTerm.length > 1 && !searchingRegistrations && registrationSearchResults.length === 0 && showRegistrationDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 text-center text-gray-500 dark:text-gray-400">
                        Tidak ada registrasi ditemukan
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
                      placeholder="Masukkan nomor BPJS"
                      required
                    />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jenis Pelayanan *
                    </label>
                    <select
                      title="Pilih jenis pelayanan"
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                    >
                      <option value="">Pilih jenis pelayanan</option>
                      <option value="Rawat Jalan">Rawat Jalan</option>
                      <option value="Rawat Inap">Rawat Inap</option>
                      <option value="Rawat Darurat">Rawat Darurat</option>
                      <option value="Prosedur">Prosedur</option>
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Catatan tambahan (opsional)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedPatient || !selectedRegistration}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
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
