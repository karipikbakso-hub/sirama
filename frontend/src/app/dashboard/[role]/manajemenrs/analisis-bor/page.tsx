'use client'

import { useState, useEffect } from 'react'
import { FaBed, FaSearch, FaEye, FaHospital, FaClock, FaUsers, FaChartBar, FaChartLine, FaCalendarAlt, FaFilter } from 'react-icons/fa'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import apiData from '@/lib/apiData'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

type BORData = {
  id: number
  kode_ruangan: string
  nama_ruangan: string
  kapasitas: number
  terisi: number
  kosong: number
  tingkat_okupansi: number
  status: string
  fasilitas: string
  pasien: Array<{
    id: number
    no_rawat_inap: string
    patient_name: string
    tanggal_masuk: string
    durasi: number
    diagnosa: string
    dokter: string
  }>
}

type BORSummary = {
  total_ruangan: number
  total_tempat_tidur: number
  total_terisi: number
  total_kosong: number
  bor_persen: number
  total_patient_days: number
  total_discharges: number
  total_deaths: number
  average_los: number
}

type RoomDetail = {
  ruangan: {
    id: number
    kode_ruangan: string
    nama_ruangan: string
    kapasitas: number
    terisi: number
    kosong: number
    tingkat_okupansi: number
    status: string
    fasilitas: string
    tarif_per_hari: number
  }
  current_patients: Array<{
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
    durasi: number
    diagnosa_masuk: string
    dokter: {
      id: number
      nama_dokter: string
      spesialisasi: string
    } | null
    catatan: string
  }>
}

export default function AnalisisBORPage() {
  const [borData, setBorData] = useState<BORData[]>([])
  const [summary, setSummary] = useState<BORSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<RoomDetail | null>(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [period, setPeriod] = useState('daily')
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
    fetchBORData()
  }, [period, startDate, endDate])

  const fetchBORData = async () => {
    try {
      setLoading(true)
      const response = await apiData.get('/bor', {
        params: { period, start_date: startDate, end_date: endDate }
      })
      if (response.data.success) {
        setBorData(response.data.data.ruangan)
        setSummary(response.data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch BOR data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomDetail = async (roomId: number) => {
    try {
      const response = await apiData.get(`/bor/room/${roomId}`)
      if (response.data.success) {
        setSelectedRoom(response.data.data)
        setShowRoomDetail(true)
      }
    } catch (error) {
      console.error('Failed to fetch room detail:', error)
    }
  }

  const filteredBORData = borData.filter(data =>
    data.nama_ruangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.kode_ruangan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    if (percentage >= 30) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }

  const getOccupancyText = (percentage: number) => {
    if (percentage >= 90) return 'Penuh'
    if (percentage >= 70) return 'Hampir Penuh'
    if (percentage >= 30) return 'Sedang'
    return 'Kosong'
  }

  const getBORTrend = () => {
    if (!summary) return 'stabil'
    const bor = summary.bor_persen
    if (bor >= 85) return 'baik'
    if (bor >= 70) return 'cukup'
    return 'rendah'
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'baik': return 'text-green-600'
      case 'cukup': return 'text-yellow-600'
      case 'rendah': return 'text-red-600'
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
          <FaChartBar className="text-blue-500" />
          <span>Analisis Bed Occupancy Rate (BOR)</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analisis mendalam tingkat hunian kamar rawat inap rumah sakit
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">BOR Saat Ini</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.bor_persen.toFixed(1)}%</p>
                <p className={`text-xs ${getTrendColor(getBORTrend())}`}>
                  {getBORTrend() === 'baik' ? 'Di atas target (≥85%)' :
                   getBORTrend() === 'cukup' ? 'Cukup (70-84%)' : 'Perlu perbaikan (<70%)'}
                </p>
              </div>
              <FaChartBar className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata LOS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.average_los.toFixed(1)} hari</p>
                <p className="text-xs text-gray-500">Lama rawat rata-rata</p>
              </div>
              <FaClock className="text-purple-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pasien</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_terisi}</p>
                <p className="text-xs text-gray-500">Pasien aktif saat ini</p>
              </div>
              <FaUsers className="text-orange-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ruangan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_ruangan}</p>
                <p className="text-xs text-gray-500">{summary.total_tempat_tidur} tempat tidur</p>
              </div>
              <FaHospital className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {showChart && (
        <div className="space-y-6">
          {/* Bar Chart - Tingkat Hunian per Ruangan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Tingkat Hunian per Ruangan
            </h3>
            <div className="h-[400px]">
              <Bar
                data={{
                  labels: filteredBORData.map(room => room.nama_ruangan),
                  datasets: [
                    {
                      label: 'Tingkat Hunian (%)',
                      data: filteredBORData.map(room => room.tingkat_okupansi),
                      backgroundColor: filteredBORData.map(room => {
                        if (room.tingkat_okupansi >= 90) return 'rgba(239, 68, 68, 0.7)'
                        if (room.tingkat_okupansi >= 70) return 'rgba(245, 158, 11, 0.7)'
                        if (room.tingkat_okupansi >= 30) return 'rgba(59, 130, 246, 0.7)'
                        return 'rgba(34, 197, 94, 0.7)'
                      }),
                      borderColor: filteredBORData.map(room => {
                        if (room.tingkat_okupansi >= 90) return 'rgb(239, 68, 68)'
                        if (room.tingkat_okupansi >= 70) return 'rgb(245, 158, 11)'
                        if (room.tingkat_okupansi >= 30) return 'rgb(59, 130, 246)'
                        return 'rgb(34, 197, 94)'
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
                      text: 'Analisis Bed Occupancy Rate (BOR) per Ruangan',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Tingkat Hunian (%)'
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

          {/* Pie Chart - Distribusi Status Okupansi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Distribusi Status Okupansi
              </h3>
              <div className="h-[300px] flex justify-center">
                <Pie
                  data={{
                    labels: ['Kosong (0-29%)', 'Sedang (30-69%)', 'Hampir Penuh (70-89%)', 'Penuh (90-100%)'],
                    datasets: [
                      {
                        data: [
                          filteredBORData.filter(room => room.tingkat_okupansi < 30).length,
                          filteredBORData.filter(room => room.tingkat_okupansi >= 30 && room.tingkat_okupansi < 70).length,
                          filteredBORData.filter(room => room.tingkat_okupansi >= 70 && room.tingkat_okupansi < 90).length,
                          filteredBORData.filter(room => room.tingkat_okupansi >= 90).length,
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(245, 158, 11, 0.7)',
                          'rgba(239, 68, 68, 0.7)',
                        ],
                        borderColor: [
                          'rgb(34, 197, 94)',
                          'rgb(59, 130, 246)',
                          'rgb(245, 158, 11)',
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
                            return `${label}: ${value} ruangan (${percentage}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Bar Chart - Kapasitas vs Terisi */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Kapasitas vs Terisi per Ruangan
              </h3>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: filteredBORData.slice(0, 8).map(room => room.nama_ruangan), // Limit to 8 for readability
                    datasets: [
                      {
                        label: 'Terisi',
                        data: filteredBORData.slice(0, 8).map(room => room.terisi),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1,
                      },
                      {
                        label: 'Kosong',
                        data: filteredBORData.slice(0, 8).map(room => room.kosong),
                        backgroundColor: 'rgba(34, 197, 94, 0.7)',
                        borderColor: 'rgb(34, 197, 94)',
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
                        text: 'Kapasitas vs Keterisian',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Jumlah Tempat Tidur'
                        }
                      },
                      x: {
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
          </div>
        </div>
      )}

      {/* Room Occupancy Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari ruangan..."
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
                <th className="py-3 px-2">Kode Ruangan</th>
                <th className="px-2">Nama Ruangan</th>
                <th className="px-2 text-center">Kapasitas</th>
                <th className="px-2 text-center">Terisi</th>
                <th className="px-2 text-center">Kosong</th>
                <th className="px-2 text-center">Okupansi (%)</th>
                <th className="px-2 text-center">Status</th>
                <th className="px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBORData.map((room) => (
                <tr
                  key={room.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{room.kode_ruangan}</td>
                  <td className="px-2">{room.nama_ruangan}</td>
                  <td className="px-2 text-center">{room.kapasitas}</td>
                  <td className="px-2 text-center font-medium text-red-600">{room.terisi}</td>
                  <td className="px-2 text-center font-medium text-green-600">{room.kosong}</td>
                  <td className="px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getOccupancyColor(room.tingkat_okupansi)}`}>
                      {room.tingkat_okupansi.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getOccupancyColor(room.tingkat_okupansi)}`}>
                      {getOccupancyText(room.tingkat_okupansi)}
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <button
                      onClick={() => fetchRoomDetail(room.id)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50 transition"
                      title="Lihat Detail Ruangan"
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

        {filteredBORData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaBed className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data ruangan yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Room Detail Modal */}
      {showRoomDetail && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Analisis Detail Ruangan: {selectedRoom.ruangan.nama_ruangan}
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
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Terisi</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.terisi}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Kosong</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.kosong}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Okupansi</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRoom.ruangan.tingkat_okupansi.toFixed(1)}%</p>
                </div>
              </div>

              {/* Current Patients */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Pasien Aktif ({selectedRoom.current_patients.length})
                </h3>
                {selectedRoom.current_patients.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRoom.current_patients.map((patient) => (
                      <div key={patient.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{patient.patient.nama_pasien}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">No. RM: {patient.patient.no_rm}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {patient.patient.jenis_kelamin} • {new Date().getFullYear() - new Date(patient.patient.tanggal_lahir).getFullYear()} tahun
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>No. Rawat Inap:</strong> {patient.no_rawat_inap}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Tanggal Masuk:</strong> {new Date(patient.tanggal_masuk).toLocaleDateString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Durasi:</strong> {patient.durasi} hari
                            </p>
                            {patient.dokter && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Dokter:</strong> {patient.dokter.nama_dokter}
                              </p>
                            )}
                          </div>
                        </div>
                        {patient.diagnosa_masuk && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Diagnosa:</strong> {patient.diagnosa_masuk}
                            </p>
                          </div>
                        )}
                        {patient.catatan && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Catatan:</strong> {patient.catatan}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FaBed className="mx-auto text-4xl mb-2" />
                    <p>Tidak ada pasien aktif di ruangan ini saat ini</p>
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
