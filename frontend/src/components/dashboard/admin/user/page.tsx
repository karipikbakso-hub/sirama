'use client'

import React, { useState } from 'react'

export default function UserPage() {
  const [users] = useState([
    { id: 1, name: 'Admin Utama', email: 'admin@rs.com', role: 'Administrator' },
    { id: 2, name: 'Dokter Andi', email: 'andi@rs.com', role: 'Dokter' },
    { id: 3, name: 'Kasir Lina', email: 'lina@rs.com', role: 'Kasir' },
  ])

  return (
    <div className="min-h-screen p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 tracking-wide">👥 Manajemen Pengguna</h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Nama Pengguna"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition">
            Tambah User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3">Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
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
