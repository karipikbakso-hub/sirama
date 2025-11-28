'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaShieldAlt, FaSearch, FaFilter, FaDownload, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationTriangle, FaPrint, FaEye, FaCheck, FaTimes, FaCalendarAlt, FaChartBar } from 'react-icons/fa'
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
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  validation_status: 'valid' | 'invalid' | 'not_checked'
  expiry_date: string
  created_at: string
  validated_at?: string
  flagged_reason?: string
  is_expired: boolean
  is_suspicious: boolean
  patient?: {
    id: number
    name: string
    mrn: string
  }
  registration?: {
    id: number
    registration_no: string
  }
  dpjp?: {
    id: number
    name: string
  }
  poli?: {
    id: number
    name: string
  }
  validation_badge: [string, string]
}

type FilterOptions = {
  date_from: string
  date_to: string
  status: string
  validation_status: string
  service_type: string
  poli_id: string
  doctor_id: string
}

export default function SEPValidationPage() {
  const [seps, setSEPs] = useState<SEP[]>([])
  const [loading, setLoading] = useState(false)
  const [validationLoading, setValidationLoading] = useState<Set<number>>(new Set())
  const [statistics, setStatistics] = useState({
    total_seps: 0,
    valid: 0,
    invalid: 0,
    not_checked: 0,
    expired_soon: 0,
    suspicious: 0,
    validation_rate: 0
  })
  const [filters, setFilters] = useState<FilterOptions>({
    date_from: '',
    date_to: '',
    status: '',
    validation_status: '',
    service_type: '',
    poli_id: '',
    doctor_id: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedSEP, setSelectedSEP] = useState<SEP | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)

  // Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Fetch SEPs
  const fetchSEPs = async (newFilters = filters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      // Add pagination
      params.append('per_page', '50')

      // Add filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/api/seps?${params}`)
      if (response.data.success) {
        setSEPs(response.data.data.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching SEPs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await api.get('/api/seps/statistics')
      if (response.data.success) {
        setStatistics(response.data.data)
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error)
    }
  }

  useEffect(() => {
    fetchSEPs()
    fetchStatistics()
  }, [])

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    fetchSEPs()
  }

  const resetFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      status: '',
      validation_status: '',
      service_type: '',
      poli_id: '',
      doctor_id: ''
    })
    fetchSEPs({
      date_from: '',
      date_to: '',
      status: '',
      validation_status: '',
      service_type: '',
      poli_id: '',
      doctor_id: ''
    })
  }

  // Validation functions
  const validateSEP = async (sep: SEP) => {
    if (!sep) return

    setValidationLoading(prev => new Set([...prev, sep.id]))

    try {
      const response = await api.post(`/api/seps/${sep.id}/validate`)
      if (response.data.success) {
        await fetchSEPs() // Refresh data
        await fetchStatistics() // Refresh statistics

        // Show result briefly
        setValidationResult(response.data.data)
        setSelectedSEP(sep)
        setShowDetailModal(true)

        setTimeout(() => setValidationResult(null), 5000)
      }
    } catch (error: any) {
      console.error('Error validating SEP:', error)
    } finally {
      setValidationLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(sep.id)
        return newSet
      })
    }
  }

  const bulkValidateSEPs = async (sepIds: number[]) => {
    try {
      const response = await api.post('/api/seps/bulk-validate', { sep_ids: sepIds })
      if (response.data.success) {
        await fetchSEPs()
        await fetchStatistics()
      }
    } catch (error: any) {
      console.error('Error bulk validating SEPs:', error)
    }
  }

  const flagSuspiciousSEP = async (sep: SEP, reason: string) => {
    try {
      await api.post(`/api/seps/${sep.id}/flag-suspicious`, { reason })
      await fetchSEPs()
      await fetchStatistics()
    } catch (error: any) {
      console.error('Error flagging suspicious SEP:', error)
    }
  }

  // Export functions
  const exportToExcel = () => {
    // Implementation for Excel export
    console.log('Export to Excel')
  }

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Export to PDF')
  }

  // Print SEP
  const printSEP = (sep: SEP) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SEP - ${sep.patient?.name || 'N/A'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .sep { max-width: 600px; margin: 0 auto; border: 2px solid #2563eb; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px; }
            .hospital-name { font-size: 18px; font-weight: bold; color: #2563eb; }
            .sep-title { font-size: 12px; color: #666; }
            .sep-number { text-align: center; font-size: 28px; font-weight: bold; color: #2563eb; margin: 15px 0; padding: 15px; background: #f0f9ff; border-radius: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
            .info-item { margin-bottom: 5px; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; }
            .service-type { text-align: center; font-weight: bold; color: #2563eb; margin: 15px 0; padding: 10px; background: #f8fafc; border-radius: 5px; }
            .validation-status { text-align: center; margin: 15px 0; padding: 8px; border-radius: 5px; font-weight: bold; }
            .valid { background: #dcfce7; color: #166534; }
            .invalid { background: #fee2e2; color: #dc2626; }
            .not-checked { background: #fef3c7; color: #92400e; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
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

            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nama Pasien:</span><br>
                <span class="value">${sep.patient?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">No. MRN:</span><br>
                <span class="value">${sep.patient?.mrn || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">No. BPJS:</span><br>
                <span class="value">${sep.bpjs_number}</span>
              </div>
              <div class="info-item">
                <span class="label">No. Registrasi:</span><br>
                <span class="value">${sep.registration?.registration_no || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">DPJP:</span><br>
                <span class="value">${sep.dpjp?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Poli:</span><br>
                <span class="value">${sep.poli?.name || 'N/A'}</span>
              </div>
            </div>

            <div class="service-type">
              ${sep.service_type}
            </div>

            <div class="validation-status ${sep.validation_status.replace('_', '-') || 'not-checked'}">
              Status Validasi: ${sep.validation_badge[0] || 'Belum Dicek'}
            </div>

            <div style="margin-top: 15px;">
              <span class="label">Diagnosa:</span><br>
              <span class="value">${sep.diagnosis}</span>
            </div>

            <div style="margin-top: 10px;">
              <span class="label">Tanggal Pembuatan:</span>
              <span class="value">${new Date(sep.created_at).toLocaleDateString('id-ID')}</span>
            </div>

            ${sep.validated_at ? `
            <div style="margin-top: 5px;">
              <span class="label">Terakhir Divalidasi:</span>
              <span class="value">${new Date(sep.validated_at).toLocaleDateString('id-ID')}</span>
            </div>
            ` : ''}

            <div class="footer">
              <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
              <div>SEP ini berlaku untuk pelayanan kesehatan sesuai ketentuan BPJS</div>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  // Table columns
  const columns = useMemo<ColumnDef<SEP>[]>(() => [
    {
      accessorKey: 'sep_number',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>No. SEP</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.sep_number}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Tanggal SEP</span>
        </div>
      ),
      cell: ({ row }) => (
        <span>{new Date(row.original.created_at).toLocaleDateString('id-ID')}</span>
      ),
    },
    {
      accessorKey: 'bpjs_number',
      header: 'No. Kartu BPJS',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.bpjs_number}</span>
      ),
    },
    {
      accessorKey: 'patient.name',
      header: 'Nama Pasien',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.patient?.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{row.original.patient?.mrn || 'N/A'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'poli.name',
      header: 'Poli',
      cell: ({ row }) => (
        <span>{row.original.poli?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'diagnosis',
      header: 'Diagnosa',
      cell: ({ row }) => (
        <span className="truncate max-w-32" title={row.original.diagnosis}>{row.original.diagnosis}</span>
      ),
    },
    {
      accessorKey: 'dpjp.name',
      header: 'DPJP',
      cell: ({ row }) => (
        <span>{row.original.dpjp?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const expiryClass = row.original.is_expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${expiryClass}`}>
            {status === 'active' ? 'Aktif' :
             status === 'inactive' ? 'Nonaktif' :
             status === 'cancelled' ? 'Dibatalkan' :
             status === 'expired' ? 'Kadaluarsa' : status}
          </span>
        )
      },
    },
    {
      accessorKey: 'validation_status',
      header: 'Status Validasi',
      cell: ({ row }) => {
        const [text, color] = row.original.validation_badge || ['N/A', 'gray']
        const isLoading = validationLoading.has(row.original.id)

        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
              {text}
            </span>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => validateSEP(row.original)}
            disabled={validationLoading.has(row.original.id)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Validasi SEP"
          >
            <FaCheckCircle />
          </button>
          <button
            onClick={() => {
              setSelectedSEP(row.original)
              setShowDetailModal(true)
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
            title="Lihat Detail"
          >
            <FaEye />
          </button>
          <button
            onClick={() => printSEP(row.original)}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
            title="Cetak SEP"
          >
            <FaPrint />
          </button>
          {row.original.is_suspicious && (
            <button
              onClick={() => {
                const reason = prompt('Masukkan alasan menandai sebagai suspicious:')
                if (reason) flagSuspiciousSEP(row.original, reason)
              }}
              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
              title="Tandai Suspicious"
            >
              <FaExclamationTriangle />
            </button>
          )}
        </div>
      ),
    },
  ], [validationLoading])

  // Table instance
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
  })

  // Get selected rows for bulk actions
  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
          <FaShieldAlt className="text-blue-500" />
          <span>SEP Validation & Monitoring</span>
        </h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
          >
            <FaFilter className="text-sm" />
            Filter
          </button>

          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <FaDownload />
            Excel
          </button>

          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            <FaDownload />
            PDF
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total SEP</p>
              <p className="text-2xl font-bold">{statistics.total_seps}</p>
            </div>
            <FaChartBar className="text-blue-500 h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valid</p>
              <p className="text-2xl font-bold text-green-600">{statistics.valid}</p>
              <p className="text-sm text-gray-500">({Math.round(statistics.validation_rate)}%)</p>
            </div>
            <FaCheckCircle className="text-green-500 h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Belum Dicek</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.not_checked}</p>
            </div>
            <FaClock className="text-yellow-500 h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kadaluarsa 3 Hari</p>
              <p className="text-2xl font-bold text-red-600">{statistics.expired_soon}</p>
            </div>
            <FaExclamationTriangle className="text-red-500 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-6 border border-gray-200 dark:border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Dari</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Sampai</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status SEP</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="cancelled">Dibatalkan</option>
                <option value="expired">Kadaluarsa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status Validasi</label>
              <select
                value={filters.validation_status}
                onChange={(e) => handleFilterChange('validation_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
              >
                <option value="">Semua</option>
                <option value="valid">Valid</option>
                <option value="invalid">Invalid</option>
                <option value="not_checked">Belum Dicek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Jenis Pelayanan</label>
              <select
                value={filters.service_type}
                onChange={(e) => handleFilterChange('service_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
              >
                <option value="">Semua</option>
                <option value="Rawat Jalan">Rawat Jalan</option>
                <option value="Rawat Inap">Rawat Inap</option>
                <option value="Rawat Darurat">Rawat Darurat</option>
                <option value="Prosedur">Prosedur</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1 opacity-0">Actions</label>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Terapkan
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedRows.length} SEP dipilih
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkValidateSEPs(selectedRows.map(s => s.id))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Validasi Terpilih
              </button>
              <button
                onClick={() => setRowSelection({})}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : seps.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data SEP ditemukan
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {seps.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} hingga{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, seps.length)} dari {seps.length} hasil
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded text-sm disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded text-sm disabled:opacity-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSEP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Detail SEP</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">No. SEP</label>
                    <p className="text-lg font-mono">{selectedSEP.sep_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Tanggal SEP</label>
                    <p>{new Date(selectedSEP.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nama Pasien</label>
                    <p>{selectedSEP.patient?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">No. BPJS</label>
                    <p className="font-mono">{selectedSEP.bpjs_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Jenis Pelayanan</label>
                    <p>{selectedSEP.service_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSEP.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedSEP.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSEP.status === 'active' ? 'Aktif' :
                       selectedSEP.status === 'inactive' ? 'Nonaktif' :
                       selectedSEP.status === 'cancelled' ? 'Dibatalkan' :
                       'Kadaluarsa'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Diagnosa</label>
                  <p className="p-3 bg-gray-50 dark:bg-zinc-800 rounded">{selectedSEP.diagnosis}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Status Validasi</label>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedSEP.validation_status === 'valid' ? 'bg-green-100 text-green-800' :
                      selectedSEP.validation_status === 'invalid' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedSEP.validation_badge[0] || 'Belum Dicek'}
                    </span>
                    {validationResult && (
                      <span className="text-sm text-blue-600">Divalidasi baru saja</span>
                    )}
                  </div>
                </div>

                {selectedSEP.flagged_reason && (
                  <div>
                    <label className="block text-sm font-medium text-red-600 mb-1">Alasan Ditandai Suspicious</label>
                    <p className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      {selectedSEP.flagged_reason}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => validateSEP(selectedSEP)}
                    disabled={validationLoading.has(selectedSEP.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {validationLoading.has(selectedSEP.id) ? 'Memvalidasi...' : 'Validasi Ulang'}
                  </button>
                  <button
                    onClick={() => printSEP(selectedSEP)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <FaPrint className="inline mr-2" />
                    Cetak
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
