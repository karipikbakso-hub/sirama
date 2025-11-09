'use client'

import { useState } from 'react'
import { FaReceipt, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa'

type Journal = {
  id: number
  date: string
  description: string
  debitAccount: string
  creditAccount: string
  amount: number
  reference: string
}

const initialData: Journal[] = [
  {
    id: 1,
    date: '2025-11-01',
    description: 'Pembayaran jasa medis dr. Budi',
    debitAccount: 'Beban Jasa Medis',
    creditAccount: 'Kas',
    amount: 5000000,
    reference: 'REF-2025-001'
  },
  {
    id: 2,
    date: '2025-11-02',
    description: 'Pembelian obat dari supplier',
    debitAccount: 'Persediaan Obat',
    creditAccount: 'Utang Dagang',
    amount: 15000000,
    reference: 'REF-2025-002'
  },
  {
    id: 3,
    date: '2025-11-03',
    description: 'Penerimaan pembayaran pasien',
    debitAccount: 'Kas',
    creditAccount: 'Piutang Pasien',
    amount: 7500000,
    reference: 'REF-2025-003'
  },
  {
    id: 4,
    date: '2025-11-04',
    description: 'Pembayaran gaji karyawan',
    debitAccount: 'Beban Gaji',
    creditAccount: 'Kas',
    amount: 25000000,
    reference: 'REF-2025-004'
  }
]

export default function JurnalPage() {
  const [journals] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredJournals = journals.filter(journal =>
    journal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.debitAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.creditAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <span className="truncate">Jurnal Keuangan</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari jurnal..."
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
                <th className="px-2">Deskripsi</th>
                <th className="px-2 hidden md:table-cell">Akun Debit</th>
                <th className="px-2 hidden md:table-cell">Akun Kredit</th>
                <th className="px-2">Jumlah</th>
                <th className="px-2 hidden sm:table-cell">Referensi</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournals.map((journal) => (
                <tr
                  key={journal.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{journal.date}</td>
                  <td className="px-2">
                    <div className="max-w-[150px] truncate md:max-w-xs">{journal.description}</div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{journal.debitAccount}</td>
                  <td className="px-2 hidden md:table-cell">{journal.creditAccount}</td>
                  <td className="px-2 font-medium">{formatCurrency(journal.amount)}</td>
                  <td className="px-2 hidden sm:table-cell">{journal.reference}</td>
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

        {filteredJournals.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaReceipt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada jurnal yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Jurnal</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Transaksi</p>
              <p className="text-lg md:text-2xl font-bold">{journals.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Debit</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(journals.reduce((sum, j) => sum + j.amount, 0))}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Kredit</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(journals.reduce((sum, j) => sum + j.amount, 0))}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata Transaksi</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(journals.reduce((sum, j) => sum + j.amount, 0) / journals.length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Jurnal</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hari Ini</span>
              <span className="font-bold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Minggu Ini</span>
              <span className="font-bold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Bulan Ini</span>
              <span className="font-bold">98</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Akun Terbanyak</span>
              <span className="font-bold">Kas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}