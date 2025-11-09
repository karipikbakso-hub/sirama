'use client'

import { useState } from 'react'
import { FaBuilding, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type Asset = {
  id: number
  name: string
  code: string
  category: string
  purchaseDate: string
  value: number
  status: 'active' | 'maintenance' | 'disposed'
}

const initialData: Asset[] = [
  {
    id: 1,
    name: 'Mesin X-Ray',
    code: 'AST-2025-001',
    category: 'Peralatan Medis',
    purchaseDate: '2025-01-15',
    value: 50000000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Kursi Roda',
    code: 'AST-2025-002',
    category: 'Peralatan Pendukung',
    purchaseDate: '2025-02-20',
    value: 2500000,
    status: 'active'
  },
  {
    id: 3,
    name: 'Meja Operasi',
    code: 'AST-2025-003',
    category: 'Peralatan Medis',
    purchaseDate: '2025-03-10',
    value: 35000000,
    status: 'maintenance'
  },
  {
    id: 4,
    name: 'AC Central',
    code: 'AST-2025-004',
    category: 'Fasilitas',
    purchaseDate: '2025-04-05',
    value: 15000000,
    status: 'active'
  }
]

export default function AsetPage() {
  const [assets] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'disposed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'maintenance': return 'Perbaikan'
      case 'disposed': return 'Dihapus'
      default: return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaBuilding className="text-blue-500" />
        <span className="truncate">Data Aset</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari aset..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaBuilding />
            <span className="hidden sm:inline">Tambah Aset</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Aset</th>
                <th className="px-2 hidden md:table-cell">Kode</th>
                <th className="px-2 hidden sm:table-cell">Kategori</th>
                <th className="px-2">Tanggal Beli</th>
                <th className="px-2 hidden md:table-cell">Nilai</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{asset.name}</span>
                      <span className="text-xs text-gray-500 md:hidden">{asset.code}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{asset.code}</td>
                  <td className="px-2 hidden sm:table-cell">{asset.category}</td>
                  <td className="px-2">{asset.purchaseDate}</td>
                  <td className="px-2 hidden md:table-cell font-medium">{formatCurrency(asset.value)}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>
                      {getStatusText(asset.status)}
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

        {filteredAssets.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaBuilding className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data aset yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Aset</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Aktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {assets.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Perbaikan</p>
              <p className="text-lg md:text-2xl font-bold">
                {assets.filter(a => a.status === 'maintenance').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dihapus</p>
              <p className="text-lg md:text-2xl font-bold">
                {assets.filter(a => a.status === 'disposed').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Aset</p>
              <p className="text-lg md:text-2xl font-bold">{assets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Nilai Aset</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Nilai Aset</span>
              <span className="font-bold">{formatCurrency(assets.reduce((sum, asset) => sum + asset.value, 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Nilai</span>
              <span className="font-bold">{formatCurrency(assets.reduce((sum, asset) => sum + asset.value, 0) / assets.length)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Aset Tertinggi</span>
              <span className="font-bold">{formatCurrency(Math.max(...assets.map(a => a.value)))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Aset Terendah</span>
              <span className="font-bold">{formatCurrency(Math.min(...assets.map(a => a.value)))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}