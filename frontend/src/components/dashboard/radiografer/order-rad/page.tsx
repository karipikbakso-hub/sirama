'use client'

import { useState } from 'react'
import { FaXRay, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type RadiologyOrder = {
  id: number
  patientName: string
  patientId: string
  orderDate: string
  orderedBy: string
  testName: string
  status: 'ordered' | 'processing' | 'completed' | 'cancelled'
}

const initialData: RadiologyOrder[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    patientId: 'PAT-2025-001',
    orderDate: '2025-11-06',
    orderedBy: 'Dr. Andi Prasetyo',
    testName: 'Rontgen Thorax',
    status: 'processing'
  },
  {
    id: 2,
    patientName: 'Siti Rahayu',
    patientId: 'PAT-2025-002',
    orderDate: '2025-11-06',
    orderedBy: 'Dr. Dewi Lestari',
    testName: 'USG Abdomen',
    status: 'ordered'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    patientId: 'PAT-2025-003',
    orderDate: '2025-11-05',
    orderedBy: 'Dr. Budi Santoso',
    testName: 'CT Scan Kepala',
    status: 'completed'
  },
  {
    id: 4,
    patientName: 'Rina Kusuma',
    patientId: 'PAT-2025-004',
    orderDate: '2025-11-04',
    orderedBy: 'Dr. Joko Susilo',
    testName: 'MRI Lumbal Spine',
    status: 'cancelled'
  }
]

export default function OrderRadiologiPage() {
  const [radiologyOrders] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = radiologyOrders.filter(order =>
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderedBy.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ordered': return 'Dipesan'
      case 'processing': return 'Diproses'
      case 'completed': return 'Selesai'
      case 'cancelled': return 'Dibatalkan'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaXRay className="text-blue-500" />
        <span className="truncate">Order Radiologi</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari order radiologi..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaXRay />
            <span className="hidden sm:inline">Buat Order Baru</span>
            <span className="sm:hidden">Buat Order</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">ID Pasien</th>
                <th className="px-2">Tanggal Order</th>
                <th className="px-2 hidden sm:table-cell">Dipesan Oleh</th>
                <th className="px-2">Nama Tes</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{order.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{order.patientId}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{order.patientId}</td>
                  <td className="px-2">{order.orderDate}</td>
                  <td className="px-2 hidden sm:table-cell">{order.orderedBy}</td>
                  <td className="px-2">
                    <div className="max-w-xs truncate">{order.testName}</div>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
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

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaXRay className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data order radiologi yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Order Radiologi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dipesan</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyOrders.filter(o => o.status === 'ordered').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diproses</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyOrders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyOrders.filter(o => o.status === 'completed').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dibatalkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyOrders.filter(o => o.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Order Radiologi</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Order Hari Ini</span>
              <span className="font-bold">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Order per Hari</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tes Terbanyak</span>
              <span className="font-bold">Rontgen Thorax</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Dokter dengan Order Terbanyak</span>
              <span className="font-bold">Dr. Andi Prasetyo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}