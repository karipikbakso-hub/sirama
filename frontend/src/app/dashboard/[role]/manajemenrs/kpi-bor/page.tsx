'use client'

import { useState } from 'react'
import { FaChartBar, FaSearch } from 'react-icons/fa'

type BORData = {
  id: number
  period: string
  bedOccupancyRate: number
  target: number
  status: 'on-target' | 'below-target' | 'above-target'
}

const initialData: BORData[] = [
  {
    id: 1,
    period: 'Januari 2025',
    bedOccupancyRate: 75.5,
    target: 85,
    status: 'below-target'
  },
  {
    id: 2,
    period: 'Februari 2025',
    bedOccupancyRate: 82.3,
    target: 85,
    status: 'below-target'
  },
  {
    id: 3,
    period: 'Maret 2025',
    bedOccupancyRate: 87.8,
    target: 85,
    status: 'above-target'
  },
  {
    id: 4,
    period: 'April 2025',
    bedOccupancyRate: 84.2,
    target: 85,
    status: 'on-target'
  },
  {
    id: 5,
    period: 'Mei 2025',
    bedOccupancyRate: 89.5,
    target: 85,
    status: 'above-target'
  },
  {
    id: 6,
    period: 'Juni 2025',
    bedOccupancyRate: 86.7,
    target: 85,
    status: 'above-target'
  }
]

export default function KPIBORPage() {
  const [borData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBORData = borData.filter(data =>
    data.period.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-target': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'below-target': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'above-target': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-target': return 'Sesuai Target'
      case 'below-target': return 'Di Bawah Target'
      case 'above-target': return 'Di Atas Target'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaChartBar className="text-blue-500" />
          <span>KPI Bed Occupancy Rate (BOR)</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analisis tingkat hunian tempat tidur rumah sakit
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari periode..."
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
                <th className="py-3 px-2">Periode</th>
                <th className="px-2">BOR (%)</th>
                <th className="px-2 hidden sm:table-cell">Target (%)</th>
                <th className="px-2">Status</th>
                <th className="px-2 text-right">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {filteredBORData.map((data) => (
                <tr
                  key={data.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{data.period}</td>
                  <td className="px-2 font-medium">{data.bedOccupancyRate}%</td>
                  <td className="px-2 hidden sm:table-cell">{data.target}%</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}>
                      {getStatusText(data.status)}
                    </span>
                  </td>
                  <td className={`px-2 text-right font-medium ${data.bedOccupancyRate - data.target >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.bedOccupancyRate - data.target >= 0 ? '+' : ''}{(data.bedOccupancyRate - data.target).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBORData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaChartBar className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data BOR yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik BOR
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata BOR</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">85.2%</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Sesuai Target</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">2</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Di Bawah Target</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">2</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Di Atas Target</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Tren BOR
          </h3>
          <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
            {borData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition"
                  style={{ height: `${(data.bedOccupancyRate / 100) * 160}px` }}
                ></div>
                <div className="text-xs mt-2 text-center truncate w-full text-gray-800 dark:text-white">
                  {data.period.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
