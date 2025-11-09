'use client'

import { useState } from 'react'
import { FaCapsules, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type MedicineStock = {
  id: number
  name: string
  code: string
  category: string
  unit: string
  stock: number
  minStock: number
  price: number
  status: 'available' | 'low-stock' | 'out-of-stock'
}

const initialData: MedicineStock[] = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    code: 'OBAT-2025-001',
    category: 'Obat Generik',
    unit: 'Tablet',
    stock: 5000,
    minStock: 1000,
    price: 1500,
    status: 'available'
  },
  {
    id: 2,
    name: 'Amoxicillin 250mg',
    code: 'OBAT-2025-002',
    category: 'Antibiotik',
    unit: 'Capsule',
    stock: 800,
    minStock: 1000,
    price: 2500,
    status: 'low-stock'
  },
  {
    id: 3,
    name: 'Infus Normal Saline 0.9%',
    code: 'ALKES-2025-001',
    category: 'Alat Kesehatan',
    unit: 'Botol',
    stock: 0,
    minStock: 50,
    price: 15000,
    status: 'out-of-stock'
  },
  {
    id: 4,
    name: 'Masker Medis',
    code: 'ALKES-2025-002',
    category: 'Alat Kesehatan',
    unit: 'Pcs',
    stock: 10000,
    minStock: 2000,
    price: 750,
    status: 'available'
  }
]

export default function StokObatPage() {
  const [stocks] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'out-of-stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Tersedia'
      case 'low-stock': return 'Stok Rendah'
      case 'out-of-stock': return 'Habis'
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
        <FaCapsules className="text-blue-500" />
        <span className="truncate">Stok Obat & Alkes</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari obat/alkes..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaCapsules />
            <span className="hidden sm:inline">Tambah Item</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Item</th>
                <th className="px-2 hidden md:table-cell">Kode</th>
                <th className="px-2 hidden sm:table-cell">Kategori</th>
                <th className="px-2">Satuan</th>
                <th className="px-2 text-right">Stok</th>
                <th className="px-2 text-right hidden md:table-cell">Harga</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr
                  key={stock.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{stock.name}</span>
                      <span className="text-xs text-gray-500 md:hidden">{stock.code}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{stock.code}</td>
                  <td className="px-2 hidden sm:table-cell">{stock.category}</td>
                  <td className="px-2">{stock.unit}</td>
                  <td className="px-2 text-right font-medium">{stock.stock}</td>
                  <td className="px-2 text-right hidden md:table-cell">{formatCurrency(stock.price)}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(stock.status)}`}>
                      {getStatusText(stock.status)}
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

        {filteredStocks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaCapsules className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data stok yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Stok</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Tersedia</p>
              <p className="text-lg md:text-2xl font-bold">
                {stocks.filter(s => s.status === 'available').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Stok Rendah</p>
              <p className="text-lg md:text-2xl font-bold">
                {stocks.filter(s => s.status === 'low-stock').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Habis</p>
              <p className="text-lg md:text-2xl font-bold">
                {stocks.filter(s => s.status === 'out-of-stock').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Item</p>
              <p className="text-lg md:text-2xl font-bold">{stocks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Kategori Stok</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Obat Generik</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Antibiotik</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Alat Kesehatan</span>
              <span className="font-bold">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Vitamin & Suplemen</span>
              <span className="font-bold">5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}