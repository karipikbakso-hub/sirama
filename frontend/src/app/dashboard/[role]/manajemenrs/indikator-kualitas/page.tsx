'use client'

import { useState, useEffect } from 'react'
import { FaVirus, FaRedo, FaChartLine, FaCalendarAlt, FaEye } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import apiData from '@/lib/apiData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type QualityIndicatorsData = {
  ringkasan: {
    tingkat_infeksi_nosokomial: number
    total_kasus_infeksi: number
    total_pasien_rawat_inap: number
    tingkat_readmisi: number
    total_readmisi: number
    total_discharge: number
    periode: {
      awal: string
      akhir: string
      tipe: string
    }
  }
  grafik: {
    tingkat_infeksi: Array<{
      bulan: string
      nama_bulan: string
      tingkat_infeksi: number
      total_kasus: number
      total_pasien: number
    }>
    tingkat_readmisi: Array<{
      bulan: string
      nama_bulan: string
      tingkat_readmisi: number
      total_readmisi: number
      total_discharge: number
    }>
  }
}

export default function IndikatorKualitasRSPage() {
  const [qualityData, setQualityData] = useState<QualityIndicatorsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('bulanan')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [activeTab, setActiveTab] = useState<'infection' | 'readmission'>('infection')

  useEffect(() => {
    fetchQualityIndicators()
  }, [period, startDate, endDate])

  const fetchQualityIndicators = async () => {
    try {
      setLoading(true)
      const response = await apiData.get('/indikator-kualitas', {
        params: { periode: period, tanggal_awal: startDate, tanggal_akhir: endDate }
      })
      if (response.data.success) {
        setQualityData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch quality indicators:', error)
    } finally {
      setLoading(false)
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
          <FaChartLine className="text-blue-500" />
          <span>Indikator Kualitas Rumah Sakit</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitoring tingkat infeksi nosokomial dan tingkat readmisi
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Periode Analisis
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="harian">Harian</option>
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
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
        </div>
      </div>

      {/* Summary Cards */}
      {qualityData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Infeksi Nosokomial</p>
                <p className="text-2xl font-bold text-red-600">{qualityData.ringkasan.tingkat_infeksi_nosokomial.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">{qualityData.ringkasan.total_kasus_infeksi} kasus dari {qualityData.ringkasan.total_pasien_rawat_inap} pasien</p>
              </div>
              <FaVirus className="text-red-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Readmisi</p>
                <p className="text-2xl font-bold text-orange-600">{qualityData.ringkasan.tingkat_readmisi.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">{qualityData.ringkasan.total_readmisi} readmisi dari {qualityData.ringkasan.total_discharge} discharge</p>
              </div>
              <FaRedo className="text-orange-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pasien Rawat Inap</p>
                <p className="text-2xl font-bold text-blue-600">{qualityData.ringkasan.total_pasien_rawat_inap}</p>
                <p className="text-xs text-gray-500">Dalam periode ini</p>
              </div>
              <FaEye className="text-blue-500 text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Discharge</p>
                <p className="text-2xl font-bold text-green-600">{qualityData.ringkasan.total_discharge}</p>
                <p className="text-xs text-gray-500">Pasien yang keluar</p>
              </div>
              <FaCalendarAlt className="text-green-500 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      {qualityData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Infection Rate Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FaVirus className="text-red-500" />
              Tingkat Infeksi Nosokomial (12 Bulan Terakhir)
            </h3>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: qualityData.grafik.tingkat_infeksi.map(item => item.nama_bulan),
                  datasets: [
                    {
                      label: 'Tingkat Infeksi (%)',
                      data: qualityData.grafik.tingkat_infeksi.map(item => item.tingkat_infeksi),
                      borderColor: 'rgb(239, 68, 68)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      tension: 0.4,
                      yAxisID: 'y',
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
                      text: 'Trend Tingkat Infeksi Nosokomial',
                      font: { size: 14 }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      max: Math.max(...qualityData.grafik.tingkat_infeksi.map(item => item.tingkat_infeksi)) * 1.2,
                      ticks: {
                        callback: (value) => value + '%'
                      }
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Readmission Rate Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FaRedo className="text-orange-500" />
              Tingkat Readmisi (12 Bulan Terakhir)
            </h3>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: qualityData.grafik.tingkat_readmisi.map(item => item.nama_bulan),
                  datasets: [
                    {
                      label: 'Tingkat Readmisi (%)',
                      data: qualityData.grafik.tingkat_readmisi.map(item => item.tingkat_readmisi),
                      borderColor: 'rgb(249, 115, 22)',
                      backgroundColor: 'rgba(249, 115, 22, 0.1)',
                      tension: 0.4,
                      yAxisID: 'y',
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
                      text: 'Trend Tingkat Readmisi',
                      font: { size: 14 }
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      max: Math.max(...qualityData.grafik.tingkat_readmisi.map(item => item.tingkat_readmisi)) * 1.2,
                      ticks: {
                        callback: (value) => value + '%'
                      }
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detailed Tables */}
      {qualityData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Infection Rate Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Data Tingkat Infeksi Nosokomial (Per Bulan)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                    <th className="py-2 px-2">Bulan</th>
                    <th className="px-2">Tingkat (%)</th>
                    <th className="px-2">Kasus</th>
                    <th className="px-2">Total Pasien</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityData.grafik.tingkat_infeksi.slice(-6).map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-zinc-800">
                      <td className="py-2 px-2 font-medium">{item.nama_bulan}</td>
                      <td className="px-2 text-red-600 font-bold">{item.tingkat_infeksi.toFixed(2)}%</td>
                      <td className="px-2">{item.total_kasus}</td>
                      <td className="px-2">{item.total_pasien}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Readmission Rate Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Data Tingkat Readmisi (Per Bulan)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                    <th className="py-2 px-2">Bulan</th>
                    <th className="px-2">Tingkat (%)</th>
                    <th className="px-2">Readmisi</th>
                    <th className="px-2">Total Discharge</th>
                  </tr>
                </thead>
                <tbody>
                  {qualityData.grafik.tingkat_readmisi.slice(-6).map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-zinc-800">
                      <td className="py-2 px-2 font-medium">{item.nama_bulan}</td>
                      <td className="px-2 text-orange-600 font-bold">{item.tingkat_readmisi.toFixed(2)}%</td>
                      <td className="px-2">{item.total_readmisi}</td>
                      <td className="px-2">{item.total_discharge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
