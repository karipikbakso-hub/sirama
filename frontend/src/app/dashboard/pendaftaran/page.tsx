'use client'

import { FaUserPlus, FaListOl, FaIdCard, FaCalendarCheck } from 'react-icons/fa'

const stats = [
  { icon: <FaUserPlus className="text-blue-600 text-xl" />, label: 'Pasien Baru Hari Ini', value: '42 pasien' },
  { icon: <FaListOl className="text-purple-600 text-xl" />, label: 'Antrian Aktif', value: '87 antrian' },
  { icon: <FaIdCard className="text-green-600 text-xl" />, label: 'Pasien BPJS', value: '128 peserta' },
  { icon: <FaCalendarCheck className="text-yellow-600 text-xl" />, label: 'Kunjungan Hari Ini', value: '56 kunjungan' },
]

export default function PendaftaranDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📋 Dashboard Pendaftaran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aktivitas pendaftaran dan antrian hari ini.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-md transition">
            <div>{stat.icon}</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}