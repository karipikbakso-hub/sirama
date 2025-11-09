'use client'

import { useState } from 'react'
import { FaCalendarAlt, FaSearch, FaCheck, FaTimes, FaClock } from 'react-icons/fa'

type Attendance = {
  id: number
  employeeName: string
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  status: 'present' | 'absent' | 'late' | 'leave'
}

const initialData: Attendance[] = [
  {
    id: 1,
    employeeName: 'Budi Santoso',
    employeeId: 'EMP-2025-001',
    date: '2025-11-05',
    checkIn: '07:55',
    checkOut: '16:58',
    status: 'present'
  },
  {
    id: 2,
    employeeName: 'Dewi Lestari',
    employeeId: 'EMP-2025-002',
    date: '2025-11-05',
    checkIn: '08:15',
    checkOut: '17:02',
    status: 'late'
  },
  {
    id: 3,
    employeeName: 'Andi Prasetyo',
    employeeId: 'EMP-2025-003',
    date: '2025-11-05',
    checkIn: '-',
    checkOut: '-',
    status: 'leave'
  },
  {
    id: 4,
    employeeName: 'Siti Rahayu',
    employeeId: 'EMP-2025-004',
    date: '2025-11-05',
    checkIn: '08:02',
    checkOut: '17:05',
    status: 'present'
  },
  {
    id: 5,
    employeeName: 'Joko Susilo',
    employeeId: 'EMP-2025-005',
    date: '2025-11-05',
    checkIn: '-',
    checkOut: '-',
    status: 'absent'
  }
]

export default function AbsensiPage() {
  const [attendances] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAttendances = attendances.filter(attendance =>
    attendance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Hadir'
      case 'absent': return 'Tidak Hadir'
      case 'late': return 'Terlambat'
      case 'leave': return 'Cuti'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <FaCheck className="text-green-500" />
      case 'absent': return <FaTimes className="text-red-500" />
      case 'late': return <FaClock className="text-yellow-500" />
      case 'leave': return <FaCalendarAlt className="text-blue-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCalendarAlt className="text-blue-500" />
        <span className="truncate">Absensi Pegawai</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari absensi..."
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
                <th className="py-3 px-2">Nama Pegawai</th>
                <th className="px-2 hidden md:table-cell">ID Pegawai</th>
                <th className="px-2">Tanggal</th>
                <th className="px-2 hidden sm:table-cell">Masuk</th>
                <th className="px-2 hidden sm:table-cell">Pulang</th>
                <th className="px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.map((attendance) => (
                <tr
                  key={attendance.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{attendance.employeeName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{attendance.employeeId}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{attendance.employeeId}</td>
                  <td className="px-2">{attendance.date}</td>
                  <td className="px-2 hidden sm:table-cell">{attendance.checkIn}</td>
                  <td className="px-2 hidden sm:table-cell">{attendance.checkOut}</td>
                  <td className="px-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(attendance.status)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(attendance.status)}`}>
                        {getStatusText(attendance.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendances.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaCalendarAlt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data absensi yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Absensi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Hadir</p>
              <p className="text-lg md:text-2xl font-bold">
                {attendances.filter(a => a.status === 'present').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Tidak Hadir</p>
              <p className="text-lg md:text-2xl font-bold">
                {attendances.filter(a => a.status === 'absent').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Terlambat</p>
              <p className="text-lg md:text-2xl font-bold">
                {attendances.filter(a => a.status === 'late').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Cuti</p>
              <p className="text-lg md:text-2xl font-bold">
                {attendances.filter(a => a.status === 'leave').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Mingguan</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Minggu Ini</span>
              <span className="font-bold">42/50</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Bulan Ini</span>
              <span className="font-bold">168/200</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Persentase</span>
              <span className="font-bold">84%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Harian</span>
              <span className="font-bold">8.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}