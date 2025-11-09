'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaCheck, FaPrint, FaPlus, FaList, FaSearch, FaEdit, FaEye, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'
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

type Queue = {
  id: number
  patient_id: number
  queue_number: string
  service_unit: string
  status: 'registered' | 'checked-in' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  patient?: {
    id: number
    mrn: string
    name: string
  }
}

type QueueForm = {
  patient_id: string
  service_unit: string
  notes: string
}

export default function AntrianPage() {
  const [queues, setQueues] = useState<Queue[]>([])
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
  const [formData, setFormData] = useState<QueueForm>({
    patient_id: '',
    service_unit: '',
    notes: ''
  })

  // Patient search states
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [searchingPatients, setSearchingPatients] = useState(false)

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Fetch queues with pagination
  const fetchQueues = async (page = 1, search = '', newPerPage?: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (newPerPage || perPage).toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await api.get(`/api/queue-list?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setQueues(paginationData.data || [])
        setCurrentPage(paginationData.current_page || 1)
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
      } else {
        throw new Error(response.data.message || 'Failed to fetch queues')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load queues')
      console.error('Error fetching queues:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueues()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await api.post('/api/registrations', {
        patient_id: formData.patient_id,
        service_unit: formData.service_unit,
        arrival_type: 'mandiri',
        payment_method: 'tunai',
        notes: formData.notes
      })

      if (response.data.success) {
        await fetchQueues() // Refresh data
        setShowForm(false)
        setFormData({
          patient_id: '',
          service_unit: '',
          notes: ''
        })
        setPatientSearchTerm('')
        setSelectedPatient(null)
      } else {
        throw new Error(response.data.message || 'Failed to create queue')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create queue')
      console.error('Error creating queue:', err)
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
      service_unit: '',
      notes: ''
    })
    setPatientSearchTerm('')
    setSelectedPatient(null)
    setShowForm(true)
  }

  // Close form
  const handleCloseForm = () => {
    setShowForm(false)
    setPatientSearchTerm('')
    setSelectedPatient(null)
  }

  // Update queue status
  const handleUpdateStatus = async (queueId: number, newStatus: string) => {
    try {
      const response = await api.patch(`/api/registrations/${queueId}/status`, {
        status: newStatus
      })

      if (response.data.success) {
        await fetchQueues() // Refresh data
      } else {
        throw new Error(response.data.message || 'Failed to update status')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update status')
      console.error('Error updating status:', err)
    }
  }

  // Print queue slip
  const handleCetak = (queue: Queue) => {
    // Create print content for queue slip
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Slip Antrian - ${queue.patient?.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .slip {
              max-width: 300px;
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
            .slip-title {
              font-size: 12px;
              color: #666;
            }
            .queue-number {
              text-align: center;
              font-size: 36px;
              font-weight: bold;
              color: #2563eb;
              margin: 20px 0;
              padding: 10px;
              background: #f0f9ff;
              border-radius: 8px;
              border: 2px solid #2563eb;
            }
            .patient-info {
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              margin-bottom: 6px;
            }
            .label {
              font-weight: bold;
              width: 80px;
              color: #333;
              font-size: 11px;
            }
            .value {
              color: #666;
              font-size: 11px;
            }
            .service-unit {
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
            .status-registered { background: #dbeafe; color: #1e40af; }
            .status-checked-in { background: #dcfce7; color: #166534; }
            .status-completed { background: #f3e8ff; color: #6b21a8; }
            .status-cancelled { background: #fee2e2; color: #dc2626; }
            @media print {
              body { margin: 0; }
              .slip { border: none; max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <div class="hospital-name">RUMAH SAKIT SIRAMA</div>
              <div class="slip-title">SLIP ANTRIAN PASIEN</div>
            </div>

            <div class="queue-number">
              ${queue.queue_number}
            </div>

            <div class="patient-info">
              <div class="info-row">
                <span class="label">Nama:</span>
                <span class="value">${queue.patient?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">MRN:</span>
                <span class="value">${queue.patient?.mrn || 'N/A'}</span>
              </div>
            </div>

            <div class="service-unit">
              ${queue.service_unit}
            </div>

            <div class="status status-${queue.status.replace('-', '-')}">
              ${queue.status === 'registered' ? 'MENUNGGU' :
                queue.status === 'checked-in' ? 'SUDAH CHECK-IN' :
                queue.status === 'completed' ? 'SELESAI' :
                queue.status === 'cancelled' ? 'DIBATALKAN' : (queue.status as string).toUpperCase()}
            </div>

            <div class="footer">
              <div>Waktu Registrasi: ${new Date(queue.created_at).toLocaleString('id-ID')}</div>
              <div>Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
              <div>Silakan menunggu panggilan sesuai nomor antrian</div>
            </div>
          </div>
        </body>
      </html>
    `

    // Open print window
    const printWindow = window.open('', '_blank', 'width=400,height=600')
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
      alert('Popup blocker mungkin aktif. Silakan izinkan popup untuk mencetak slip antrian.')
    }
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

  // Filter queues based on search
  const filteredQueues = queues.filter(queue =>
    queue.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.patient?.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.queue_number.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'registered': return 'Menunggu'
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
  const columns = useMemo<ColumnDef<Queue>[]>(() => [
    {
      accessorKey: 'queue_number',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Nomor</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.queue_number}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'patient.name',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Pasien</span>
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
      accessorKey: 'service_unit',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Poli</span>
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
      accessorKey: 'created_at',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Waktu</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{formatDateTime(row.original.created_at).time}</span>
      ),
      sortingFn: 'datetime',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handleCetak(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Cetak Slip"
          >
            <FaPrint />
          </button>
          {row.original.status === 'registered' && (
            <button
              onClick={() => handleUpdateStatus(row.original.id, 'checked-in')}
              className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              title="Check-in"
            >
              <FaCheck />
            </button>
          )}
          {row.original.status === 'checked-in' && (
            <button
              onClick={() => handleUpdateStatus(row.original.id, 'completed')}
              className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              title="Selesai"
            >
              <FaCheck />
            </button>
          )}
        </div>
      ),
    },
  ], [])

  // TanStack Table instance
  const table = useReactTable({
    data: queues,
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
          <p className="text-gray-600 dark:text-gray-400">Memuat data antrian...</p>
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
        <FaList className="text-blue-500" />
        <span className="truncate">Antrian Pasien</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari antrian berdasarkan nama pasien atau nomor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={handleTambah}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2"
          >
            <FaPlus />
            <span className="hidden sm:inline">Tambah Antrian</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        {/* TanStack Table */}
        {!loading && (
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
                      Tidak ada data antrian
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TanStack Table Pagination */}
        {!loading && queues.length > 0 && (
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
              <span>dari {table.getFilteredRowModel().rows.length} antrian</span>
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Antrian</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'registered').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Check-in</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'checked-in').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'completed').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Dibatalkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Unit Pelayanan</h2>
          <div className="space-y-3">
            {Object.entries(
              queues.reduce((acc, queue) => {
                acc[queue.service_unit] = (acc[queue.service_unit] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([unit, count]) => (
              <div key={unit} className="flex justify-between items-center">
                <span className="text-sm">{unit}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${queues.length ? (count / queues.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-sm w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-zinc-800 pt-2 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{queues.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tambah Antrian</h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Patient Search */}
                  <div className="relative">
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
                                patient_id: patient.id.toString()
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

                  {/* Service Unit */}
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

                  {/* Notes */}
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
                    onClick={handleCloseForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedPatient}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    {submitting ? 'Menyimpan...' : 'Buat Antrian'}
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
