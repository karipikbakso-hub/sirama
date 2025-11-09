'use client'

import { useState } from 'react'
import { FaChartBar, FaSearch } from 'react-icons/fa'

type Recap = {
  id: number
  period: string
  department: string
  totalEmployees: number
  present: number
  absent: number
  late: number
  leave: number
  attendanceRate: number
}

const initialData: Recap[] = [
  {
    id: 1,
    period: 'Januari 2025',
    department: 'Rawat Jalan',
    totalEmployees: 15,
    present: 320,
    absent: 8,
    late: 12,
    leave: 15,
    attendanceRate: 93.6
  },
  {
    id: 2,
    period: 'Februari 2025',
    department: 'Rawat Jalan',
    totalEmployees: 15,
    present: 310,
    absent: 12,
    late: 18,
    leave: 20,
    attendanceRate: 91.2
  },
  {
    id: 3,
    period: 'Maret 2025',
    department: 'Rawat Inap',
    totalEmployees: 20,
    present: 480,
    absent: 5,
    late: 10,
    leave: 25,
    attendanceRate: 95.8
  },
  {
    id: 4,
    period: 'April 2025',
    department: 'Rawat Inap',
    totalEmployees: 20,
    present: 475,
    absent: 8,
    late: 12,
    leave: 25,
    attendanceRate: 95.0
  },
  {
    id: 5,
    period: 'Mei 2025',
    department: 'Farmasi',
    totalEmployees: 8,
    present: 185,
    absent: 2,
    late: 3,
    leave: 10,
    attendanceRate: 97.4
  },
  {
    id: 6,
    period: 'Juni 2025',
    department: 'Farmasi',
    totalEmployees: 8,
    present: 180,
    absent: 3,
    late: 5,
    leave: 12,
    attendanceRate: 96.0
  }
]

export default function RekapSDMPage() {
  const [recaps] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecaps = recaps.filter(recap =>
    recap.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recap.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-500'
    if (rate >= 90) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaChartBar className="text-blue-500" />
        <span className="truncate">Rekapitulasi SDM</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari rekapitulasi..."
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
                <th className="px-2">Departemen</th>
                <th className="px-2 hidden sm:table-cell">Jumlah Pegawai</th>
                <th className="px-2">Hadir</th>
                <th className="px-2 hidden md:table-cell">Tidak Hadir</th>
                <th className="px-2 hidden md:table-cell">Terlambat</th>
                <th className="px-2 hidden sm:table-cell">Cuti</th>
                <th className="px-2">Tingkat Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecaps.map((recap) => (
                <tr
                  key={recap.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{recap.period}</td>
                  <td className="px-2">{recap.department}</td>
                  <td className="px-2 hidden sm:table-cell">{recap.totalEmployees}</td>
                  <td className="px-2 text-green-500 font-medium">{recap.present}</td>
                  <td className="px-2 hidden md:table-cell text-red-500 font-medium">{recap.absent}</td>
                  <td className="px-2 hidden md:table-cell text-yellow-500 font-medium">{recap.late}</td>
                  <td className="px-2 hidden sm:table-cell text-blue-500 font-medium">{recap.leave}</td>
                  <td className={`px-2 font-bold ${getRateColor(recap.attendanceRate)}`}>
                    {recap.attendanceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecaps.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaChartBar className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data rekapitulasi yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Rekap</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Departemen</p>
              <p className="text-lg md:text-2xl font-bold">5</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata Kehadiran</p>
              <p className="text-lg md:text-2xl font-bold">94.5%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Departemen Terbaik</p>
              <p className="text-lg md:text-2xl font-bold">Farmasi</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Perlu Perbaikan</p>
              <p className="text-lg md:text-2xl font-bold">Rawat Jalan</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Tren Kehadiran</h2>
          <div className="h-48 flex items-end justify-between gap-1 md:gap-2">
            {recaps.slice(0, 6).map((recap, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition"
                  style={{ height: `${(recap.attendanceRate / 100) * 160}px` }}
                ></div>
                <div className="text-xs mt-2 text-center truncate w-full">
                  {recap.period.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}