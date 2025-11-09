'use client'

import { useState } from 'react'
import { FaClipboardList, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type StockOpname = {
  id: number
  medicineName: string
  medicineCode: string
  location: string
  systemStock: number
  actualStock: number
  difference: number
  opnameDate: string
  status: 'completed' | 'in-progress' | 'pending'
}

const initialData: StockOpname[] = [
  {
    id: 1,
    medicineName: 'Paracetamol 500mg',
    medicineCode: 'MED-2025-001',
    location: 'Apotek Rawat Jalan',
    systemStock: 200,
    actualStock: 195,
    difference: -5,
    opnameDate: '2025-11-06',
    status: 'completed'
  },
  {
    id: 2,
    medicineName: 'Amoxicillin 500mg',
    medicineCode: 'MED-2025-002',
    location: 'Gudang Farmasi',
    systemStock: 150,
    actualStock: 150,
    difference: 0,
    opnameDate: '2025-11-06',
    status: 'in-progress'
  },
  {
    id: 3,
    medicineName: 'Omeprazole 20mg',
    medicineCode: 'MED-2025-003',
    location: 'Apotek IGD',
    systemStock: 75,
    actualStock: 80,
    difference: 5,
    opnameDate: '2025-11-05',
    status: 'completed'
  },
  {
    id: 4,
    medicineName: 'Loratadine 10mg',
    medicineCode: 'MED-2025-004',
    location: 'Apotek Rawat Inap',
    systemStock: 100,
    actualStock: 98,
    difference: -2,
    opnameDate: '2025-11-04',
    status: 'pending'
  }
]

export default function OpnamePage() {
  const [opnames] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOpnames = opnames.filter(opname =>
    opname.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opname.medicineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opname.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'in-progress': return 'Dalam Proses'
      case 'pending': return 'Menunggu'
      default: return status
    }
  }

  const getDifferenceColor = (difference: number) => {
    if (difference > 0) return 'text-green-600 dark:text-green-400'
    if (difference < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaClipboardList className="text-blue-500" />
        <span className="truncate">Stock Opname</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari stock opname..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaClipboardList />
            <span className="hidden sm:inline">Buat Opname Baru</span>
            <span className="sm:hidden">Buat Opname</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Obat</th>
                <th className="px-2 hidden md:table-cell">Lokasi</th>
                <th className="px-2">Stok Sistem</th>
                <th className="px-2">Stok Aktual</th>
                <th className="px-2">Selisih</th>
                <th className="px-2 hidden sm:table-cell">Tanggal</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpnames.map((opname) => (
                <tr
                  key={opname.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{opname.medicineName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{opname.medicineCode}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{opname.location}</td>
                  <td className="px-2 font-medium">{opname.systemStock}</td>
                  <td className="px-2 font-medium">{opname.actualStock}</td>
                  <td className={`px-2 font-medium ${getDifferenceColor(opname.difference)}`}>
                    {opname.difference > 0 ? '+' : ''}{opname.difference}
                  </td>
                  <td className="px-2 hidden sm:table-cell">{opname.opnameDate}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(opname.status)}`}>
                      {getStatusText(opname.status)}
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

        {filteredOpnames.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaClipboardList className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data stock opname yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Stock Opname</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {opnames.filter(o => o.status === 'completed').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dalam Proses</p>
              <p className="text-lg md:text-2xl font-bold">
                {opnames.filter(o => o.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold">
                {opnames.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Opname</p>
              <p className="text-lg md:text-2xl font-bold">{opnames.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Selisih</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Selisih Positif</span>
              <span className="font-bold text-green-600 dark:text-green-400">+5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Selisih Negatif</span>
              <span className="font-bold text-red-600 dark:text-red-400">-7</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Selisih</span>
              <span className="font-bold">-0.5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Opname dengan Selisih Terbesar</span>
              <span className="font-bold">Paracetamol (-5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}