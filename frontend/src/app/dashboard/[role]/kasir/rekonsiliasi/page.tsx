'use client'

import { useState } from 'react'
import { FaBalanceScale, FaSearch, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

type Reconciliation = {
  id: number
  date: string
  cashier: string
  expectedAmount: number
  actualAmount: number
  difference: number
  status: 'matched' | 'discrepancy' | 'pending'
  notes?: string
}

const initialData: Reconciliation[] = [
  {
    id: 1,
    date: '2025-11-05',
    cashier: 'Siti Aminah',
    expectedAmount: 2500000,
    actualAmount: 2500000,
    difference: 0,
    status: 'matched'
  },
  {
    id: 2,
    date: '2025-11-04',
    cashier: 'Ahmad Rahman',
    expectedAmount: 3200000,
    actualAmount: 3180000,
    difference: -20000,
    status: 'discrepancy',
    notes: 'Kurang setor ke bank'
  },
  {
    id: 3,
    date: '2025-11-03',
    cashier: 'Siti Aminah',
    expectedAmount: 2800000,
    actualAmount: 2800000,
    difference: 0,
    status: 'matched'
  },
  {
    id: 4,
    date: '2025-11-02',
    cashier: 'Ahmad Rahman',
    expectedAmount: 3500000,
    actualAmount: 3520000,
    difference: 20000,
    status: 'discrepancy',
    notes: 'Lebih setor ke bank'
  }
]

export default function RekonsiliasiPage() {
  const [reconciliations] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredReconciliations = reconciliations.filter(reconciliation =>
    reconciliation.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reconciliation.date.includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'discrepancy': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'matched': return 'Sesuai'
      case 'discrepancy': return 'Selisih'
      case 'pending': return 'Menunggu'
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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaBalanceScale className="text-blue-500" />
          <span>Rekonsiliasi</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pencocokan dan verifikasi laporan keuangan kasir
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
              placeholder="Cari rekonsiliasi..."
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
                <th className="py-3 px-2">Tanggal</th>
                <th className="px-2">Kasir</th>
                <th className="px-2">Nominal Sistem</th>
                <th className="px-2">Nominal Aktual</th>
                <th className="px-2">Selisih</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReconciliations.map((reconciliation) => (
                <tr
                  key={reconciliation.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    {reconciliation.date}
                  </td>
                  <td className="px-2">
                    {reconciliation.cashier}
                  </td>
                  <td className="px-2 font-medium">
                    {formatCurrency(reconciliation.expectedAmount)}
                  </td>
                  <td className="px-2 font-medium">
                    {formatCurrency(reconciliation.actualAmount)}
                  </td>
                  <td className={`px-2 font-medium ${reconciliation.difference < 0 ? 'text-red-600' : reconciliation.difference > 0 ? 'text-green-600' : ''}`}>
                    {reconciliation.difference !== 0 ? formatCurrency(reconciliation.difference) : '-'}
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reconciliation.status)}`}>
                      {getStatusText(reconciliation.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaCheckCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReconciliations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaBalanceScale className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data rekonsiliasi yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Ringkasan Rekonsiliasi
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Sesuai</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {reconciliations.filter(r => r.status === 'matched').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selisih</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {reconciliations.filter(r => r.status === 'discrepancy').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {reconciliations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Rekonsiliasi</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{reconciliations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Total Selisih
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Total Selisih Positif</span>
              <span className="font-bold text-green-600">
                {formatCurrency(reconciliations.filter(r => r.difference > 0).reduce((sum, r) => sum + r.difference, 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Total Selisih Negatif</span>
              <span className="font-bold text-red-600">
                {formatCurrency(reconciliations.filter(r => r.difference < 0).reduce((sum, r) => sum + r.difference, 0))}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-800 dark:text-white font-medium">Total Selisih Keseluruhan</span>
              <span className={`font-bold ${reconciliations.reduce((sum, r) => sum + r.difference, 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(reconciliations.reduce((sum, r) => sum + r.difference, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
