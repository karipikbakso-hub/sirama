'use client'

import { useState } from 'react'
import { FaBoxes, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'

type MedicineStock = {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  expiryDate: string
  status: 'available' | 'low' | 'out' | 'expired'
}

const initialData: MedicineStock[] = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Analgesik',
    quantity: 150,
    unit: 'Tablet',
    minStock: 50,
    expiryDate: '2026-12-31',
    status: 'available'
  },
  {
    id: 2,
    name: 'Amoxicillin 250mg',
    category: 'Antibiotik',
    quantity: 25,
    unit: 'Kapsul',
    minStock: 50,
    expiryDate: '2026-11-30',
    status: 'low'
  },
  {
    id: 3,
    name: 'Metformin 500mg',
    category: 'Antidiabetes',
    quantity: 0,
    unit: 'Tablet',
    minStock: 100,
    expiryDate: '2026-10-15',
    status: 'out'
  },
  {
    id: 4,
    name: 'Losartan 50mg',
    category: 'Antihypertensi',
    quantity: 75,
    unit: 'Tablet',
    minStock: 50,
    expiryDate: '2024-05-20',
    status: 'expired'
  }
]

export default function StokObatPage() {
  const [medicines] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'out': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Tersedia'
      case 'low': return 'Stok Rendah'
      case 'out': return 'Habis'
      case 'expired': return 'Kadaluarsa'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaBoxes className="text-blue-500" />
          <span>Manajemen Stok</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pantau dan kelola stok obat di apotek
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
              placeholder="Cari obat..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaPlus />
            <span className="hidden sm:inline">Tambah Obat</span>
            <span className="sm:hidden">Obat</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Obat</th>
                <th className="px-2 hidden sm:table-cell">Kategori</th>
                <th className="px-2">Jumlah</th>
                <th className="px-2 hidden md:table-cell">Tanggal Kadaluarsa</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr
                  key={medicine.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{medicine.name}</span>
                      <span className="text-xs text-gray-500 sm:hidden">{medicine.category}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden sm:table-cell">{medicine.category}</td>
                  <td className="px-2">
                    <div className={`font-medium ${medicine.quantity <= medicine.minStock ? 'text-red-500' : ''}`}>
                      {medicine.quantity} {medicine.unit}
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden">
                      Min: {medicine.minStock}
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{medicine.expiryDate}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(medicine.status)}`}>
                      {getStatusText(medicine.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
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

        {filteredMedicines.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaBoxes className="mx-auto text-4xl mb-2" />
            <p>Tidak ada obat yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik Stok Obat
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Tersedia</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {medicines.filter(m => m.status === 'available').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Stok Rendah</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {medicines.filter(m => m.status === 'low').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Habis</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {medicines.filter(m => m.status === 'out').length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Kadaluarsa</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {medicines.filter(m => m.status === 'expired').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Kategori Obat
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Analgesik</span>
              <span className="font-bold text-gray-800 dark:text-white">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Antibiotik</span>
              <span className="font-bold text-gray-800 dark:text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Antidiabetes</span>
              <span className="font-bold text-gray-800 dark:text-white">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Antihypertensi</span>
              <span className="font-bold text-gray-800 dark:text-white">10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Vitamin & Suplemen</span>
              <span className="font-bold text-gray-800 dark:text-white">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
