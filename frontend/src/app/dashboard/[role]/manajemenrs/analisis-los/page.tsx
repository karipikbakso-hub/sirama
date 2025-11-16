'use client'

import { useState, useEffect } from 'react'
import { FaClock, FaSearch, FaEye, FaHospital, FaUsers, FaChartBar, FaChartLine, FaCalendarAlt, FaFilter } from 'react-icons/fa'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import apiData from '@/lib/apiData'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

type LOPSData = {
  id: number
  no_rawat_inap: string
  patient_name: string
  no_rm: string
  ruangan: string
  dokter: string | null
  tanggal_masuk: string
  tanggal_keluar: string | null
  durasi: number
  diagnosa_masuk: string | null
  diagnosa_keluar: string | null
  status: string
  biaya_per_hari: number
  total_biaya: number
}

type LOSSummary = {
  total_pasien: number
  total_hari_rawat: number
  rata_rata_los: number
  total_keluar: number
  total_meninggal: number
  total_pindah_ruangan: number
  los_by_ruangan: Record<string, any>
  los_by_diagnosa: Record<string, any>
  periode: {
    start: string
    end: string
    type: string
  }
}

type RoomLOSDetail = {
  ruangan: {
    id: number
    nama_ruangan: string
    kapasitas: number
    total_pasien: number
    total_hari_rawat: number
    rata_rata_los: number
  }
  pasien: Array<{
    id: number
    no_rawat_inap: string
    patient: {
      id: number
      nama_pasien: string
      no_rm: string
      tanggal_lahir: string
      jenis_kelamin: string
    }
    tanggal_masuk: string
    tanggal_keluar: string | null
    durasi: number
    diagnosa_masuk: string | null
    diagnosa_keluar: string | null
    dokter: {
      id: number
      nama_dokter: string
      spesialisasi: string | null
    } | null
    status: string
    catatan: string | null
  }>
}

export default function AnalisisLOSPage() {
  const [losData, setLosData] = useState<LOPSData[]>([])
  const [summary, setSummary] = useState<LOSSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<LOPSData | null>(null)
  const [showPatientDetail, setShowPatientDetail] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomLOSDetail | null>(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [period, setPeriod] = useState('monthly')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    fetchLOSData()
  }, [period, startDate, endDate])

  const fetchLOSData = async () => {
    try {
      setLoading(true)
      const response = await apiData.get('/los', {
        params: { period, start_date: startDate, end_date: endDate }
      })
      if (response.data.success) {
        setLosData(response.data.data.pasien)
        setSummary(response.data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch LOS data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLOSData = losData.filter(data =>
    data.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.no_rm.includes(searchTerm) ||
    data.no_rawat_inap.includes(searchTerm)
  )

  const getLOSTrend = () => {
    if (!summary) return 'stabil'
    const avgLOS = summary.rata_rata_los
    if (avgLOS < 5) return 'baik'
    if (avgLOS <= 10) return 'cukup'
    return 'lama'
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'baik': return 'text-green-600'
      case 'cukup': return 'text-yellow-600'
      case 'lama': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaClock className="text-blue-500" />
          <span>Analisis Length of Stay (LOS)</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analisis mendalam lama rawat pasien rumah sakit
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Periode Analisis
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Pilih periode analisis"
            >
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Pilih tanggal mulai"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Pilih tanggal akhir"
            />
          </div>
          <div>
            <button
              onClick={() => setShowChart(!showChart)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <FaChartLine />
              {showChart ? 'Sembunyikan' : 'Tampilkan'} Grafik
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata LOS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.rata_rata_los.toFixed(1)} hari</p>
                <p className={`text-xs ${getTrendColor(getLOSTrend())}`}>
                  {getLOSTrend() === 'baik' ? 'Di bawah rata-rata (<5 hari)' :
                   getLOSTrend() === 'cukup' ? 'Standar (5-10 hari)' : 'Perlu perbaikan (>10 hari)'}
                </p>
              </div>
              <FaClock className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pasien</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_pasien}</p>
                <p className="text-xs text-gray-500">Pasien dirawat periode ini</p>
              </div>
              <FaUsers className="text-orange-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hari Rawat</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_hari_rawat}</p>
                <p className="text-xs text-gray-500">Total hari rawat pasien</p>
              </div>
              <FaCalendarAlt className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Persentase Keluar</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.total_pasien > 0 ? ((summary.total_keluar / summary.total_pasien) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500">Pasien yang sudah keluar</p>
              </div>
              <FaHospital className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {showChart && (
        <div className="space-y-6">
          {/* Bar Chart - LOS per Ruangan */}
          {summary && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Rata-rata LOS per Ruangan
              </h3>
              <div className="h-[400px]">
                <Bar
                  data={{
                    labels: Object.keys(summary.los_by_ruangan),
                    datasets: [
                      {
                        label: 'Rata-rata LOS (hari)',
                        data: Object.values(summary.los_by_ruangan).map((room: any) => parseFloat(room.average_los)),
                        backgroundColor: Object.values(summary.los_by_ruangan).map((room: any, index: number) => {
                          const los = parseFloat(room.average_los)
                          if (los < 5) return 'rgba(34, 197, 94, 0.7)'
                          if (los <= 10) return 'rgba(251, 191, 36, 0.7)'
                          return 'rgba(239, 68, 68, 0.7)'
                        }),
                        borderColor: Object.values(summary.los_by_ruangan).map((room: any) => {
                          const los = parseFloat(room.average_los)
                          if (los < 5) return 'rgb(34, 197, 94)'
                          if (los <= 10) return 'rgb(251, 191, 36)'
                          return 'rgb(239, 68, 68)'
                        }),
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Analisis Length of Stay (LOS) per Ruangan',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Lama Rawat (hari)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Nama Ruangan'
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Pie Chart - Distribusi LOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Distribusi Kategori LOS
              </h3>
              <div className="h-[300px] flex justify-center">
                <Doughnut
                  data={{
                    labels: ['Pendek (<5 hari)', 'Standar (5-10 hari)', 'Panjang (>10 hari)'],
                    datasets: [
                      {
                        data: [
                          filteredLOSData.filter(patient => patient.durasi < 5).length,
                          filteredLOSData.filter(patient => patient.durasi >= 5 && patient.durasi <= 10).length,
                          filteredLOSData.filter(patient => patient.durasi > 10).length,
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.7)',
                          'rgba(251, 191, 36, 0.7)',
                          'rgba(239, 68, 68, 0.7)',
                        ],
                        borderColor: [
                          'rgb(34, 197, 94)',
                          'rgb(251, 191, 36)',
                          'rgb(239, 68, 68)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || ''
                            const value = context.parsed || 0
                            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0)
                            const percentage = total > 0 ? Math.round(((value / total) * 100)) : 0
                            return `${label}: ${value} pasien (${percentage}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Bar Chart - Durasi per Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Rata-rata LOS berdasarkan Status
              </h3>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: ['Keluar', 'Meninggal', 'Pindah Ruangan'],
                    datasets: [
                      {
                        label: 'Rata-rata Durasi (hari)',
                        data: summary ? [
                          summary.total_keluar > 0 ? (summary.total_hari_rawat * summary.total_keluar / summary.total_pasien) / summary.total_keluar : 0,
                          summary.total_meninggal > 0 ? (summary.total_hari_rawat * summary.total_meninggal / summary.total_pasien) / summary.total_meninggal : 0,
                          summary.total_pindah_ruangan > 0 ? (summary.total_hari_rawat * summary.total_pindah_ruangan / summary.total_pasien) / summary.total_pindah_ruangan : 0,
                        ] : [0, 0, 0],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.7)',
                          'rgba(239, 68, 68, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                        ],
                        borderColor: [
                          'rgb(34, 197, 94)',
                          'rgb(239, 68, 68)',
                          'rgb(59, 130, 246)',
                        ],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Rata-rata Durasi (hari)'
                        }
                      }
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient LOS Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pasien..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">No. Rawat Inap</th>
                <th className="px-2">Nama Pasien</th>
                <th className="px-2">No. RM</th>
                <th className="px-2">Ruangan</th>
                <th className="px-2">Tanggal Masuk</th>
                <th className="px-2">Tanggal Keluar</th>
                <th className="px-2 text-center">Durasi (hari)</th>
                <th className="px-2 text-center">Status</th>
                <th className="px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLOSData.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{patient.no_rawat_inap}</td>
                  <td className="px-2">{patient.patient_name}</td>
                  <td className="px-2">{patient.no_rm}</td>
                  <td className="px-2">{patient.ruangan}</td>
                  <td className="px-2">{patient.tanggal_masuk}</td>
                  <td className="px-2">{patient.tanggal_keluar || '-'}</td>
                  <td className="px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      patient.durasi < 5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      patient.durasi <= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {patient.durasi}
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      patient.status === 'keluar' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      patient.status === 'meninggal' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      patient.status === 'pindah_ruangan' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient)
                        setShowPatientDetail(true)
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50 transition"
                      title="Lihat Detail Pasien"
                    >
                      <FaEye className="mr-1" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLOSData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaUsers className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data pasien yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {showPatientDetail && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detail Pasien: {selectedPatient.patient_name}
                </h2>
                <button
                  onClick={() => setShowPatientDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Informasi Pasien</h3>
                  <div className="space-y-2">
                    <p><strong>No. RM:</strong> {selectedPatient.no_rm}</p>
                    <p><strong>No. Rawat Inap:</strong> {selectedPatient.no_rawat_inap}</p>
                    <p><strong>Ruangan:</strong> {selectedPatient.ruangan}</p>
                    <p><strong>Dokter:</strong> {selectedPatient.dokter || 'Tidak ditentukan'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Detail Rawat</h3>
                  <div className="space-y-2">
                    <p><strong>Tanggal Masuk:</strong> {selectedPatient.tanggal_masuk}</p>
                    <p><strong>Tanggal Keluar:</strong> {selectedPatient.tanggal_keluar || 'Masih dirawat'}</p>
                    <p><strong>Durasi Rawat:</strong> {selectedPatient.durasi} hari</p>
                    <p><strong>Status:</strong> {selectedPatient.status}</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Diagnosa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Diagnosa Masuk:</strong></p>
                    <p className="text-sm">{selectedPatient.diagnosa_masuk || 'Tidak tersedia'}</p>
                  </div>
                  <div>
                    <p><strong>Diagnosa Keluar:</strong></p>
                    <p className="text-sm">{selectedPatient.diagnosa_keluar || 'Tidak tersedia'}</p>
                  </div>
                </div>
              </div>

              {/* Biaya */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Informasi Biaya</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Biaya per Hari:</strong> Rp {selectedPatient.biaya_per_hari.toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>Total Biaya:</strong> Rp {selectedPatient.total_biaya.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {showRoomDetail && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Analisis LOS Ruangan: {selectedRoom.ruangan.nama_ruangan}
                </h2>
                <button
                  onClick={() => setShowRoomDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Room Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kapasitas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.kapasitas}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Pasien</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.total_pasien}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Hari Rawat</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.total_hari_rawat}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Rata-rata LOS</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.rata_rata_los.toFixed(1)} hari</p>
                </div>
              </div>

              {/* Patients in Room */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Pasien dengan LOS ({selectedRoom.pasien.length})
                </h3>
                {selectedRoom.pasien.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-zinc-700">
                          <th className="py-3 px-2 text-left">Pasien</th>
                          <th className="px-2 text-left">No. RM</th>
                          <th className="px-2 text-center">Tanggal Masuk</th>
                          <th className="px-2 text-center">Tanggal Keluar</th>
                          <th className="px-2 text-center">Durasi</th>
                          <th className="px-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRoom.pasien.map((patient) => (
                          <tr key={patient.id} className="border-b border-gray-200 dark:border-zinc-800">
                            <td className="py-3 px-2 font-medium">{patient.patient.nama_pasien}</td>
                            <td className="px-2">{patient.patient.no_rm}</td>
                            <td className="px-2 text-center">{new Date(patient.tanggal_masuk).toLocaleDateString('id-ID')}</td>
                            <td className="px-2 text-center">{patient.tanggal_keluar ? new Date(patient.tanggal_keluar).toLocaleDateString('id-ID') : '-'}</td>
                            <td className="px-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                patient.durasi < 5 ? 'bg-green-100 text-green-800' :
                                patient.durasi <= 10 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {patient.durasi} hari
                              </span>
                            </td>
                            <td className="px-2">{patient.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FaUsers className="mx-auto text-4xl mb-2" />
                    <p>Tidak ada data pasien di ruangan ini</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
