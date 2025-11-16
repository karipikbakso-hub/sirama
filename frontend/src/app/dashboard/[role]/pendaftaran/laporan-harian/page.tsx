'use client'

import { useState, useCallback } from 'react'
import {
  FaFileExport,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaFilter,
  FaSearch,
  FaFilePdf,
  FaFileExcel
} from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import toast from '@/lib/toast'
import apiData from '@/lib/apiData'
import TableByRole from '@/components/table/TableByRole'

// Types
interface DailyReportSummary {
  total_registrations: number
  completed_registrations: number
  pending_registrations: number
  cancelled_registrations: number
  avg_wait_time: number
  avg_service_time: number
  peak_hour: number
  peak_registrations: number
}

interface RegistrationDetail {
  id: number
  registration_number: string
  patient_name: string
  patient_mrn: string
  service_unit: string
  doctor_name: string
  registration_time: string
  status: 'registered' | 'checked-in' | 'completed' | 'cancelled'
  payment_method: string
  referral_source: string
  notes?: string
}

interface DailyReportData {
  summary: DailyReportSummary
  registrations: RegistrationDetail[]
  date: string
}

export default function LaporanHarianPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch daily report data
  const { data: reportData, isLoading, error, refetch } = useQuery<DailyReportData>({
    queryKey: ['daily-report', selectedDate],
    queryFn: async () => {
      const response = await apiData.get(`/daily-reports?date=${selectedDate}`)
      return response.data
    },
  })

  const handleExportExcel = useCallback(async () => {
    if (!reportData) return

    try {
      const response = await apiData.get(`/daily-reports/export/excel?date=${selectedDate}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laporan-harian-${selectedDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Laporan berhasil diekspor ke Excel')
    } catch (error) {
      toast.error('Gagal mengekspor laporan')
    }
  }, [reportData, selectedDate])

  const handleExportPDF = useCallback(async () => {
    if (!reportData) return

    try {
      const response = await apiData.get(`/daily-reports/export/pdf?date=${selectedDate}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laporan-harian-${selectedDate}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Laporan berhasil diekspor ke PDF')
    } catch (error) {
      toast.error('Gagal mengekspor laporan')
    }
  }, [reportData, selectedDate])

  const filteredRegistrations = reportData?.registrations?.filter(registration => {
    const matchesSearch = searchTerm === '' ||
      registration.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.patient_mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.registration_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter

    return matchesSearch && matchesStatus
  }) || []

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      registered: { label: 'Terdaftar', color: 'bg-blue-100 text-blue-700' },
      'checked-in': { label: 'Check-in', color: 'bg-yellow-100 text-yellow-700' },
      completed: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gagal Memuat Laporan</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Terjadi kesalahan saat mengambil data laporan harian
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide flex items-center gap-3">
            <FaFileExport className="text-blue-500" />
            <span className="truncate">Laporan Harian</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Rekap kunjungan pasien harian
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Pilih tanggal laporan"
            />
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition"
          >
            <FaFileExcel className="text-sm" />
            Export Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition"
          >
            <FaFilePdf className="text-sm" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Kunjungan</p>
                <p className="text-2xl font-bold">{reportData.summary.total_registrations.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <FaUsers className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kunjungan Selesai</p>
                <p className="text-2xl font-bold text-green-600">{reportData.summary.completed_registrations}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {reportData.summary.total_registrations > 0
                    ? `${((reportData.summary.completed_registrations / reportData.summary.total_registrations) * 100).toFixed(1)}%`
                    : '0%'
                  } penyelesaian
                </p>
              </div>
              <FaCheckCircle className="text-2xl text-green-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dalam Proses</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.summary.pending_registrations}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">menunggu pelayanan</p>
              </div>
              <FaClock className="text-2xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jam Puncak</p>
                <p className="text-2xl font-bold text-purple-600">{reportData.summary.peak_hour}:00</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {reportData.summary.peak_registrations} kunjungan
                </p>
              </div>
              <FaCalendarAlt className="text-2xl text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien, MRN, atau nomor registrasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter berdasarkan status kunjungan"
            >
              <option value="all">Semua Status</option>
              <option value="registered">Terdaftar</option>
              <option value="checked-in">Check-in</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold">Detail Kunjungan Pasien</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {filteredRegistrations.length} dari {reportData?.registrations?.length || 0} kunjungan
          </div>
        </div>

        {filteredRegistrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">No. Registrasi</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Pasien</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">MRN</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Unit Pelayanan</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Dokter</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Waktu Registrasi</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Pembayaran</th>
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Sumber Rujukan</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-mono text-sm">{registration.registration_number}</td>
                    <td className="px-4 py-3 font-medium">{registration.patient_name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{registration.patient_mrn}</td>
                    <td className="px-4 py-3">{registration.service_unit}</td>
                    <td className="px-4 py-3">{registration.doctor_name || '-'}</td>
                    <td className="px-4 py-3">
                      {new Date(registration.registration_time).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(registration.status)}</td>
                    <td className="px-4 py-3">{registration.payment_method || '-'}</td>
                    <td className="px-4 py-3">{registration.referral_source || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Tidak ada data kunjungan untuk tanggal yang dipilih'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
