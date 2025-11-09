'use client'

import { useState } from 'react'
import { FaFileInvoice, FaSearch, FaEye, FaPrint } from 'react-icons/fa'

type Billing = {
  id: number
  patientName: string
  medicalRecordNumber: string
  billingDate: string
  totalAmount: number
  paidAmount: number
  status: 'unpaid' | 'partial' | 'paid' | 'overdue'
}

const initialData: Billing[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    billingDate: '2025-11-05',
    totalAmount: 150000,
    paidAmount: 0,
    status: 'unpaid'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    billingDate: '2025-11-04',
    totalAmount: 275000,
    paidAmount: 150000,
    status: 'partial'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    billingDate: '2025-11-03',
    totalAmount: 125000,
    paidAmount: 125000,
    status: 'paid'
  },
  {
    id: 4,
    patientName: 'Siti Rahayu',
    medicalRecordNumber: 'MR-2025-004',
    billingDate: '2025-10-20',
    totalAmount: 320000,
    paidAmount: 0,
    status: 'overdue'
  }
]

export default function BillingPage() {
  const [bills] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBills = bills.filter(bill =>
    bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'overdue': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unpaid': return 'Belum Dibayar'
      case 'partial': return 'Dibayar Sebagian'
      case 'paid': return 'Lunas'
      case 'overdue': return 'Jatuh Tempo'
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
        <FaFileInvoice className="text-blue-500" />
        <span className="truncate">Billing</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari billing..."
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
                <th className="px-2 hidden sm:table-cell">Tanggal Billing</th>
                <th className="px-2">Total Tagihan</th>
                <th className="px-2 hidden md:table-cell">Dibayar</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{bill.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{bill.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{bill.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{bill.billingDate}</td>
                  <td className="px-2 font-medium">{formatCurrency(bill.totalAmount)}</td>
                  <td className="px-2 hidden md:table-cell">{formatCurrency(bill.paidAmount)}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                      {getStatusText(bill.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEye />
                      </button>
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaFileInvoice className="mx-auto text-4xl mb-2" />
            <p>Tidak ada billing yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Billing</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Belum Dibayar</p>
              <p className="text-lg md:text-2xl font-bold">
                {bills.filter(b => b.status === 'unpaid').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dibayar Sebagian</p>
              <p className="text-lg md:text-2xl font-bold">
                {bills.filter(b => b.status === 'partial').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Lunas</p>
              <p className="text-lg md:text-2xl font-bold">
                {bills.filter(b => b.status === 'paid').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Jatuh Tempo</p>
              <p className="text-lg md:text-2xl font-bold">
                {bills.filter(b => b.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Pendapatan</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hari Ini</span>
              <span className="font-bold">{formatCurrency(1250000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Minggu Ini</span>
              <span className="font-bold">{formatCurrency(7850000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Bulan Ini</span>
              <span className="font-bold">{formatCurrency(32500000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Piutang</span>
              <span className="font-bold text-red-500">{formatCurrency(15750000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}