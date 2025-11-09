'use client'

import { useState } from 'react'
import { FaUsers, FaSearch, FaEye, FaEdit } from 'react-icons/fa'

type Grouping = {
  id: number
  patientName: string
  medicalRecordNumber: string
  groupingDate: string
  caseType: string
  tariff: number
  groupedBy: string
  status: 'grouped' | 'pending' | 'review'
}

const initialData: Grouping[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    groupingDate: '2025-11-05',
    caseType: 'INA-CBG K13',
    tariff: 1500000,
    groupedBy: 'Ani Kurniawati',
    status: 'grouped'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    groupingDate: '2025-11-05',
    caseType: 'INA-CBG K17',
    tariff: 2250000,
    groupedBy: 'Budi Setiawan',
    status: 'review'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    groupingDate: '2025-11-04',
    caseType: 'INA-CBG K21',
    tariff: 3100000,
    groupedBy: 'Citra Dewi',
    status: 'pending'
  },
  {
    id: 4,
    patientName: 'Siti Rahayu',
    medicalRecordNumber: 'MR-2025-004',
    groupingDate: '2025-11-03',
    caseType: 'INA-CBG K09',
    tariff: 1250000,
    groupedBy: 'Ani Kurniawati',
    status: 'grouped'
  }
]

export default function GroupingINACBGPage() {
  const [groupings] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGroupings = groupings.filter(grouping =>
    grouping.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grouping.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grouping.caseType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'grouped': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'grouped': return 'Dikelompokkan'
      case 'pending': return 'Menunggu'
      case 'review': return 'Perlu Tinjauan'
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
        <FaUsers className="text-blue-500" />
        <span className="truncate">Grouping INA-CBG</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari grouping..."
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
                <th className="px-2 hidden sm:table-cell">Tanggal Grouping</th>
                <th className="px-2">Jenis Kasus</th>
                <th className="px-2">Tarif</th>
                <th className="px-2 hidden md:table-cell">Dikelompokkan Oleh</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroupings.map((grouping) => (
                <tr
                  key={grouping.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{grouping.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{grouping.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{grouping.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{grouping.groupingDate}</td>
                  <td className="px-2">{grouping.caseType}</td>
                  <td className="px-2 font-medium">{formatCurrency(grouping.tariff)}</td>
                  <td className="px-2 hidden md:table-cell">{grouping.groupedBy}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(grouping.status)}`}>
                      {getStatusText(grouping.status)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGroupings.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaUsers className="mx-auto text-4xl mb-2" />
            <p>Tidak ada grouping yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Grouping</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dikelompokkan</p>
              <p className="text-lg md:text-2xl font-bold">
                {groupings.filter(g => g.status === 'grouped').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold">
                {groupings.filter(g => g.status === 'pending').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Perlu Tinjauan</p>
              <p className="text-lg md:text-2xl font-bold">
                {groupings.filter(g => g.status === 'review').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Grouping</p>
              <p className="text-lg md:text-2xl font-bold">{groupings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Tarif</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hari Ini</span>
              <span className="font-bold">{formatCurrency(8100000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Minggu Ini</span>
              <span className="font-bold">{formatCurrency(58250000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Bulan Ini</span>
              <span className="font-bold">{formatCurrency(235750000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Tarif</span>
              <span className="font-bold">{formatCurrency(2025000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}