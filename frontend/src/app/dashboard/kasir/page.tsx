'use client'

import { FaMoneyBillWave, FaReceipt, FaPrint, FaHistory } from 'react-icons/fa'

const stats = [
  { icon: <FaMoneyBillWave className="text-green-600 text-xl" />, label: 'Tagihan Aktif', value: '128 transaksi' },
  { icon: <FaReceipt className="text-blue-600 text-xl" />, label: 'Kwitansi Tercetak', value: '87 kwitansi' },
  { icon: <FaHistory className="text-yellow-600 text-xl" />, label: 'Riwayat Pembayaran', value: '342 pembayaran' },
  { icon: <FaPrint className="text-red-600 text-xl" />, label: 'Cetak Tagihan Hari Ini', value: '56 cetakan' },
]

export default function KasirDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💰 Dashboard Kasir</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan transaksi dan aktivitas kasir hari ini.</p>

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