'use client'

import { useState, useEffect } from 'react'
import { FaDollarSign, FaSearch, FaEye, FaChartBar, FaChartLine, FaCalendarAlt, FaFilter, FaFileAlt } from 'react-icons/fa'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import apiData from '@/lib/apiData'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

type PendapatanData = {
  unit: string
  total_pendapatan: number
  jumlah_pembayaran: number
  rata_rata_per_pembayaran: number
  persentase_dari_total: number
  pembayaran: Array<{
    id: number
    tanggal_bayar: string
    metode_bayar: string
    jumlah_bayar: number
    no_invoice: string
    patient_name: string
  }>
}

type PendapatanSummary = {
  unit_type: string
  total_pendapatan: number
  total_unit: number
  rata_rata_per_unit: number
  unit_tertinggi: string
  unit_terendah: string
  periode: {
    start: string
    end: string
    type: string
    total_days: number
  }
}

type UnitDetail = {
  unit: string
  total_pembayaran: number
  total_pendapatan: number
  pembayaran: Array<{
    id: number
    no_invoice: string
    tanggal_bayar: string
    metode_bayar: string
    jumlah_bayar: number
    kasir: string
    patient: {
      id: number
      nama_pasien: string
      no_rm: string
    }
    poli: string
    ruangan: string
  }>
}

export default function PendapatanRSPage() {
  const [pendapatanData, setPendapatanData] = useState<PendapatanData[]>([])
  const [summary, setSummary] = useState<PendapatanSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<UnitDetail | null>(null)
  const [showUnitDetail, setShowUnitDetail] = useState(false)
  const [unitType, setUnitType] = useState('poli')
  const [period, setPeriod] = useState('monthly')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [showChart, setShowChart] = useState(true)

  useEffect(() => {
    fetchPendapatanData()
  }, [unitType, period, startDate, endDate])

  const fetchPendapatanData = async () => {
    try {
      setLoading(true)
      const response = await apiData.get('/pendapatan', {
        params: { unit_type: unitType, period, start_date: startDate, end_date: endDate }
      })
      if (response.data.success) {
        setPendapatanData(response.data.data.pendapatan)
        setSummary(response.data.data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch pendapatan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnitDetail = async (unitName: string) => {
    try {
      const response = await apiData.get(`/pendapatan/unit/${unitName}/detail`, {
        params: { unit_type: unitType, start_date: startDate, end_date: endDate }
      })
      if (response.data.success) {
        setSelectedUnit(response.data.data)
        setShowUnitDetail(true)
      }
    } catch (error) {
      console.error('Failed to fetch unit detail:', error)
    }
  }

  const filteredPendapatanData = pendapatanData.filter(data =>
    data.unit.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPendapatanColor = (percentage: number) => {
    if (percentage >= 20) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (percentage >= 10) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (percentage >= 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
          <FaDollarSign className="text-green-500" />
          <span>Rekap Pendapatan Rumah Sakit</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analisis pendapatan per unit pelayanan kesehatan
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipe Unit
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Pilih tipe unit"
            >
              <option value="poli">Poli</option>
              <option value="ruangan">Ruangan</option>
            </select>
          </div>
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
              <option value="yearly">Tahunan</option>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.total_pendapatan)}</p>
                <p className="text-xs text-green-600">100% dari total</p>
              </div>
              <FaDollarSign className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata per Unit</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.rata_rata_per_unit)}</p>
                <p className="text-xs text-gray-500">{summary.total_unit} unit aktif</p>
              </div>
              <FaChartBar className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unit Tertinggi</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.unit_tertinggi}</p>
                <p className="text-xs text-gray-500">Kontribusi terbesar</p>
              </div>
              <FaFileAlt className="text-orange-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredPendapatanData.reduce((acc, item) => acc + item.jumlah_pembayaran, 0)}
                </p>
                <p className="text-xs text-gray-500">Transaksi dalam periode</p>
              </div>
              <FaFilter className="text-purple-500 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {showChart && (
        <div className="space-y-6">
          {/* Bar Chart - Pendapatan per Unit */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Pendapatan per Unit ({unitType})
            </h3>
            <div className="h-[400px]">
              <Bar
                data={{
                  labels: filteredPendapatanData.map(unit => unit.unit),
                  datasets: [
                    {
                      label: 'Total Pendapatan',
                      data: filteredPendapatanData.map(unit => unit.total_pendapatan),
                      backgroundColor: filteredPendapatanData.map((_, index) => {
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']
                        return colors[index % colors.length] + '80'
                      }),
                      borderColor: filteredPendapatanData.map((_, index) => {
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']
                        return colors[index % colors.length]
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
                      text: `Rekap Pendapatan per ${unitType.charAt(0).toUpperCase() + unitType.slice(1)}`,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(Number(value))
                      }
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Pie Chart - Distribusi Kontribusi Pendapatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Distribusi Kontribusi Pendapatan
              </h3>
              <div className="h-[300px] flex justify-center">
                <Pie
                  data={{
                    labels: filteredPendapatanData.map(unit => unit.unit),
                    datasets: [
                      {
                        data: filteredPendapatanData.map(unit => unit.total_pendapatan),
                        backgroundColor: filteredPendapatanData.map((_, index) => {
                          const colors = ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(249, 115, 22, 0.7)', 'rgba(6, 182, 212, 0.7)', 'rgba(132, 204, 22, 0.7)']
                          return colors[index % colors.length]
                        }),
                        borderColor: filteredPendapatanData.map((_, index) => {
                          const colors = ['rgb(59, 130, 246)', 'rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)', 'rgb(139, 92, 246)', 'rgb(249, 115, 22)', 'rgb(6, 182, 212)', 'rgb(132, 204, 22)']
                          return colors[index % colors.length]
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
                        position: 'bottom' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || ''
                            const value = context.parsed || 0
                            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0)
                            const percentage = total > 0 ? Math.round(((value / total) * 100)) : 0
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Ringkasan Unit
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <span className="text-sm font-medium">Rata-rata per Unit</span>
                  <span className="font-bold">{formatCurrency(filteredPendapatanData.reduce((acc, unit) => acc + unit.total_pendapatan, 0) / Math.max(filteredPendapatanData.length, 1))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm font-medium">Median Unit</span>
                  <span className="font-bold">{formatCurrency(filteredPendapatanData.length > 0 ? filteredPendapatanData[Math.floor(filteredPendapatanData.length / 2)]?.total_pendapatan || 0 : 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-sm font-medium">Total Pembayaran</span>
                  <span className="font-bold">{filteredPendapatanData.reduce((acc, unit) => acc + unit.jumlah_pembayaran, 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm font-medium">Unit Terlampaui</span>
                  <span className="font-bold">{filteredPendapatanData.filter(unit => unit.jumlah_pembayaran > 10).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pendapatan Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Cari ${unitType}...`}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <FaCalendarAlt className="mr-2" />
            {summary && `${summary.periode.start} - ${summary.periode.end}`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Unit</th>
                <th className="px-2 text-right">Total Pendapatan</th>
                <th className="px-2 text-center">Jumlah Pembayaran</th>
                <th className="px-2 text-right">Rata-rata</th>
                <th className="px-2 text-center">Kontribusi (%)</th>
                <th className="px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPendapatanData.map((unit) => (
                <tr
                  key={unit.unit}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{unit.unit}</td>
                  <td className="px-2 text-right font-bold text-green-600">
                    {formatCurrency(unit.total_pendapatan)}
                  </td>
                  <td className="px-2 text-center">{unit.jumlah_pembayaran}</td>
                  <td className="px-2 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(unit.rata_rata_per_pembayaran)}
                  </td>
                  <td className="px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPendapatanColor(unit.persentase_dari_total)}`}>
                      {unit.persentase_dari_total.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <button
                      onClick={() => fetchUnitDetail(unit.unit)}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/50 transition"
                      title="Lihat Detail Unit"
                    >
                      <FaEye className="mr-1" />
                      Laporan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPendapatanData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaDollarSign className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data pendapatan yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Unit Detail Modal */}
      {showUnitDetail && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Laporan Detail Pendapatan: {selectedUnit.unit}
                </h2>
                <button
                  onClick={() => setShowUnitDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Unit Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedUnit.total_pendapatan)}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Jumlah Pembayaran</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUnit.total_pembayaran}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Rata-rata per Pembayaran</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedUnit.total_pendapatan / Math.max(selectedUnit.total_pembayaran, 1))}</p>
                </div>
              </div>

              {/* Pembayaran Detail Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Detail Pembayaran ({selectedUnit.total_pembayaran})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                        <th className="py-2 px-2">No. Invoice</th>
                        <th className="px-2">Pasien</th>
                        <th className="px-2">Tanggal Bayar</th>
                        <th className="px-2">Metode</th>
                        <th className="px-2 text-right">Jumlah</th>
                        <th className="px-2">Kasir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUnit.pembayaran.map((pembayaran) => (
                        <tr key={pembayaran.id} className="border-b border-gray-200 dark:border-zinc-800">
                          <td className="py-2 px-2 font-medium">{pembayaran.no_invoice}</td>
                          <td className="px-2">
                            <div>
                              <div className="font-medium">{pembayaran.patient.nama_pasien}</div>
                              <div className="text-xs text-gray-500">{pembayaran.patient.no_rm}</div>
                            </div>
                          </td>
                          <td className="px-2">{new Date(pembayaran.tanggal_bayar).toLocaleDateString('id-ID')}</td>
                          <td className="px-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              pembayaran.metode_bayar === 'tunai' ? 'bg-green-100 text-green-800' :
                              pembayaran.metode_bayar === 'transfer' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {pembayaran.metode_bayar}
                            </span>
                          </td>
                          <td className="px-2 text-right font-medium text-green-600">
                            {formatCurrency(pembayaran.jumlah_bayar)}
                          </td>
                          <td className="px-2">{pembayaran.kasir}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
