'use client'

import { useState } from 'react'
import { FaNotesMedical, FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'

type CPPT = {
  id: number
  patientName: string
  medicalRecordNumber: string
  date: string
  subject: string
  objective: string
  assessment: string
  plan: string
  nurseName: string
}

const initialData: CPPT[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    date: '2025-11-05',
    subject: 'Pasien datang dengan keluhan nyeri perut',
    objective: 'TD 120/80, Nadi 72, Suhu 36.5°C',
    assessment: 'Diduga gastritis',
    plan: 'Berikan obat antasida dan pantau kondisi',
    nurseName: 'Siti Rahayu'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    date: '2025-11-05',
    subject: 'Pasien kontrol pasca operasi',
    objective: 'TD 110/70, Nadi 68, Suhu 36.7°C',
    assessment: 'Pemulihan berjalan baik',
    plan: 'Lanjutkan perawatan dan edukasi',
    nurseName: 'Ani Wulandari'
  }
]

export default function CPPTPage() {
  const [cppts] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCPPTs = cppts.filter(cppt =>
    cppt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cppt.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaNotesMedical className="text-blue-500" />
        <span className="truncate">Catatan Perkembangan Pasien Terintegrasi (CPPT)</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari catatan..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaPlus />
            <span className="hidden sm:inline">Tambah CPPT</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">No. RM</th>
                <th className="px-2">Tanggal</th>
                <th className="px-2 hidden sm:table-cell">Subjektif</th>
                <th className="px-2">Perawat</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCPPTs.map((cppt) => (
                <tr
                  key={cppt.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{cppt.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{cppt.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{cppt.medicalRecordNumber}</td>
                  <td className="px-2">{cppt.date}</td>
                  <td className="px-2 hidden sm:table-cell max-w-xs truncate">{cppt.subject}</td>
                  <td className="px-2">{cppt.nurseName}</td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
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

        {filteredCPPTs.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaNotesMedical className="mx-auto text-4xl mb-2" />
            <p>Tidak ada catatan CPPT yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik CPPT</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Catatan</p>
              <p className="text-lg md:text-2xl font-bold">{cppts.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Perawat Aktif</p>
              <p className="text-lg md:text-2xl font-bold">5 orang</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Hari Ini</p>
              <p className="text-lg md:text-2xl font-bold">8 catatan</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata/Hari</p>
              <p className="text-lg md:text-2xl font-bold">12 catatan</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Perawat</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Siti Rahayu</span>
              <span className="font-bold">15 catatan</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Ani Wulandari</span>
              <span className="font-bold">12 catatan</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Budi Santoso</span>
              <span className="font-bold">10 catatan</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Dewi Lestari</span>
              <span className="font-bold">8 catatan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}