'use client'

import { useState } from 'react'
import { FaPiggyBank, FaSearch, FaPlus, FaEye } from 'react-icons/fa'

type Deposit = {
  id: number
  patientName: string
  medicalRecordNumber: string
  depositDate: string
  amount: number
  usedAmount: number
  remainingAmount: number
  status: 'active' | 'used' | 'expired'
}

const initialData: Deposit[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    depositDate: '2025-11-05',
    amount: 500000,
    usedAmount: 150000,
    remainingAmount: 350000,
    status: 'active'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    depositDate: '2025-11-04',
    amount: 1000000,
    usedAmount: 1000000,
    remainingAmount: 0,
    status: 'used'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    depositDate: '2025-10-03',
    amount: 750000,
    usedAmount: 250000,
    remainingAmount: 500000,
    status: 'active'
  },
  {
    id: 4,
    patientName: 'Siti Rahayu',
    medicalRecordNumber: 'MR-2025-004',
    depositDate: '2025-08-02',
    amount: 300000,
    usedAmount: 0,
    remainingAmount: 300000,
    status: 'expired'
  }
]

export default function DepositPage() {
  const [deposits] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDeposits = deposits.filter(deposit =>
    deposit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deposit.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'used': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'used': return 'Terpakai'
      case 'expired': return 'Kadaluarsa'
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
          <FaPiggyBank className="text-blue-500" />
          <span>Deposit Pasien</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola deposit dan tabungan pasien
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
              placeholder="Cari deposit..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaPlus />
            <span className="hidden sm:inline">Tambah Deposit</span>
            <span className="sm:hidden">Deposit</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">No. Rekam Medis</th>
                <th className="px-2 hidden sm:table-cell">Tanggal Deposit</th>
                <th className="px-2">Jumlah Deposit</th>
                <th className="px-2 hidden md:table-cell">Terpakai</th>
                <th className="px-2">Sisa</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((deposit) => (
                <tr
                  key={deposit.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{deposit.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{deposit.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{deposit.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{deposit.depositDate}</td>
                  <td className="px-2 font-medium">{formatCurrency(deposit.amount)}</td>
                  <td className="px-2 hidden md:table-cell">{formatCurrency(deposit.usedAmount)}</td>
                  <td className="px-2 font-medium">{formatCurrency(deposit.remainingAmount)}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deposit.status)}`}>
                      {getStatusText(deposit.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDeposits.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaPiggyBank className="mx-auto text-4xl mb-2" />
            <p>Tidak ada deposit yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik Deposit
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Aktif</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {deposits.filter(d => d.status === 'active').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Terpakai</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {deposits.filter(d => d.status === 'used').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Kadaluarsa</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {deposits.filter(d => d.status === 'expired').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Deposit</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{deposits.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Rekap Deposit
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Deposit Aktif</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(850000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Deposit Terpakai</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(1400000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Total Deposit</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(2550000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Rata-rata Deposit</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatCurrency(637500)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
