'use client'

import RoleGuard from '@/components/RoleGuard';
import { FaBed, FaHeartbeat, FaClipboardCheck } from 'react-icons/fa'

const stats = [
  { icon: <FaBed className="text-blue-600 text-xl" />, label: 'Kamar Terisi', value: '42 kamar aktif' },
  { icon: <FaHeartbeat className="text-red-600 text-xl" />, label: 'Vital Sign Hari Ini', value: '128 pencatatan' },
  { icon: <FaClipboardCheck className="text-green-600 text-xl" />, label: 'Monitoring Observasi', value: '87 pasien dipantau' },
]

export default function PerawatDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧭 Dashboard Perawat</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aktivitas keperawatan dan pemantauan pasien.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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