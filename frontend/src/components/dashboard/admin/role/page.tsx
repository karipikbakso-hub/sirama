'use client'

import React, { useState } from 'react'

export default function RolePage() {
  const [roles] = useState([
    { id: 1, name: 'Administrator', permission: 'Semua Akses' },
    { id: 2, name: 'Dokter', permission: 'Input EMR, CPPT, Diagnosis' },
    { id: 3, name: 'Kasir', permission: 'Transaksi & Pembayaran' },
  ])

  return (
    <div className="min-h-screen p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 tracking-wide">🛡️ Manajemen Role</h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Nama Role"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Hak Akses"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition">
            Tambah Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3">Nama Role</th>
                <th>Hak Akses</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-purple-500/10 dark:hover:bg-purple-400/10 transition"
                >
                  <td className="py-3">{r.name}</td>
                  <td>{r.permission}</td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                      Edit
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
