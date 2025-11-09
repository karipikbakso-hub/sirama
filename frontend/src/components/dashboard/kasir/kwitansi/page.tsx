'use client'

import { useState } from 'react'
import { FaReceipt, FaSearch, FaPrint, FaEye } from 'react-icons/fa'

type Receipt = {
  id: number
  patientName: string
  medicalRecordNumber: string
  receiptDate: string
  amount: number
  cashier: string
  status: 'issued' | 'voided' | 'reissued'
}

const initialData: Receipt[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    receiptDate: '2025-11-05',
    amount: 150000,
    cashier: 'Kasir 1',
    status: 'issued'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    receiptDate: '2025-11-04',
    amount: 125000,
    cashier: 'Kasir 1',
    status: 'issued'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    receiptDate: '2025-11-03',
    amount: 125000,
    cashier: 'Kasir 2',
    status: 'voided'
  },
  {
    id: 4,
    patientName: 'Siti Rahayu',
    medicalRecordNumber: 'MR-2025-004',
    receiptDate: '2025-11-02',
    amount: 250000,
    cashier: 'Kasir 2',
    status: 'reissued'
  }
]

export default function KwitansiPage() {
  const [receipts] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredReceipts = receipts.filter(receipt =>
    receipt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'voided': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'reissued': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued': return 'Diterbitkan'
      case 'voided': return 'Dibatalkan'
      case 'reissued': return 'Diterbitkan Ulang'
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
        <FaReceipt className="text-blue-500" />
        <span className="truncate">Kwitansi</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari kwitansi..."
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
                <th className="px-2 hidden sm:table-cell">Tanggal Kwitansi</th>
                <th className="px-2">Jumlah</th>
                <th className="px-2 hidden md:table-cell">Kasir</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{receipt.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{receipt.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{receipt.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{receipt.receiptDate}</td>
                  <td className="px-2 font-medium">{formatCurrency(receipt.amount)}</td>
                  <td className="px-2 hidden md:table-cell">{receipt.cashier}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(receipt.status)}`}>
                      {getStatusText(receipt.status)}
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

        {filteredReceipts.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaReceipt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada kwitansi yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Kwitansi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diterbitkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {receipts.filter(r => r.status === 'issued').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dibatalkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {receipts.filter(r => r.status === 'voided').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diterbitkan Ulang</p>
              <p className="text-lg md:text-2xl font-bold">
                {receipts.filter(r => r.status === 'reissued').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Kwitansi</p>
              <p className="text-lg md:text-2xl font-bold">{receipts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Pendapatan</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hari Ini</span>
              <span className="font-bold">{formatCurrency(275000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Minggu Ini</span>
              <span className="font-bold">{formatCurrency(1850000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Bulan Ini</span>
              <span className="font-bold">{formatCurrency(8750000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Kasir Terbaik</span>
              <span className="font-bold">Kasir 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}