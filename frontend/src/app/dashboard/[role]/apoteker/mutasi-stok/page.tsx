'use client'

import { useState } from 'react'
import { FaExchangeAlt, FaSearch, FaPlus, FaEye } from 'react-icons/fa'

type StockMutation = {
  id: number
  medicineName: string
  mutationDate: string
  fromLocation: string
  toLocation: string
  quantity: number
  unit: string
  status: 'completed' | 'pending' | 'cancelled'
}

const initialData: StockMutation[] = [
  {
    id: 1,
    medicineName: 'Paracetamol 500mg',
    mutationDate: '2025-11-05',
    fromLocation: 'Gudang Obat',
    toLocation: 'Apotek Rawat Jalan',
    quantity: 50,
    unit: 'Tablet',
    status: 'completed'
  },
  {
    id: 2,
    medicineName: 'Amoxicillin 250mg',
    mutationDate: '2025-11-04',
    fromLocation: 'Gudang Obat',
    toLocation: 'Apotek IGD',
    quantity: 30,
    unit: 'Kapsul',
    status: 'completed'
  },
  {
    id: 3,
    medicineName: 'Metformin 500mg',
    mutationDate: '2025-11-03',
    fromLocation: 'Apotek Rawat Jalan',
    toLocation: 'Apotek IGD',
    quantity: 20,
    unit: 'Tablet',
    status: 'pending'
  },
  {
    id: 4,
    medicineName: 'Losartan 50mg',
    mutationDate: '2025-11-02',
    fromLocation: 'Apotek IGD',
    toLocation: 'Gudang Obat',
    quantity: 15,
    unit: 'Tablet',
    status: 'completed'
  }
]

export default function MutasiStokPage() {
  const [mutations] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMutations = mutations.filter(mutation =>
    mutation.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mutation.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mutation.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'pending': return 'Menunggu'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaExchangeAlt className="text-blue-500" />
          <span>Mutasi Stok</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola perpindahan stok obat antar lokasi
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari mutasi stok..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaPlus />
            <span className="hidden sm:inline">Tambah Mutasi</span>
            <span className="sm:hidden">Mutasi</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Obat</th>
                <th className="px-2 hidden sm:table-cell">Tanggal Mutasi</th>
                <th className="px-2">Dari</th>
                <th className="px-2">Ke</th>
                <th className="px-2">Jumlah</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMutations.map((mutation) => (
                <tr
                  key={mutation.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{mutation.medicineName}</span>
                      <span className="text-xs text-gray-500 sm:hidden">{mutation.mutationDate}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden sm:table-cell">{mutation.mutationDate}</td>
                  <td className="px-2">
                    <div className="max-w-[100px] truncate">{mutation.fromLocation}</div>
                  </td>
                  <td className="px-2">
                    <div className="max-w-[100px] truncate">{mutation.toLocation}</div>
                  </td>
                  <td className="px-2 font-medium">{mutation.quantity} {mutation.unit}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(mutation.status)}`}>
                      {getStatusText(mutation.status)}
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

        {filteredMutations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaExchangeAlt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada mutasi stok yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik Mutasi Stok
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {mutations.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {mutations.filter(m => m.status === 'pending').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dibatalkan</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {mutations.filter(m => m.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Mutasi</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{mutations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Lokasi Mutasi
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Gudang → Apotek</span>
              <span className="font-bold text-gray-800 dark:text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Apotek Rawat Jalan → IGD</span>
              <span className="font-bold text-gray-800 dark:text-white">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">IGD → Gudang</span>
              <span className="font-bold text-gray-800 dark:text-white">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Apotek → Laboratorium</span>
              <span className="font-bold text-gray-800 dark:text-white">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Lainnya</span>
              <span className="font-bold text-gray-800 dark:text-white">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
