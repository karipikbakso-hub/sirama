'use client'

import { useState, useEffect, useMemo } from 'react'
import { FaEdit, FaPlus, FaPrint, FaTrash, FaUsers, FaSearch, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'
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

type Patient = {
  id: number
  mrn: string
  name: string
  nik: string | null
  birth_date: string
  gender: 'L' | 'P'
  phone: string | null
  address: string | null
  emergency_contact: string | null
  bpjs_number: string | null
  status: 'active' | 'inactive' | 'deceased'
  created_at: string
  updated_at: string
}

type PatientForm = {
  name: string
  nik: string
  birth_date: string
  gender: 'L' | 'P'
  phone: string
  address: string
  emergency_contact: string
  bpjs_number: string
  status: 'active' | 'inactive' | 'deceased'
}

export default function PasienPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [perPage, setPerPage] = useState(10)

  const [form, setForm] = useState<PatientForm>({
    name: '',
    nik: '',
    birth_date: '',
    gender: 'L',
    phone: '',
    address: '',
    emergency_contact: '',
    bpjs_number: '',
    status: 'active',
  })
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Fetch patients with pagination
  const fetchPatients = async (page = 1, search = '', newPerPage?: number) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (newPerPage || perPage).toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const response = await api.get(`/api/patients?${params}`)
      if (response.data.success) {
        const paginationData = response.data.data
        setPatients(paginationData.data || [])
        setCurrentPage(paginationData.current_page || 1)
        setTotalPages(paginationData.last_page || 1)
        setTotalRecords(paginationData.total || 0)
      } else {
        throw new Error(response.data.message || 'Failed to fetch patients')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load patients')
      console.error('Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = editingPatient
        ? await api.put(`/api/patients/${editingPatient.id}`, form)
        : await api.post('/api/patients', form)

      if (response.data.success) {
        await fetchPatients() // Refresh data
        setShowForm(false)
        setEditingPatient(null)
        setForm({
          name: '',
          nik: '',
          birth_date: '',
          gender: 'L',
          phone: '',
          address: '',
          emergency_contact: '',
          bpjs_number: '',
          status: 'active',
        })
      } else {
        throw new Error(response.data.message || 'Failed to save patient')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
      console.error('Error saving patient:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTambah = () => {
    setForm({
      name: '',
      nik: '',
      birth_date: '',
      gender: 'L',
      phone: '',
      address: '',
      emergency_contact: '',
      bpjs_number: '',
      status: 'active',
    })
    setEditingPatient(null)
    setShowForm(true)
  }

  const handleEdit = (patient: Patient) => {
    setForm({
      name: patient.name,
      nik: patient.nik || '',
      birth_date: patient.birth_date.split('T')[0], // Remove time part
      gender: patient.gender,
      phone: patient.phone || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      bpjs_number: patient.bpjs_number || '',
      status: patient.status,
    })
    setEditingPatient(patient)
    setShowForm(true)
  }

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pasien ${patient.name}?`)) {
      return
    }

    try {
      const response = await api.delete(`/api/patients/${patient.id}`)
      if (response.data.success) {
        await fetchPatients() // Refresh data
      } else {
        throw new Error(response.data.message || 'Failed to delete patient')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred')
      console.error('Error deleting patient:', err)
    }
  }

  const handleCetak = (patient: Patient) => {
    // Create print content for patient card
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu Pasien - ${patient.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .card {
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
              margin-bottom: 20px;
            }
            .hospital-name {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .card-title {
              font-size: 14px;
              color: #666;
            }
            .patient-info {
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              width: 120px;
              color: #333;
            }
            .value {
              color: #666;
            }
            .qr-code {
              text-align: center;
              margin-top: 20px;
              padding: 20px;
              border: 1px dashed #ccc;
              background: #f9f9f9;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            @media print {
              body { margin: 0; }
              .card { border: none; max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="hospital-name">RUMAH SAKIT SIRAMA</div>
              <div class="card-title">KARTU IDENTITAS PASIEN</div>
            </div>

            <div class="patient-info">
              <div class="info-row">
                <span class="label">No. RM:</span>
                <span class="value">${patient.mrn}</span>
              </div>
              <div class="info-row">
                <span class="label">Nama:</span>
                <span class="value">${patient.name}</span>
              </div>
              <div class="info-row">
                <span class="label">NIK:</span>
                <span class="value">${patient.nik || '-'}</span>
              </div>
              <div class="info-row">
                <span class="label">Tgl. Lahir:</span>
                <span class="value">${new Date(patient.birth_date).toLocaleDateString('id-ID')}</span>
              </div>
              <div class="info-row">
                <span class="label">Umur:</span>
                <span class="value">${calculateAge(patient.birth_date)} tahun</span>
              </div>
              <div class="info-row">
                <span class="label">Jenis Kelamin:</span>
                <span class="value">${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div class="info-row">
                <span class="label">No. BPJS:</span>
                <span class="value">${patient.bpjs_number || '-'}</span>
              </div>
              <div class="info-row">
                <span class="label">Telepon:</span>
                <span class="value">${patient.phone || '-'}</span>
              </div>
              <div class="info-row">
                <span class="label">Alamat:</span>
                <span class="value">${patient.address || '-'}</span>
              </div>
            </div>

            <div class="qr-code">
              <div style="font-size: 24px; margin-bottom: 10px;">📱</div>
              <div>Scan untuk informasi lengkap</div>
              <div style="font-size: 12px; margin-top: 5px;">${patient.mrn}</div>
            </div>

            <div class="footer">
              <div>Kartu ini harap dibawa setiap kali berobat</div>
              <div>Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</div>
            </div>
          </div>
        </body>
      </html>
    `

    // Open print window
    const printWindow = window.open('', '_blank', 'width=600,height=800')
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
      alert('Popup blocker mungkin aktif. Silakan izinkan popup untuk mencetak kartu pasien.')
    }
  }

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Nonaktif'
      case 'deceased': return 'Meninggal'
      default: return status
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'inactive': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'deceased': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // TanStack Table column definitions
  const columns = useMemo<ColumnDef<Patient>[]>(() => [
    {
      accessorKey: 'mrn',
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
        <span className="font-mono text-sm">{row.original.mrn}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Nama</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'nik',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>NIK</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{row.original.nik || '-'}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'birth_date',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Umur</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{calculateAge(row.original.birth_date)} tahun</span>
      ),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Jenis Kelamin</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span>{row.original.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <span>Alamat</span>
          <div className="flex flex-col">
            {column.getIsSorted() === 'asc' ? <FaSortUp className="text-blue-500" /> :
             column.getIsSorted() === 'desc' ? <FaSortDown className="text-blue-500" /> :
             <FaSort className="text-gray-400" />}
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <span className="max-w-xs truncate" title={row.original.address || undefined}>
          {row.original.address || '-'}
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
            onClick={() => handleCetak(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Cetak Kartu"
          >
            <FaPrint />
          </button>
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Edit Data"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="p-2 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Hapus"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ], [])

  // TanStack Table instance
  const table = useReactTable({
    data: patients,
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

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaUsers className="text-blue-500" />
        <span className="truncate">Data Pasien</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pasien berdasarkan nama atau MRN..."
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
            <span className="hidden sm:inline">Tambah Pasien</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Memuat data pasien...</span>
          </div>
        )}

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
                      Tidak ada data pasien
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TanStack Table Pagination */}
        {!loading && patients.length > 0 && (
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
              <span>dari {table.getFilteredRowModel().rows.length} pasien</span>
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
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Pasien</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Aktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {patients.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Nonaktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {patients.filter(p => p.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Meninggal</p>
              <p className="text-lg md:text-2xl font-bold">
                {patients.filter(p => p.status === 'deceased').length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Pasien</p>
              <p className="text-lg md:text-2xl font-bold">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Jenis Kelamin</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Laki-laki</span>
              <span className="font-bold">
                {patients.filter(p => p.gender === 'L').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Perempuan</span>
              <span className="font-bold">
                {patients.filter(p => p.gender === 'P').length}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-zinc-800 pt-2 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{patients.length}</span>
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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingPatient ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl transition"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      NIK
                    </label>
                    <input
                      type="text"
                      value={form.nik}
                      onChange={e => setForm({ ...form, nik: e.target.value })}
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
                      value={form.birth_date}
                      onChange={e => setForm({ ...form, birth_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jenis Kelamin *
                    </label>
                    <select
                      value={form.gender}
                      onChange={e => setForm({ ...form, gender: e.target.value as 'L' | 'P' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
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
                      type="tel"
                      value={form.emergency_contact}
                      onChange={e => setForm({ ...form, emergency_contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Masukkan kontak darurat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      No. BPJS
                    </label>
                    <input
                      type="text"
                      value={form.bpjs_number}
                      onChange={e => setForm({ ...form, bpjs_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      placeholder="Masukkan nomor BPJS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status *
                    </label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as PatientForm['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                      <option value="deceased">Meninggal</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Pasien'
                    )}
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
