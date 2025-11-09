'use client'

import { useState } from 'react'
import { FaFileImage, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type RadiologyResult = {
  id: number
  patientName: string
  patientId: string
  testDate: string
  testName: string
  result: string
  status: 'normal' | 'abnormal' | 'critical'
  validated: boolean
}

const initialData: RadiologyResult[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    patientId: 'PAT-2025-001',
    testDate: '2025-11-06',
    testName: 'Rontgen Thorax',
    result: 'Paru-paru normal, tidak ditemukan infiltrat',
    status: 'normal',
    validated: true
  },
  {
    id: 2,
    patientName: 'Siti Rahayu',
    patientId: 'PAT-2025-002',
    testDate: '2025-11-06',
    testName: 'USG Abdomen',
    result: 'Hati membesar, ditemukan lesi di segmen V',
    status: 'abnormal',
    validated: false
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    patientId: 'PAT-2025-003',
    testDate: '2025-11-05',
    testName: 'CT Scan Kepala',
    result: 'Ditemukan perdarahan subaraknoid',
    status: 'critical',
    validated: true
  },
  {
    id: 4,
    patientName: 'Rina Kusuma',
    patientId: 'PAT-2025-004',
    testDate: '2025-11-04',
    testName: 'MRI Lumbal Spine',
    result: 'Normal, tidak ditemukan kompresi saraf',
    status: 'normal',
    validated: true
  }
]

export default function HasilRadiologiPage() {
  const [radiologyResults] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResults = radiologyResults.filter(result =>
    result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.testName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'abnormal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal'
      case 'abnormal': return 'Abnormal'
      case 'critical': return 'Kritis'
      default: return status
    }
  }

  const getValidationStatus = (validated: boolean) => {
    return validated ? 
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getValidationText = (validated: boolean) => {
    return validated ? 'Tervalidasi' : 'Belum Validasi'
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaFileImage className="text-blue-500" />
        <span className="truncate">Hasil Radiologi</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari hasil radiologi..."
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
                <th className="px-2 hidden md:table-cell">ID Pasien</th>
                <th className="px-2">Tanggal Tes</th>
                <th className="px-2">Nama Tes</th>
                <th className="px-2 hidden sm:table-cell">Hasil</th>
                <th className="px-2">Status</th>
                <th className="px-2">Validasi</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{result.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{result.patientId}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{result.patientId}</td>
                  <td className="px-2">{result.testDate}</td>
                  <td className="px-2">
                    <div className="max-w-xs truncate">{result.testName}</div>
                  </td>
                  <td className="px-2 hidden sm:table-cell">
                    <div className="max-w-xs truncate">{result.result}</div>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(result.status)}`}>
                      {getStatusText(result.status)}
                    </span>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getValidationStatus(result.validated)}`}>
                      {getValidationText(result.validated)}
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

        {filteredResults.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaFileImage className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data hasil radiologi yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Hasil Radiologi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Normal</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyResults.filter(r => r.status === 'normal').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Abnormal</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyResults.filter(r => r.status === 'abnormal').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Kritis</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyResults.filter(r => r.status === 'critical').length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Tervalidasi</p>
              <p className="text-lg md:text-2xl font-bold">
                {radiologyResults.filter(r => r.validated).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Hasil Radiologi</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Hasil Hari Ini</span>
              <span className="font-bold">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rata-rata Hasil per Hari</span>
              <span className="font-bold">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tes dengan Hasil Abnormal Terbanyak</span>
              <span className="font-bold">USG Abdomen</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hasil Kritis</span>
              <span className="font-bold">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}