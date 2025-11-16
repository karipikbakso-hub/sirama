'use client'

import { useState } from 'react'
import { FaCalendarAlt, FaClock, FaUserMd, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

type Schedule = {
  id: number
  date: string
  time: string
  patient: string
  treatment: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

const initialData: Schedule[] = [
  { 
    id: 1, 
    date: '2025-11-06', 
    time: '08:00 - 09:00', 
    patient: 'Budi Santoso', 
    treatment: 'Konsultasi Umum', 
    status: 'scheduled' 
  },
  { 
    id: 2, 
    date: '2025-11-06', 
    time: '09:00 - 10:00', 
    patient: 'Dewi Lestari', 
    treatment: 'Pemeriksaan Diabetes', 
    status: 'scheduled' 
  },
  { 
    id: 3, 
    date: '2025-11-06', 
    time: '10:00 - 11:00', 
    patient: 'Andi Prasetyo', 
    treatment: 'Tindak Lanjut Migren', 
    status: 'completed' 
  },
  { 
    id: 4, 
    date: '2025-11-06', 
    time: '13:00 - 14:00', 
    patient: 'Siti Rahayu', 
    treatment: 'Konsultasi Artritis', 
    status: 'scheduled' 
  },
  { 
    id: 5, 
    date: '2025-11-06', 
    time: '14:00 - 15:00', 
    patient: 'Joko Susilo', 
    treatment: 'Pemeriksaan Asma', 
    status: 'cancelled' 
  },
]

export default function SchedulePage() {
  const [schedules] = useState(initialData)
  const [selectedDate, setSelectedDate] = useState('2025-11-06')

  const filteredSchedules = schedules.filter(schedule => 
    schedule.date === selectedDate
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Terjadwal'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 tracking-wide flex items-center gap-3">
        <FaCalendarAlt className="text-blue-500" />
        Jadwal Praktik
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500" />
            <input
              type="date"
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center gap-2">
            <FaPlus />
            Tambah Jadwal
          </button>
        </div>

        <div className="space-y-4">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
              >
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
                      <FaClock className="text-blue-500 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{schedule.time}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{schedule.patient}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-medium">{schedule.treatment}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(schedule.status)}`}>
                      {getStatusText(schedule.status)}
                    </span>
                    <div className="space-x-2">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEdit />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaCalendarAlt className="mx-auto text-4xl mb-2" />
              <p>Tidak ada jadwal untuk tanggal ini</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaUserMd className="text-blue-500" />
            Statistik Hari Ini
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Jadwal</span>
              <span className="font-bold">{schedules.filter(s => s.date === selectedDate).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Terjadwal</span>
              <span className="font-bold text-blue-500">
                {schedules.filter(s => s.date === selectedDate && s.status === 'scheduled').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Selesai</span>
              <span className="font-bold text-green-500">
                {schedules.filter(s => s.date === selectedDate && s.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dibatalkan</span>
              <span className="font-bold text-red-500">
                {schedules.filter(s => s.date === selectedDate && s.status === 'cancelled').length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Jadwal Minggu Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                  <th className="py-2">Hari</th>
                  <th>Tanggal</th>
                  <th>Jumlah Pasien</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <td className="py-2">Senin</td>
                  <td>2025-11-03</td>
                  <td>8</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Selesai
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <td className="py-2">Selasa</td>
                  <td>2025-11-04</td>
                  <td>12</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Selesai
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <td className="py-2">Rabu</td>
                  <td>2025-11-05</td>
                  <td>10</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Selesai
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-zinc-800 font-bold">
                  <td className="py-2">Kamis</td>
                  <td>2025-11-06</td>
                  <td>5</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Berlangsung
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Jumat</td>
                  <td>2025-11-07</td>
                  <td>7</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Mendatang
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}