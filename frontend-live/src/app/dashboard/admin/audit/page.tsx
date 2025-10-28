'use client'

import { useState } from 'react'

type LogEntry = {
  id: number
  user: 'admin' | 'dokter1' | 'kasir2'
  action: keyof typeof actionColor
  module: string
  time: string
}

const actionColor = {
  Login: 'text-blue-600 dark:text-blue-400',
  'Update Data': 'text-yellow-600 dark:text-yellow-400',
  Hapus: 'text-red-600 dark:text-red-400',
  Cetak: 'text-green-600 dark:text-green-400',
}

const dummyLogs: LogEntry[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  user: ['admin', 'dokter1', 'kasir2'][i % 3] as LogEntry['user'],
  action: ['Login', 'Update Data', 'Hapus', 'Cetak'][i % 4] as LogEntry['action'],
  module: ['Pasien', 'Rekam Medis', 'Pembayaran', 'Obat'][i % 4],
  time: `2025-10-${(i % 30) + 1} 14:${(i % 60).toString().padStart(2, '0')}`,
}))

export default function AuditTrailPage() {
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalPages = Math.ceil(dummyLogs.length / perPage)
  const logs = dummyLogs.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">🕵️ Audit Trail</h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <select className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200">
          <option>Semua User</option>
          <option>admin</option>
          <option>dokter1</option>
          <option>kasir2</option>
        </select>
        <select className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200">
          <option>Semua Aksi</option>
          <option>Login</option>
          <option>Update Data</option>
          <option>Hapus</option>
          <option>Cetak</option>
        </select>
        <input
          type="date"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        />
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          🔍 Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 shadow">
        <table className="min-w-full text-sm text-left bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">User</th>
              <th className="p-3 border-b">Aksi</th>
              <th className="p-3 border-b">Modul</th>
              <th className="p-3 border-b">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr
                key={log.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {(page - 1) * perPage + i + 1}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{log.user}</td>
                <td
                  className={`p-3 font-medium ${
                    actionColor[log.action] ?? 'text-gray-500'
                  }`}
                >
                  {log.action}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{log.module}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        <span>
          Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, dummyLogs.length)} dari {dummyLogs.length} log
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            ← Sebelumnya
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Selanjutnya →
          </button>
        </div>
      </div>
    </div>
  )
}