'use client'

import { useState } from 'react'
import { FaHeartbeat, FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'

type VitalSign = {
  id: number
  patientName: string
  medicalRecordNumber: string
  bloodPressure: string
  heartRate: number
  respiratoryRate: number
  temperature: number
  weight: number
  height: number
  date: string
}

const initialData: VitalSign[] = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    bloodPressure: '120/80',
    heartRate: 72,
    respiratoryRate: 16,
    temperature: 36.5,
    weight: 65,
    height: 170,
    date: '2025-11-05'
  },
  {
    id: 2,
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    bloodPressure: '110/70',
    heartRate: 68,
    respiratoryRate: 14,
    temperature: 36.7,
    weight: 55,
    height: 160,
    date: '2025-11-05'
  },
  {
    id: 3,
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    bloodPressure: '130/85',
    heartRate: 75,
    respiratoryRate: 18,
    temperature: 37.0,
    weight: 75,
    height: 175,
    date: '2025-11-05'
  }
]

export default function TTVPage() {
  const [vitalSigns] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVitalSigns = vitalSigns.filter(vital =>
    vital.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vital.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaHeartbeat className="text-blue-500" />
        <span className="truncate">Tanda-Tanda Vital (TTV)</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pasien..."
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center justify-center gap-2">
            <FaPlus />
            <span className="hidden sm:inline">Tambah TTV</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">No. RM</th>
                <th className="px-2">TD</th>
                <th className="px-2 hidden sm:table-cell">Nadi</th>
                <th className="px-2">Suhu</th>
                <th className="px-2 hidden md:table-cell">BB/TB</th>
                <th className="px-2">Tanggal</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredVitalSigns.map((vital) => (
                <tr
                  key={vital.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">
                    <div className="flex flex-col">
                      <span>{vital.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{vital.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{vital.medicalRecordNumber}</td>
                  <td className="px-2 font-medium">{vital.bloodPressure}</td>
                  <td className="px-2 hidden sm:table-cell">{vital.heartRate}/mnt</td>
                  <td className="px-2">{vital.temperature}°C</td>
                  <td className="px-2 hidden md:table-cell">{vital.weight}kg/{vital.height}cm</td>
                  <td className="px-2">{vital.date}</td>
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

        {filteredVitalSigns.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaHeartbeat className="mx-auto text-4xl mb-2" />
            <p>Tidak ada data tanda-tanda vital yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik TTV</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata TD</p>
              <p className="text-lg md:text-2xl font-bold">120/78</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata Nadi</p>
              <p className="text-lg md:text-2xl font-bold">72/mnt</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Rata-rata Suhu</p>
              <p className="text-lg md:text-2xl font-bold">36.7°C</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Pasien</p>
              <p className="text-lg md:text-2xl font-bold">{vitalSigns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Hari Ini</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Pagi (07:00-12:00)</span>
              <span className="font-bold">15 pasien</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Siang (12:00-17:00)</span>
              <span className="font-bold">12 pasien</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sore (17:00-21:00)</span>
              <span className="font-bold">8 pasien</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total</span>
              <span className="font-bold">35 pasien</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}