'use client'

import { useState } from 'react'
import { FaFileMedical, FaSearch, FaEye, FaPrint } from 'react-icons/fa'

type EMR = {
  id: number
  patientName: string
  medicalRecordNumber: string
  visitDate: string
  diagnosis: string
  treatment: string
  status: 'completed' | 'in-progress' | 'pending'
}

const initialData: EMR[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    visitDate: '2025-11-05',
    diagnosis: 'Gastritis akut',
    treatment: 'Antasida 3x sehari selama 7 hari',
    status: 'completed'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    visitDate: '2025-11-05',
    diagnosis: 'Pasca operasi appendektomi',
    treatment: 'Kontrol luka, antibiotik',
    status: 'in-progress'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    visitDate: '2025-11-04',
    diagnosis: 'Hipertensi',
    treatment: 'Lisinopril 10mg 1x sehari',
    status: 'completed'
  }
]

export default function EMRPage() {
  const [emrs] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEMRs = emrs.filter(emr =>
    emr.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emr.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emr.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'in-progress': return 'Dalam Proses'
      case 'pending': return 'Menunggu'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaFileMedical className="text-blue-500" />
        <span className="truncate">Electronic Medical Record (EMR)</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari rekam medis..."
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
                <th className="px-2 hidden md:table-cell">No. RM</th>
                <th className="px-2">Tanggal Kunjungan</th>
                <th className="px-2 hidden sm:table-cell">Diagnosis</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEMRs.map((emr) => (
                <tr
                  key={emr.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{emr.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{emr.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{emr.medicalRecordNumber}</td>
                  <td className="px-2">{emr.visitDate}</td>
                  <td className="px-2 hidden sm:table-cell max-w-xs truncate">{emr.diagnosis}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(emr.status)}`}>
                      {getStatusText(emr.status)}
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

        {filteredEMRs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaFileMedical className="mx-auto text-4xl mb-2" />
            <p>Tidak ada rekam medis yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik EMR</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Rekam Medis</p>
              <p className="text-lg md:text-2xl font-bold">{emrs.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {emrs.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dalam Proses</p>
              <p className="text-lg md:text-2xl font-bold">
                {emrs.filter(e => e.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold">
                {emrs.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Diagnosis</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Gastritis</span>
              <span className="font-bold">5 kasus</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hipertensi</span>
              <span className="font-bold">3 kasus</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Diabetes</span>
              <span className="font-bold">2 kasus</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Lainnya</span>
              <span className="font-bold">8 kasus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}