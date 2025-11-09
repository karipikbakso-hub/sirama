'use client'

import { useState } from 'react'
import { FaFileMedical, FaSearch, FaEye, FaPrint, FaUpload } from 'react-icons/fa'

type LabResult = {
  id: number
  patientName: string
  medicalRecordNumber: string
  testDate: string
  doctor: string
  testName: string
  status: 'draft' | 'completed' | 'validated' | 'published'
}

const initialData: LabResult[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    testDate: '2025-11-05',
    doctor: 'dr. Andi Prasetyo',
    testName: 'Hemogram, Kreatinin, Glukosa Puasa',
    status: 'completed'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    testDate: '2025-11-04',
    doctor: 'dr. Andi Prasetyo',
    testName: 'Profil Lipid, SGOT, SGPT',
    status: 'validated'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    testDate: '2025-11-03',
    doctor: 'dr. Andi Prasetyo',
    testName: 'Elektrolit, Ureum',
    status: 'published'
  }
]

export default function HasilLabPage() {
  const [results] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResults = results.filter(result =>
    result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.testName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'validated': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'completed': return 'Selesai'
      case 'validated': return 'Tervalidasi'
      case 'published': return 'Dipublikasi'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaFileMedical className="text-blue-500" />
        <span className="truncate">Hasil Laboratorium</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari hasil lab..."
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
                <th className="px-2 hidden sm:table-cell">Tanggal Tes</th>
                <th className="px-2">Nama Tes</th>
                <th className="px-2">Status</th>
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
                      <span className="text-xs text-gray-500 md:hidden">{result.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{result.medicalRecordNumber}</td>
                  <td className="px-2 hidden sm:table-cell">{result.testDate}</td>
                  <td className="px-2">
                    <div className="max-w-xs truncate">{result.testName}</div>
                  </td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(result.status)}`}>
                      {getStatusText(result.status)}
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
                      <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition">
                        <FaUpload />
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
            <FaFileMedical className="mx-auto text-4xl mb-2" />
            <p>Tidak ada hasil laboratorium yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Hasil Lab</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Hasil</p>
              <p className="text-lg md:text-2xl font-bold">{results.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Tervalidasi</p>
              <p className="text-lg md:text-2xl font-bold">
                {results.filter(r => r.status === 'validated').length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dipublikasi</p>
              <p className="text-lg md:text-2xl font-bold">
                {results.filter(r => r.status === 'published').length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Draft</p>
              <p className="text-lg md:text-2xl font-bold">
                {results.filter(r => r.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Parameter Tes Populer</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Hemoglobin</span>
              <span className="font-bold">42</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Leukosit</span>
              <span className="font-bold">38</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Kreatinin</span>
              <span className="font-bold">35</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Kolesterol</span>
              <span className="font-bold">30</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Glukosa Puasa</span>
              <span className="font-bold">28</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}