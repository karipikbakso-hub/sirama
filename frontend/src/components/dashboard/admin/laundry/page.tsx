'use client'

import { useState } from 'react'

type LaundryItem = {
  id: number
  nama: string
  status: 'pending' | 'proses' | 'selesai'
  tanggal: string
  petugas: string
  jenis: string
}

export default function LaundryPage() {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'proses' | 'selesai'>('pending')
  const [items, setItems] = useState<LaundryItem[]>([
    { id: 1, nama: 'Sprei Kamar 101', status: 'pending', tanggal: '2025-10-27', petugas: 'Dina', jenis: 'Sprei' },
    { id: 2, nama: 'Seragam Petugas', status: 'proses', tanggal: '2025-10-26', petugas: 'Rudi', jenis: 'Seragam' },
    { id: 3, nama: 'Handuk VIP', status: 'selesai', tanggal: '2025-10-25', petugas: 'Lina', jenis: 'Handuk' },
    { id: 4, nama: 'Gorden Ruang Tunggu', status: 'pending', tanggal: '2025-10-27', petugas: 'Dina', jenis: 'Gorden' },
  ])

  const filtered = items.filter(item => item.status === selectedStatus)

  const updateStatus = (id: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === 'pending'
                  ? 'proses'
                  : item.status === 'proses'
                  ? 'selesai'
                  : 'selesai',
            }
          : item
      )
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white transition">Modul Laundry</h2>

      {/* Filter Status */}
      <div className="flex gap-3">
        {['pending', 'proses', 'selesai'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              selectedStatus === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabel Laundry */}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Petugas</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr
                key={item.id}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.jenis}</td>
                <td className="px-4 py-2">{item.tanggal}</td>
                <td className="px-4 py-2">{item.petugas}</td>
                <td className="px-4 py-2 capitalize">{item.status}</td>
                <td className="px-4 py-2">
                  {item.status !== 'selesai' ? (
                    <button
                      onClick={() => updateStatus(item.id)}
                      className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:scale-105 transition"
                    >
                      Ubah ke {item.status === 'pending' ? 'Proses' : 'Selesai'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">✓ Selesai</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada data untuk status <strong>{selectedStatus}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}