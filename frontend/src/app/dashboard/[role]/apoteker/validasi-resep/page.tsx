'use client'

import { useState } from 'react'
import { FaClipboardCheck, FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

type PrescriptionValidation = {
  id: number
  patientName: string
  medicalRecordNumber: string
  orderDate: string
  doctor: string
  medications: string
  status: 'pending' | 'approved' | 'rejected'
}

const initialData: PrescriptionValidation[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    orderDate: '2025-11-05',
    doctor: 'dr. Andi Prasetyo',
    medications: 'Paracetamol, Amoxicillin',
    status: 'pending'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    orderDate: '2025-11-04',
    doctor: 'dr. Andi Prasetyo',
    medications: 'Metformin, Gliclazide',
    status: 'approved'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    orderDate: '2025-11-03',
    doctor: 'dr. Andi Prasetyo',
    medications: 'Sumatriptan, Propranolol',
    status: 'rejected'
  }
]

export default function ValidasiResepPage() {
  const [validations] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredValidations = validations.filter(validation =>
    validation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validation.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validation.medications.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu'
      case 'approved': return 'Disetujui'
      case 'rejected': return 'Ditolak'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaClipboardCheck className="text-blue-500" />
          <span>Validasi Resep</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Validasi dan approve resep obat dari dokter
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
              placeholder="Cari validasi resep..."
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
              {filteredValidations.map((validation) => (
                <tr
                  key={validation.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{validation.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{validation.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{validation.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{validation.orderDate}</td>
                  <td className="px-2">
                    <div className="max-w-xs truncate">{validation.medications}</div>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(validation.status)}`}>
                      {getStatusText(validation.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition">
                        <FaCheckCircle />
                      </button>
                      <button className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition">
                        <FaTimesCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredValidations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaClipboardCheck className="mx-auto text-4xl mb-2" />
            <p>Tidak ada validasi resep yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Statistik Validasi Resep
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu Validasi</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {validations.filter(v => v.status === 'pending').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Disetujui</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {validations.filter(v => v.status === 'approved').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Ditolak</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                {validations.filter(v => v.status === 'rejected').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Validasi</p>
              <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">{validations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Akurasi Validasi
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-800 dark:text-white">Akurasi Minggu Ini</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-800 dark:text-white">Akurasi Bulan Ini</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">91%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-800 dark:text-white">Akurasi Tahun Ini</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">93%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '93%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
