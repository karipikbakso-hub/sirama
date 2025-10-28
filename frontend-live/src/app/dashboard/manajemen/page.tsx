'use client'

import { FaChartBar, FaFileAlt, FaMoneyBill, FaUsers } from 'react-icons/fa'

const stats = [
  { icon: <FaChartBar className="text-blue-600 text-xl" />, label: 'Kinerja Modul', value: '87% aktif' },
  { icon: <FaFileAlt className="text-purple-600 text-xl" />, label: 'Laporan Terkini', value: '12 laporan minggu ini' },
  { icon: <FaMoneyBill className="text-green-600 text-xl" />, label: 'Pendapatan Bulan Ini', value: 'Rp 128.500.000' },
  { icon: <FaUsers className="text-yellow-600 text-xl" />, label: 'SDM Aktif', value: '42 pegawai' },
]

export default function ManajemenDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📊 Dashboard Manajemen</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan performa sistem dan aktivitas operasional.</p>

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