'use client'

import { useState } from 'react'
import { FaReceipt, FaSearch, FaEye } from 'react-icons/fa'

type AuditLog = {
  id: number
  timestamp: string
  user: string
  action: string
  module: string
  ip: string
  status: 'success' | 'failed'
}

const initialData: AuditLog[] = [
  {
    id: 1,
    timestamp: '2025-11-05 08:15:22',
    user: 'admin@example.com',
    action: 'Login',
    module: 'Authentication',
    ip: '192.168.1.100',
    status: 'success'
  },
  {
    id: 2,
    timestamp: '2025-11-05 08:30:45',
    user: 'dokter@example.com',
    action: 'Create Patient Record',
    module: 'EMR',
    ip: '192.168.1.105',
    status: 'success'
  },
  {
    id: 3,
    timestamp: '2025-11-05 09:15:33',
    user: 'apoteker@example.com',
    action: 'Update Medicine Stock',
    module: 'Pharmacy',
    ip: '192.168.1.110',
    status: 'failed'
  },
  {
    id: 4,
    timestamp: '2025-11-05 10:22:18',
    user: 'admin@example.com',
    action: 'Delete User',
    module: 'User Management',
    ip: '192.168.1.100',
    status: 'success'
  },
  {
    id: 5,
    timestamp: '2025-11-05 11:45:07',
    user: 'lab@example.com',
    action: 'Upload Lab Result',
    module: 'Laboratory',
    ip: '192.168.1.115',
    status: 'success'
  }
]

export default function AuditLogPage() {
  const [logs] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Berhasil'
      case 'failed': return 'Gagal'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaReceipt className="text-blue-500" />
        <span className="truncate">Audit Log</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari log..."
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
                <th className="py-3 px-2">Waktu</th>
                <th className="px-2">Pengguna</th>
                <th className="px-2 hidden sm:table-cell">Aksi</th>
                <th className="px-2">Modul</th>
                <th className="px-2 hidden md:table-cell">IP Address</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{log.timestamp.split(' ')[0]}</span>
                      <span className="text-xs text-gray-500">{log.timestamp.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td className="px-2">{log.user}</td>
                  <td className="px-2 hidden sm:table-cell">{log.action}</td>
                  <td className="px-2">{log.module}</td>
                  <td className="px-2 hidden md:table-cell">{log.ip}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {getStatusText(log.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaReceipt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada log audit yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Aktivitas</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Berhasil</p>
              <p className="text-lg md:text-2xl font-bold">
                {logs.filter(l => l.status === 'success').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Gagal</p>
              <p className="text-lg md:text-2xl font-bold">
                {logs.filter(l => l.status === 'failed').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Log</p>
              <p className="text-lg md:text-2xl font-bold">{logs.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Pengguna Aktif</p>
              <p className="text-lg md:text-2xl font-bold">4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Aktivitas Terakhir</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Login</span>
              <span className="font-bold">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Create Record</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Update Data</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Delete Record</span>
              <span className="font-bold">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}