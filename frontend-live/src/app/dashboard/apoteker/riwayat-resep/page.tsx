'use client'

import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

type Resep = {
  pasien: string
  obat: string
  tanggal: string
  status: 'Selesai' | 'Pending' | 'Dibatalkan'
}

const allData: Resep[] = [
  { pasien: 'Dewi', obat: 'Paracetamol', tanggal: '2025-10-25', status: 'Selesai' },
  { pasien: 'Andi', obat: 'Omeprazole', tanggal: '2025-10-26', status: 'Pending' },
  { pasien: 'Rina', obat: 'Ibuprofen', tanggal: '2025-10-24', status: 'Selesai' },
  { pasien: 'Budi', obat: 'Cetirizine', tanggal: '2025-10-23', status: 'Dibatalkan' },
  { pasien: 'Siti', obat: 'Metformin', tanggal: '2025-10-22', status: 'Selesai' },
  { pasien: 'Andi', obat: 'Simvastatin', tanggal: '2025-10-21', status: 'Pending' },
  { pasien: 'Dewi', obat: 'Amlodipine', tanggal: '2025-10-20', status: 'Selesai' },
  { pasien: 'Tono', obat: 'Ciprofloxacin', tanggal: '2025-10-19', status: 'Dibatalkan' },
  { pasien: 'Lina', obat: 'Lansoprazole', tanggal: '2025-10-18', status: 'Selesai' },
  { pasien: 'Agus', obat: 'Paracetamol', tanggal: '2025-10-17', status: 'Pending' },
]

export default function RiwayatResepPage() {
  const [search, setSearch] = useState('')
  const filtered = allData.filter(r =>
    r.pasien.toLowerCase().includes(search.toLowerCase()) ||
    r.obat.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📄 Riwayat Resep</h1>

      <div className="flex items-center gap-2 max-w-md">
        <FiSearch className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          placeholder="Cari pasien atau obat..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Pasien</th>
              <th className="px-4 py-3 text-left">Obat</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{r.pasien}</td>
                <td className="px-4 py-2">{r.obat}</td>
                <td className="px-4 py-2">{r.tanggal}</td>
                <td className="px-4 py-2 font-medium">
                  <span className={`px-2 py-1 rounded text-xs ${
                    r.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : r.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}