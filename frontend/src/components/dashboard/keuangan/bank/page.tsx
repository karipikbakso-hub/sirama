'use client'

import { useState } from 'react'
import { FaUniversity, FaSearch, FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'

type BankAccount = {
  id: number
  bankName: string
  accountNumber: string
  accountName: string
  balance: number
  currency: string
  status: 'active' | 'inactive'
}

const initialData: BankAccount[] = [
  {
    id: 1,
    bankName: 'Bank Mandiri',
    accountNumber: '123-456-7890',
    accountName: 'RS Sehat Selalu',
    balance: 50000000,
    currency: 'IDR',
    status: 'active'
  },
  {
    id: 2,
    bankName: 'BCA',
    accountNumber: '987-654-3210',
    accountName: 'RS Sehat Selalu - Payroll',
    balance: 25000000,
    currency: 'IDR',
    status: 'active'
  },
  {
    id: 3,
    bankName: 'BNI',
    accountNumber: '555-123-4567',
    accountName: 'RS Sehat Selalu - Operasional',
    balance: 15000000,
    currency: 'IDR',
    status: 'inactive'
  }
]

export default function BankPage() {
  const [accounts] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAccounts = accounts.filter(account =>
    account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountNumber.includes(searchTerm) ||
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaUniversity className="text-blue-500" />
        <span className="truncate">Rekening Bank</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari rekening bank..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaPlus />
            <span className="hidden sm:inline">Tambah Rekening</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Bank</th>
                <th className="px-2">No. Rekening</th>
                <th className="px-2 hidden md:table-cell">Nama Rekening</th>
                <th className="px-2">Saldo</th>
                <th className="px-2 hidden sm:table-cell">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{account.bankName}</td>
                  <td className="px-2 font-medium">{account.accountNumber}</td>
                  <td className="px-2 hidden md:table-cell">{account.accountName}</td>
                  <td className="px-2 font-medium">{formatCurrency(account.balance, account.currency)}</td>
                  <td className="px-2 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(account.status)}`}>
                      {getStatusText(account.status)}
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

        {filteredAccounts.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaUniversity className="mx-auto text-4xl mb-2" />
            <p>Tidak ada rekening bank yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Rekening</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Rekening</p>
              <p className="text-lg md:text-2xl font-bold">{accounts.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rekening Aktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {accounts.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Saldo</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(accounts.reduce((sum, a) => sum + a.balance, 0), 'IDR')}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rekening Nonaktif</p>
              <p className="text-lg md:text-2xl font-bold">
                {accounts.filter(a => a.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Saldo</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Bank Mandiri</span>
              <span className="font-bold">{formatCurrency(50000000, 'IDR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>BCA</span>
              <span className="font-bold">{formatCurrency(25000000, 'IDR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>BNI</span>
              <span className="font-bold">{formatCurrency(15000000, 'IDR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total</span>
              <span className="font-bold">{formatCurrency(90000000, 'IDR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}