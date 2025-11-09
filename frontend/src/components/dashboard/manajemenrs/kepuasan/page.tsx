'use client'

import { useState } from 'react'
import { FaSmile, FaSearch } from 'react-icons/fa'

type SatisfactionData = {
  id: number
  period: string
  satisfactionIndex: number
  target: number
  category: 'satisfied' | 'neutral' | 'dissatisfied'
}

const initialData: SatisfactionData[] = [
  {
    id: 1,
    period: 'Januari 2025',
    satisfactionIndex: 85.5,
    target: 80,
    category: 'satisfied'
  },
  {
    id: 2,
    period: 'Februari 2025',
    satisfactionIndex: 82.3,
    target: 80,
    category: 'satisfied'
  },
  {
    id: 3,
    period: 'Maret 2025',
    satisfactionIndex: 78.2,
    target: 80,
    category: 'neutral'
  },
  {
    id: 4,
    period: 'April 2025',
    satisfactionIndex: 87.8,
    target: 80,
    category: 'satisfied'
  },
  {
    id: 5,
    period: 'Mei 2025',
    satisfactionIndex: 75.5,
    target: 80,
    category: 'dissatisfied'
  },
  {
    id: 6,
    period: 'Juni 2025',
    satisfactionIndex: 89.2,
    target: 80,
    category: 'satisfied'
  }
]

export default function IndeksKepuasanPage() {
  const [satisfactionData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSatisfactionData = satisfactionData.filter(data =>
    data.period.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'satisfied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'neutral': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'dissatisfied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'satisfied': return 'Puas'
      case 'neutral': return 'Netral'
      case 'dissatisfied': return 'Tidak Puas'
      default: return category
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaSmile className="text-blue-500" />
        <span className="truncate">Indeks Kepuasan Pasien</span>
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
                <th className="px-2">Indeks Kepuasan (%)</th>
                <th className="px-2 hidden sm:table-cell">Target (%)</th>
                <th className="px-2">Kategori</th>
                <th className="px-2 text-right">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {filteredSatisfactionData.map((data) => (
                <tr
                  key={data.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{data.period}</td>
                  <td className="px-2 font-medium">{data.satisfactionIndex}%</td>
                  <td className="px-2 hidden sm:table-cell">{data.target}%</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(data.category)}`}>
                      {getCategoryText(data.category)}
                    </span>
                  </td>
                  <td className={`px-2 text-right font-medium ${data.satisfactionIndex - data.target >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.satisfactionIndex - data.target >= 0 ? '+' : ''}{(data.satisfactionIndex - data.target).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSatisfactionData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaSmile className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data indeks kepuasan yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Kepuasan</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata Kepuasan</p>
              <p className="text-lg md:text-2xl font-bold">83.9%</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Target</p>
              <p className="text-lg md:text-2xl font-bold">80%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Puas</p>
              <p className="text-lg md:text-2xl font-bold">4</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Tidak Puas</p>
              <p className="text-lg md:text-2xl font-bold">1</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Tren Kepuasan</h2>
          <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
            {satisfactionData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition"
                  style={{ height: `${(data.satisfactionIndex / 100) * 160}px` }}
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