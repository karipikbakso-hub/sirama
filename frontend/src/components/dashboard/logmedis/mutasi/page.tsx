'use client'

import { useState } from 'react'
import { FaExchangeAlt, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type MedicineMutation = {
  id: number
  medicineName: string
  medicineCode: string
  fromLocation: string
  toLocation: string
  quantity: number
  unit: string
  mutationDate: string
  status: 'completed' | 'pending' | 'cancelled'
}

const initialData: MedicineMutation[] = [
  {
    id: 1,
    medicineName: 'Paracetamol 500mg',
    medicineCode: 'MED-2025-001',
    fromLocation: 'Gudang Farmasi',
    toLocation: 'Apotek Rawat Jalan',
    quantity: 100,
    unit: 'tablet',
    mutationDate: '2025-11-06',
    status: 'completed'
  },
  {
    id: 2,
    medicineName: 'Amoxicillin 500mg',
    medicineCode: 'MED-2025-002',
    fromLocation: 'Gudang Farmasi',
    toLocation: 'Apotek IGD',
    quantity: 50,
    unit: 'kapsul',
    mutationDate: '2025-11-06',
    status: 'pending'
  },
  {
    id: 3,
    medicineName: 'Omeprazole 20mg',
    medicineCode: 'MED-2025-003',
    fromLocation: 'Apotek Rawat Inap',
    toLocation: 'Apotek IGD',
    quantity: 30,
    unit: 'kapsul',
    mutationDate: '2025-11-05',
    status: 'completed'
  },
  {
    id: 4,
    medicineName: 'Loratadine 10mg',
    medicineCode: 'MED-2025-004',
    fromLocation: 'Gudang Farmasi',
    toLocation: 'Apotek Rawat Inap',
    quantity: 50,
    unit: 'tablet',
    mutationDate: '2025-11-04',
    status: 'cancelled'
  }
]

export default function MutasiObatPage() {
  const [mutations] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMutations = mutations.filter(mutation =>
    mutation.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mutation.medicineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaExchangeAlt className="text-blue-500" />
        <span className="truncate">Mutasi Obat</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari mutasi obat..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaExchangeAlt />
            <span className="hidden sm:inline">Buat Mutasi Baru</span>
            <span className="sm:hidden">Buat Mutasi</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Obat</th>
                <th className="px-2 hidden md:table-cell">Dari</th>
                <th className="px-2">Ke</th>
                <th className="px-2">Jumlah</th>
                <th className="px-2 hidden sm:table-cell">Tanggal</th>
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
                      <span className="text-xs text-gray-500 md:hidden">{mutation.medicineCode}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{mutation.fromLocation}</td>
                  <td className="px-2">{mutation.toLocation}</td>
                  <td className="px-2 font-medium">{mutation.quantity} {mutation.unit}</td>
                  <td className="px-2 hidden sm:table-cell">{mutation.mutationDate}</td>
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
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEdit />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
                        <FaTrash />
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
            <p>Tidak ada data mutasi obat yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Mutasi Obat</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {mutations.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold">
                {mutations.filter(m => m.status === 'pending').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dibatalkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {mutations.filter(m => m.status === 'cancelled').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Mutasi</p>
              <p className="text-lg md:text-2xl font-bold">{mutations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Mutasi</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Mutasi Hari Ini</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Mutasi per Hari</span>
              <span className="font-bold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Lokasi Pengiriman Terbanyak</span>
              <span className="font-bold">Apotek Rawat Jalan</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Lokasi Penerima Terbanyak</span>
              <span className="font-bold">Gudang Farmasi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}