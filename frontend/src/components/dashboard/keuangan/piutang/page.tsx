'use client'

import { useState } from 'react'
import { FaMoneyBillWave, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa'

type Receivable = {
  id: number
  patientName: string
  medicalRecordNumber: string
  invoiceNumber: string
  invoiceDate: string
  amount: number
  dueDate: string
  status: 'paid' | 'unpaid' | 'overdue' | 'partial'
}

const initialData: Receivable[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    invoiceNumber: 'INV-2025-001',
    invoiceDate: '2025-11-01',
    amount: 1500000,
    dueDate: '2025-11-30',
    status: 'unpaid'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    invoiceNumber: 'INV-2025-002',
    invoiceDate: '2025-11-02',
    amount: 2250000,
    dueDate: '2025-12-02',
    status: 'partial'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    invoiceNumber: 'INV-2025-003',
    invoiceDate: '2025-11-03',
    amount: 3100000,
    dueDate: '2025-11-03',
    status: 'paid'
  },
  {
    id: 4,
    patientName: 'Siti Rahayu',
    medicalRecordNumber: 'MR-2025-004',
    invoiceNumber: 'INV-2025-004',
    invoiceDate: '2025-10-28',
    amount: 1250000,
    dueDate: '2025-11-27',
    status: 'overdue'
  }
]

export default function PiutangPage() {
  const [receivables] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredReceivables = receivables.filter(receivable =>
    receivable.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receivable.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receivable.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'unpaid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Lunas'
      case 'unpaid': return 'Belum Bayar'
      case 'overdue': return 'Jatuh Tempo'
      case 'partial': return 'Bayar Sebagian'
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
        <FaMoneyBillWave className="text-blue-500" />
        <span className="truncate">Piutang</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari piutang..."
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
                <th className="px-2">No. Invoice</th>
                <th className="px-2 hidden sm:table-cell">Tanggal Invoice</th>
                <th className="px-2">Jumlah</th>
                <th className="px-2 hidden md:table-cell">Jatuh Tempo</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivables.map((receivable) => (
                <tr
                  key={receivable.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{receivable.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{receivable.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{receivable.medicalRecordNumber}</td>
                  <td className="px-2 font-medium">{receivable.invoiceNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{receivable.invoiceDate}</td>
                  <td className="px-2 font-medium">{formatCurrency(receivable.amount)}</td>
                  <td className="px-2 hidden md:table-cell">{receivable.dueDate}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(receivable.status)}`}>
                      {getStatusText(receivable.status)}
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

        {filteredReceivables.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaMoneyBillWave className="mx-auto text-4xl mb-2" />
            <p>Tidak ada piutang yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Piutang</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Lunas</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(receivables.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Belum Bayar</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(receivables.filter(r => r.status === 'unpaid').reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Jatuh Tempo</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(receivables.filter(r => r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Bayar Sebagian</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(receivables.filter(r => r.status === 'partial').reduce((sum, r) => sum + r.amount, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Piutang</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Piutang</span>
              <span className="font-bold">{formatCurrency(receivables.reduce((sum, r) => sum + r.amount, 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sudah Diterima</span>
              <span className="font-bold text-green-500">
                {formatCurrency(receivables.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Belum Diterima</span>
              <span className="font-bold text-red-500">
                {formatCurrency(receivables.filter(r => r.status !== 'paid').reduce((sum, r) => sum + r.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Persentase Lunas</span>
              <span className="font-bold">
                {Math.round((receivables.filter(r => r.status === 'paid').length / receivables.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}