'use client'

import { useState } from 'react'
import { FaChartPie, FaSearch } from 'react-icons/fa'

type TOIData = {
  id: number
  period: string
  turnOverInterval: number
  target: number
  status: 'on-target' | 'below-target' | 'above-target'
}

const initialData: TOIData[] = [
  {
    id: 1,
    period: 'Januari 2025',
    turnOverInterval: 2.5,
    target: 3.0,
    status: 'below-target'
  },
  {
    id: 2,
    period: 'Februari 2025',
    turnOverInterval: 3.2,
    target: 3.0,
    status: 'above-target'
  },
  {
    id: 3,
    period: 'Maret 2025',
    turnOverInterval: 2.8,
    target: 3.0,
    status: 'below-target'
  },
  {
    id: 4,
    period: 'April 2025',
    turnOverInterval: 3.1,
    target: 3.0,
    status: 'above-target'
  },
  {
    id: 5,
    period: 'Mei 2025',
    turnOverInterval: 2.9,
    target: 3.0,
    status: 'below-target'
  },
  {
    id: 6,
    period: 'Juni 2025',
    turnOverInterval: 3.0,
    target: 3.0,
    status: 'on-target'
  }
]

export default function KPITOIPage() {
  const [toiData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTOIData = toiData.filter(data =>
    data.period.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-target': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'below-target': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'above-target': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaChartPie className="text-blue-500" />
        <span className="truncate">KPI Turn Over Interval (TOI)</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
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
                <th className="px-2">TOI (hari)</th>
                <th className="px-2 hidden sm:table-cell">Target (hari)</th>
                <th className="px-2">Status</th>
                <th className="px-2 text-right">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {filteredTOIData.map((data) => (
                <tr
                  key={data.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{data.period}</td>
                  <td className="px-2 font-medium">{data.turnOverInterval} hari</td>
                  <td className="px-2 hidden sm:table-cell">{data.target} hari</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(data.status)}`}>
                      {getStatusText(data.status)}
                    </span>
                  </td>
                  <td className={`px-2 text-right font-medium ${data.turnOverInterval - data.target <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.turnOverInterval - data.target >= 0 ? '+' : ''}{(data.turnOverInterval - data.target).toFixed(1)} hari
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTOIData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaChartPie className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data TOI yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik TOI</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata TOI</p>
              <p className="text-lg md:text-2xl font-bold">2.9 hari</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Sesuai Target</p>
              <p className="text-lg md:text-2xl font-bold">1</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Di Bawah Target</p>
              <p className="text-lg md:text-2xl font-bold">3</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Di Atas Target</p>
              <p className="text-lg md:text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Tren TOI</h2>
          <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
            {toiData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition"
                  style={{ height: `${(Math.min(data.turnOverInterval, 5) / 5) * 160}px` }}
                ></div>
                <div className="text-xs mt-2 text-center truncate w-full">
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