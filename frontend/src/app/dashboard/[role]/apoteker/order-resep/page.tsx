'use client'

import { useState } from 'react'
import { FaReceipt, FaSearch, FaEye, FaCheckCircle } from 'react-icons/fa'

type PrescriptionOrder = {
  id: number
  patientName: string
  medicalRecordNumber: string
  orderDate: string
  doctor: string
  medications: string
  status: 'ordered' | 'processing' | 'completed' | 'dispensed'
}

const initialData: PrescriptionOrder[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    orderDate: '2025-11-05',
    doctor: 'dr. Andi Prasetyo',
    medications: 'Paracetamol, Amoxicillin',
    status: 'ordered'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    orderDate: '2025-11-04',
    doctor: 'dr. Andi Prasetyo',
    medications: 'Metformin, Gliclazide',
    status: 'processing'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    orderDate: '2025-11-03',
    doctor: 'dr. Andi Prasetyo',
    medications: 'Sumatriptan, Propranolol',
    status: 'completed'
  }
]

export default function OrderResepPage() {
  const [orders] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = orders.filter(order =>
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.medications.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'dispensed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ordered': return 'Dipesan'
      case 'processing': return 'Diproses'
      case 'completed': return 'Selesai'
      case 'dispensed': return 'Diberikan'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaReceipt className="text-blue-500" />
          <span>Order Resep</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola dan pantau order resep obat dari dokter
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
              placeholder="Cari order resep..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">No. Rekam Medis</th>
                <th className="px-2 hidden sm:table-cell">Tanggal Order</th>
                <th className="px-2">Obat</th>
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
                      <span className="text-xs text-gray-500 md:hidden">{order.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{order.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{order.orderDate}</td>
                  <td className="px-2">
                    <div className="max-w-xs truncate">{order.medications}</div>
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
                      <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition">
                        <FaCheckCircle />
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
            <FaReceipt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada order resep yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik Order Resep
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Order</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{orders.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diberikan</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {orders.filter(o => o.status === 'dispensed').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diproses</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Resep Terbanyak Hari Ini
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Paracetamol 500mg</span>
              <span className="font-bold text-gray-800 dark:text-white">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Amoxicillin 250mg</span>
              <span className="font-bold text-gray-800 dark:text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Metformin 500mg</span>
              <span className="font-bold text-gray-800 dark:text-white">10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Losartan 50mg</span>
              <span className="font-bold text-gray-800 dark:text-white">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Simvastatin 20mg</span>
              <span className="font-bold text-gray-800 dark:text-white">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
