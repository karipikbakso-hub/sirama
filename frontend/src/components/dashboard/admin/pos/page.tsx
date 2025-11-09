'use client'

import { useState } from 'react'

type Transaksi = {
  id: number
  kasir: string
  waktu: string
  total: number
  metode: 'Tunai' | 'QRIS' | 'Kartu'
  status: 'Selesai' | 'Pending' | 'Dibatalkan'
}

export default function POSPage() {
  const [filter, setFilter] = useState<'Semua' | 'Selesai' | 'Pending' | 'Dibatalkan'>('Semua')

  const data: Transaksi[] = [
    { id: 1, kasir: 'Dina', waktu: '2025-10-28 09:12', total: 125000, metode: 'QRIS', status: 'Selesai' },
    { id: 2, kasir: 'Rudi', waktu: '2025-10-28 09:45', total: 85000, metode: 'Tunai', status: 'Pending' },
    { id: 3, kasir: 'Lina', waktu: '2025-10-28 10:05', total: 152000, metode: 'Kartu', status: 'Selesai' },
    { id: 4, kasir: 'Dina', waktu: '2025-10-28 10:30', total: 43000, metode: 'QRIS', status: 'Dibatalkan' },
    { id: 5, kasir: 'Rudi', waktu: '2025-10-28 11:00', total: 99000, metode: 'Tunai', status: 'Selesai' },
  ]

  const filtered = filter === 'Semua' ? data : data.filter(t => t.status === filter)

  const handleCetak = (t: Transaksi) => {
    alert(`Cetak struk transaksi #${t.id}`)
  }

  const handleHapus = (t: Transaksi) => {
    alert(`Hapus transaksi #${t.id}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white transition">Modul POS</h2>

      {/* Filter Status */}
      <div className="flex gap-3 flex-wrap">
        {['Semua', 'Selesai', 'Pending', 'Dibatalkan'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tabel Transaksi */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Kasir</th>
              <th className="px-4 py-2 text-left">Waktu</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Metode</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr
                key={t.id}
                className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{t.kasir}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{t.waktu}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Rp {t.total.toLocaleString('id-ID')}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{t.metode}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{t.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleCetak(t)}
                    className="px-3 py-1 text-xs rounded bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:scale-105 transition"
                  >
                    🖨️ Cetak
                  </button>
                  <button
                    onClick={() => handleHapus(t)}
                    className="px-3 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:scale-105 transition"
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada transaksi dengan status <strong>{filter}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}