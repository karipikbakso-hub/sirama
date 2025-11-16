'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaCheck, FaPrint, FaPlus, FaList, FaSearch, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight, FaDownload, FaFilter, FaBell, FaChartBar, FaClock, FaUsers, FaPlayCircle, FaEye, FaTachometerAlt, FaHospital, FaUserMd, FaCalendarAlt, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'
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
  HeaderContext,
  CellContext,
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import api from '@/lib/apiAuth'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

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

type QueueResponse = {
  data: Queue[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// Optimized queue fetch function with TanStack Query
const fetchQueues = async ({
  pageParam = 1,
  pageSize = 10,
  search = '',
  status,
  service,
  date
}: {
  pageParam?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  service?: string;
  date?: string;
}): Promise<QueueResponse> => {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    per_page: pageSize.toString(),
  })

  if (search) {
    params.append('search', search)
  }

  if (status && status !== 'all') {
    params.append('status', status)
  }

  if (service && service !== 'all') {
    params.append('service_unit', service)
  }

  if (date && date !== 'all') {
    params.append('date_filter', date)
  }

  const response = await api.get(`/api/queue-list?${params}`)
  return response.data.data
}

// Loading skeleton component
const TableSkeleton = () => (
  <div className="space-y-4">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="animate-pulse flex space-x-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
      </div>
    ))}
  </div>
)

export default function AntrianPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
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

  const queryClient = useQueryClient()

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

  // Real-time updates with polling
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds

  // Advanced filtering states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('today')

  // TanStack Query for fetching queues with caching and real-time updates
  const {
    data: queueData,
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['queues', currentPage, perPage, searchTerm, statusFilter, serviceFilter, dateFilter],
    queryFn: () => fetchQueues({
      pageParam: currentPage,
      pageSize: perPage,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      service: serviceFilter !== 'all' ? serviceFilter : undefined,
      date: dateFilter
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchIntervalInBackground: false,
  })

  // Query for queue management statistics
  const {
    data: queueManagementStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['queue-management-stats'],
    queryFn: async () => {
      const response = await api.get('/api/queue-managements/statistics')
      return response.data.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: autoRefresh ? refreshInterval : false,
    refetchIntervalInBackground: false,
  })

  const queues = queueData?.data || []
  const pagination = queueData ? {
    current_page: queueData.current_page,
    last_page: queueData.last_page,
    per_page: queueData.per_page,
    total: queueData.total
  } : null

  // Mutations for creating and updating queues
  const createQueueMutation = useMutation({
    mutationFn: async (data: QueueForm) => {
      const response = await api.post('/api/registrations', {
        patient_id: data.patient_id,
        service_unit: data.service_unit,
        arrival_type: 'mandiri',
        payment_method: 'tunai',
        notes: data.notes
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] })
      setShowForm(false)
      setFormData({
        patient_id: '',
        service_unit: '',
        notes: ''
      })
      setPatientSearchTerm('')
      setSelectedPatient(null)
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ queueId, newStatus }: { queueId: number; newStatus: string }) => {
      const response = await api.patch(`/api/registrations/${queueId}/status`, {
        status: newStatus
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queues'] })
    }
  })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    createQueueMutation.mutate(formData)
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
  const handleUpdateStatus = (queueId: number, newStatus: string) => {
    updateStatusMutation.mutate({ queueId, newStatus })
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

  // Calculate statistics for charts - Always call useMemo regardless of conditions
  const queueStats = useMemo(() => {
    const total = queues.length
    const waiting = queues.filter(q => q.status === 'registered').length
    const checkedIn = queues.filter(q => q.status === 'checked-in').length
    const completed = queues.filter(q => q.status === 'completed').length
    const cancelled = queues.filter(q => q.status === 'cancelled').length

    const byService = queues.reduce((acc, queue) => {
      acc[queue.service_unit] = (acc[queue.service_unit] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourQueues = queues.filter(q => new Date(q.created_at).getHours() === hour)
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        total: hourQueues.length,
        completed: hourQueues.filter(q => q.status === 'completed').length
      }
    })

    return {
      total,
      waiting,
      checkedIn,
      completed,
      cancelled,
      byService,
      hourlyData,
      avgWaitTime: 15, // Mock data - would be calculated from actual timestamps
      efficiency: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [queues])

  // Always call useMemo for queue management stats display
  const shouldShowQueueManagementStats = useMemo(() => {
    return !statsLoading && queueManagementStats
  }, [statsLoading, queueManagementStats])

  // Always call useMemo for filtered queues
  const filteredQueues = useMemo(() => {
    return queues.filter(queue =>
      queue.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queue.patient?.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queue.queue_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [queues, searchTerm])

  // Always call useMemo for table columns
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

  // Always call useReactTable hook
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto text-4xl text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data antrian...</p>
        </div>
      </div>
    )
  }

  if (queryError) {
    return (
      <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 dark:text-gray-400">{queryError.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
          <FaEye className="text-blue-500" />
          <span className="truncate">Monitor Antrian</span>
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-gray-600 dark:text-gray-400">
              {autoRefresh ? `Auto refresh: ${refreshInterval / 1000}s` : 'Auto refresh off'}
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString('id-ID')}
          </div>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Antrian</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{queueStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <FaArrowUp className="text-green-500 mr-1" />
            <span className="text-green-600">+12% dari kemarin</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu</p>
              <p className="text-2xl font-bold text-blue-600">{queueStats.waiting}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaClock className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className="text-gray-500">Rata-rata tunggu: {queueStats.avgWaitTime} menit</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sedang Dilayani</p>
              <p className="text-2xl font-bold text-green-600">{queueStats.checkedIn}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaPlayCircle className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span className="text-gray-500">Efisiensi: {queueStats.efficiency}%</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{queueStats.completed}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaCheckCircle className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs">
            <FaArrowUp className="text-green-500 mr-1" />
            <span className="text-green-600">+8% dari kemarin</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Queue Status Distribution */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-500" />
            Distribusi Status Antrian
          </h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: ['Menunggu', 'Sedang Dilayani', 'Selesai', 'Dibatalkan'],
                datasets: [{
                  data: [queueStats.waiting, queueStats.checkedIn, queueStats.completed, queueStats.cancelled],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(147, 51, 234, 1)',
                    'rgba(239, 68, 68, 1)'
                  ],
                  borderWidth: 2,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Hourly Queue Activity */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-green-500" />
            Aktivitas Antrian Per Jam
          </h3>
          <div className="h-64">
            <Line
              data={{
                labels: queueStats.hourlyData.map(d => d.hour),
                datasets: [
                  {
                    label: 'Total Antrian',
                    data: queueStats.hourlyData.map(d => d.total),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: 'Selesai',
                    data: queueStats.hourlyData.map(d => d.completed),
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4,
                    fill: true,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Service Unit Performance */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaHospital className="text-purple-500" />
          Performa Unit Pelayanan
        </h3>
        <div className="h-64">
          <Bar
            data={{
              labels: Object.keys(queueStats.byService),
              datasets: [{
                label: 'Jumlah Antrian',
                data: Object.values(queueStats.byService),
                backgroundColor: 'rgba(147, 51, 234, 0.8)',
                borderColor: 'rgba(147, 51, 234, 1)',
                borderWidth: 1,
                borderRadius: 4,
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  }
                },
                x: {
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </div>
      </div>

      {/* Queue Management Status */}
      {shouldShowQueueManagementStats && (
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaTachometerAlt className="text-indigo-500" />
            Status Manajemen Antrian
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{queueManagementStats?.total_active || 0}</p>
                </div>
                <FaPlayCircle className="text-green-500 text-2xl" />
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dijeda</p>
                  <p className="text-2xl font-bold text-yellow-600">{queueManagementStats?.total_paused || 0}</p>
                </div>
                <FaClock className="text-yellow-500 text-2xl" />
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Dihentikan</p>
                  <p className="text-2xl font-bold text-red-600">{queueManagementStats?.total_stopped || 0}</p>
                </div>
                <FaMinus className="text-red-500 text-2xl" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">Ringkasan Hari Ini</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Dilayani:</span>
                  <span className="font-semibold">{queueManagementStats?.total_served_today || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Dilewati:</span>
                  <span className="font-semibold">{queueManagementStats?.total_skipped_today || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Waktu Tunggu:</span>
                  <span className="font-semibold">{queueManagementStats?.average_wait_time || 0} menit</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">Performa per Layanan</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {queueManagementStats?.by_service_type && queueManagementStats.by_service_type.map((service: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{service.service_type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                        {service.count} aktif
                      </span>
                      <span className="text-xs text-gray-500">
                        {service.avg_wait_time}min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama/MRN/antrian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              aria-label="Filter berdasarkan status antrian"
            >
              <option value="all">Semua Status</option>
              <option value="registered">Menunggu</option>
              <option value="checked-in">Check-in</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUsers className="text-gray-400" />
            </div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              aria-label="Filter berdasarkan unit pelayanan"
            >
              <option value="all">Semua Poli</option>
              <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
              <option value="Poli Anak">Poli Anak</option>
              <option value="Poli Kandungan">Poli Kandungan</option>
              <option value="IGD">IGD</option>
              <option value="Rawat Inap">Rawat Inap</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaClock className="text-gray-400" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              aria-label="Filter berdasarkan rentang waktu"
            >
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Controls and Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <FaBell className="text-blue-500" />
              Auto Refresh
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
                aria-label="Interval auto refresh"
              >
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            )}
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition flex items-center gap-2"
            >
              <FaPlayCircle />
              Refresh
            </button>
            <button
              onClick={handleTambah}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <FaPlus />
              <span className="hidden sm:inline">Tambah Antrian</span>
              <span className="sm:hidden">Tambah</span>
            </button>
            <button
              onClick={() => {
                // Export functionality placeholder
                const csvContent = queues.map(q =>
                  `${q.queue_number},${q.patient?.name || 'N/A'},${q.service_unit},${q.status}`
                ).join('\n')
                const blob = new Blob([`No Antrian,Nama Pasien,Poli,Status\n${csvContent}`], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `antrian-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
              }}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition flex items-center gap-2"
            >
              <FaDownload />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* TanStack Table */}
        {!isLoading && (
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
        {!isLoading && queues.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Menampilkan</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                aria-label="Jumlah item per halaman"
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
                      aria-label="Unit Pelayanan"
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
