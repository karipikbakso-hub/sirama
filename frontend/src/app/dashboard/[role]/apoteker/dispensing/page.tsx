'use client'

import { useState } from 'react'
import { FaCapsules, FaSearch, FaCheckCircle, FaPrint } from 'react-icons/fa'

type Dispensing = {
  id: number
  patientName: string
  medicalRecordNumber: string
  dispensingDate: string
  pharmacist: string
  medications: string
  status: 'prepared' | 'dispensed' | 'delivered'
}

const initialData: Dispensing[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    dispensingDate: '2025-11-05',
    pharmacist: 'Apt. Siti Rahayu',
    medications: 'Paracetamol, Amoxicillin',
    status: 'prepared'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    dispensingDate: '2025-11-04',
    pharmacist: 'Apt. Siti Rahayu',
    medications: 'Metformin, Gliclazide',
    status: 'dispensed'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    dispensingDate: '2025-11-03',
    pharmacist: 'Apt. Siti Rahayu',
    medications: 'Sumatriptan, Propranolol',
    status: 'delivered'
  }
]

export default function DispensingPage() {
  const [dispensings] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDispensings = dispensings.filter(dispensing =>
    dispensing.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispensing.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispensing.medications.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prepared': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'dispensed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'prepared': return 'Disiapkan'
      case 'dispensed': return 'Diberikan'
      case 'delivered': return 'Diterima'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaCapsules className="text-blue-500" />
          <span>Dispensing Obat</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola dan distribusikan obat kepada pasien
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
              placeholder="Cari dispensing obat..."
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
                <th className="px-2 hidden sm:table-cell">Tanggal Dispensing</th>
                <th className="px-2">Obat</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDispensings.map((dispensing) => (
                <tr
                  key={dispensing.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{dispensing.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{dispensing.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{dispensing.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{dispensing.dispensingDate}</td>
                  <td className="px-2">
                    <div className="max-w-xs truncate">{dispensing.medications}</div>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(dispensing.status)}`}>
                      {getStatusText(dispensing.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                        <FaPrint />
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

        {filteredDispensings.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaCapsules className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data dispensing obat yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik Dispensing
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Disiapkan</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {dispensings.filter(d => d.status === 'prepared').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diberikan</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {dispensings.filter(d => d.status === 'dispensed').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Diterima</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {dispensings.filter(d => d.status === 'delivered').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Dispensing</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{dispensings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Obat Paling Sering Didispensing
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Paracetamol 500mg</span>
              <span className="font-bold text-gray-800 dark:text-white">25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Amoxicillin 250mg</span>
              <span className="font-bold text-gray-800 dark:text-white">20</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Metformin 500mg</span>
              <span className="font-bold text-gray-800 dark:text-white">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Losartan 50mg</span>
              <span className="font-bold text-gray-800 dark:text-white">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-white">Simvastatin 20mg</span>
              <span className="font-bold text-gray-800 dark:text-white">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
