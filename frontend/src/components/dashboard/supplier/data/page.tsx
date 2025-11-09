'use client'

import { useState } from 'react'
import { FaBuilding, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type Supplier = {
  id: number
  name: string
  code: string
  contactPerson: string
  phone: string
  email: string
  status: 'active' | 'inactive'
}

const initialData: Supplier[] = [
  {
    id: 1,
    name: 'PT Medika Sejahtera',
    code: 'SUP-2025-001',
    contactPerson: 'Budi Santoso',
    phone: '021-1234567',
    email: 'budi@medikasejahtera.com',
    status: 'active'
  },
  {
    id: 2,
    name: 'CV Alat Kesehatan Indonesia',
    code: 'SUP-2025-002',
    contactPerson: 'Dewi Lestari',
    phone: '021-2345678',
    email: 'dewi@alkesindo.com',
    status: 'active'
  },
  {
    id: 3,
    name: 'PT Farmako Global',
    code: 'SUP-2025-003',
    contactPerson: 'Andi Prasetyo',
    phone: '021-3456789',
    email: 'andi@farmakoglobal.com',
    status: 'inactive'
  },
  {
    id: 4,
    name: 'CV Medis Supply',
    code: 'SUP-2025-004',
    contactPerson: 'Siti Rahayu',
    phone: '021-4567890',
    email: 'siti@medissupply.com',
    status: 'active'
  }
]

export default function DataSupplierPage() {
  const [suppliers] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Nonaktif'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaBuilding className="text-blue-500" />
        <span className="truncate">Data Supplier</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari supplier..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaBuilding />
            <span className="hidden sm:inline">Tambah Supplier</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Supplier</th>
                <th className="px-2 hidden md:table-cell">Kode</th>
                <th className="px-2 hidden sm:table-cell">Kontak</th>
                <th className="px-2">Telepon</th>
                <th className="px-2 hidden md:table-cell">Email</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{supplier.name}</span>
                      <span className="text-xs text-gray-500 md:hidden">{supplier.code}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{supplier.code}</td>
                  <td className="px-2 hidden sm:table-cell">{supplier.contactPerson}</td>
                  <td className="px-2">{supplier.phone}</td>
                  <td className="px-2 hidden md:table-cell">{supplier.email}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(supplier.status)}`}>
                      {getStatusText(supplier.status)}
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

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaBuilding className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data supplier yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Supplier</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Aktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {suppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Nonaktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {suppliers.filter(s => s.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Supplier</p>
              <p className="text-lg md:text-2xl font-bold">{suppliers.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Supplier Baru (30 hari)</p>
              <p className="text-lg md:text-2xl font-bold">2</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Kategori Supplier</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Alat Kesehatan</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Obat-obatan</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span>ATK & Umum</span>
              <span className="font-bold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Makanan & Minuman</span>
              <span className="font-bold">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}