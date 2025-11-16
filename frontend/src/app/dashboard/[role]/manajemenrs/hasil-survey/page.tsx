'use client'

import { useState, useEffect } from 'react'
import { FaPoll, FaEye, FaSearch, FaChartBar, FaChartLine, FaCalendarAlt, FaFilter, FaFileExport, FaStar } from 'react-icons/fa'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

type SurveyData = {
  id: number
  patient_id: number | null
  registration_id: number | null
  jenis_layanan: string | null
  tanggal_survey: string
  ratings: Record<string, number>
  nilai_rata_rata: number
  komentar: string
  kelompok_usia: string | null
  jenis_kelamin: 'L' | 'P' | null
  disarankan: boolean
  created_at: string
  patient?: {
    id: number
    mrn: string
    name: string
  }
  registration?: {
    id: number
    registration_date: string
    poli: string
  }
}

type SurveyStatistics = {
  total_surveys: number
  average_rating: number
  recommendation_rate: number
  service_stats: Array<{
    jenis_layanan: string
    avg_rating: number
    count: number
  }>
  rating_distribution: Record<number, number>
  monthly_trend: Array<{
    month: string
    avg_rating: number
    count: number
  }>
  age_group_stats: Array<{
    kelompok_usia: string
    avg_rating: number
    count: number
  }>
  gender_stats: Array<{
    jenis_kelamin: string
    avg_rating: number
    count: number
  }>
}

export default function HasilSurveyPage() {
  const [surveyData, setSurveyData] = useState<SurveyData[]>([])
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showChart, setShowChart] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    today.setMonth(today.getMonth() - 6) // Default 6 months ago
    return today.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [jenisLayanan, setJenisLayanan] = useState('')
  const [kelompokUsia, setKelompokUsia] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('')

  useEffect(() => {
    fetchSurveyData()
    fetchStatistics()
  }, [startDate, endDate, jenisLayanan, kelompokUsia, jenisKelamin])

  const fetchSurveyData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('tanggal_from', startDate)
      if (endDate) params.append('tanggal_to', endDate)
      if (jenisLayanan) params.append('jenis_layanan', jenisLayanan)
      if (kelompokUsia) params.append('kelompok_usia', kelompokUsia)
      if (jenisKelamin) params.append('jenis_kelamin', jenisKelamin)

      const response = await fetch(`/api/hasil-survey?${params}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSurveyData(result.data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch survey data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await fetch(`/api/hasil-survey-statistics?${params}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStatistics(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      setStatistics(null)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const params = new URLSearchParams()
      if (startDate) params.append('tanggal_from', startDate)
      if (endDate) params.append('tanggal_to', endDate)
      if (jenisLayanan) params.append('jenis_layanan', jenisLayanan)
      if (kelompokUsia) params.append('kelompok_usia', kelompokUsia)
      if (jenisKelamin) params.append('jenis_kelamin', jenisKelamin)

      const response = await fetch(`/api/hasil-survey/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `hasil-survey-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export survey data:', error)
    } finally {
      setExporting(false)
    }
  }

  const filteredSurveyData = surveyData.filter(data =>
    !searchTerm ||
    data.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.komentar?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (rating >= 4.0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))
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
          <FaPoll className="text-green-500" />
          <span>Rekap Kepuasan Pasien</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analisis hasil survei kepuasan pasien rumah sakit
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jenis Layanan
            </label>
            <select
              value={jenisLayanan}
              onChange={(e) => setJenisLayanan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua</option>
              <option value="rawat_jalan">Rawat Jalan</option>
              <option value="rawat_inap">Rawat Inap</option>
              <option value="gawat_darurat">Gawat Darurat</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kelompok Usia
            </label>
            <select
              value={kelompokUsia}
              onChange={(e) => setKelompokUsia(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua</option>
              <option value="anak">Anak</option>
              <option value="remaja">Remaja</option>
              <option value="dewasa">Dewasa</option>
              <option value="lansia">Lansia</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <FaChartBar />
              {showChart ? 'Sembunyikan' : 'Tampilkan'} Grafik
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
            >
              <FaFileExport />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Survey</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_surveys}</p>
                <p className="text-xs text-gray-500">Responden</p>
              </div>
              <FaPoll className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.average_rating.toFixed(1)}</p>
                <div className="flex mt-1">
                  {renderStars(Math.round(statistics.average_rating))}
                </div>
              </div>
              <FaStar className="text-yellow-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rekomendasi (%)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.recommendation_rate}%</p>
                <p className="text-xs text-green-600">Menyarankan RS</p>
              </div>
              <FaChartLine className="text-green-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Survey Terakhir</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {surveyData.length > 0 ? new Date(surveyData[0].created_at).toLocaleDateString('id-ID') : '-'}
                </p>
                <p className="text-xs text-gray-500">Update terbaru</p>
              </div>
              <FaCalendarAlt className="text-purple-500 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {showChart && statistics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Distribusi Rating
              </h3>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: Object.keys(statistics.rating_distribution).map(rating => `Rating ${rating}`),
                    datasets: [{
                      label: 'Jumlah Responden',
                      data: Object.values(statistics.rating_distribution),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </div>

            {/* Service Type Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Rata-rata per Jenis Layanan
              </h3>
              <div className="h-[300px] flex justify-center">
                <Pie
                  data={{
                    labels: statistics.service_stats.map(stat => stat.jenis_layanan || 'Tidak Diketahui'),
                    datasets: [{
                      data: statistics.service_stats.map(stat => stat.avg_rating),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                      ],
                      borderWidth: 1,
                    }],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Tren Rating Bulanan
            </h3>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: statistics.monthly_trend.map(trend => trend.month),
                  datasets: [{
                    label: 'Rata-rata Rating',
                    data: statistics.monthly_trend.map(trend => trend.avg_rating),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 5 },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Survey Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien atau komentar..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <FaCalendarAlt className="mr-2" />
            {statistics?.total_surveys || surveyData.length} hasil survey ditemukan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Tanggal</th>
                <th className="px-2">Pasien</th>
                <th className="px-2">Layanan</th>
                <th className="px-2 text-center">Rating</th>
                <th className="px-2">Gender/Usia</th>
                <th className="px-2">Komentar</th>
                <th className="px-2 text-center">Disarankan</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveyData.map((survey) => (
                <tr key={survey.id} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition">
                  <td className="py-3 px-2">
                    {new Date(survey.tanggal_survey).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-2">
                    <div>
                      <div className="font-medium">{survey.patient?.name || 'Tidak terdaftar'}</div>
                      {survey.patient?.mrn && (
                        <div className="text-xs text-gray-500">MRN: {survey.patient.mrn}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      survey.jenis_layanan === 'rawat_jalan' ? 'bg-green-100 text-green-800' :
                      survey.jenis_layanan === 'rawat_inap' ? 'bg-blue-100 text-blue-800' :
                      survey.jenis_layanan === 'gawat_darurat' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {survey.jenis_layanan || 'Tidak diketahui'}
                    </span>
                  </td>
                  <td className="px-2 text-center">
                    <div className={`px-2 py-1 rounded-full inline-flex items-center gap-1 ${getRatingColor(survey.nilai_rata_rata)}`}>
                      <span className="font-medium">{survey.nilai_rata_rata}</span>
                      <FaStar className="w-3 h-3" />
                    </div>
                  </td>
                  <td className="px-2">
                    <div className="text-center">
                      <div className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-medium ${
                        survey.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-800' :
                        survey.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {survey.jenis_kelamin || '?'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{survey.kelompok_usia || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-2 max-w-[200px] truncate">{survey.komentar || 'Tidak ada komentar'}</td>
                  <td className="px-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      survey.disarankan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {survey.disarankan ? 'Ya' : 'Tidak'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSurveyData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaPoll className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data survey yang ditemukan untuk filter yang dipilih</p>
          </div>
        )}
      </div>
    </div>
  )
}
