'use client'

import { useState } from 'react'
import { FaListAlt, FaSearch, FaCheck, FaUserClock } from 'react-icons/fa'

type Queue = {
  id: number
  queueNumber: string
  patientName: string
  medicalRecordNumber: string
  polyclinic: string
  registrationTime: string
  status: 'waiting' | 'in-progress' | 'completed'
}

const initialData: Queue[] = [
  {
    id: 1,
    queueNumber: 'A-001',
    patientName: 'Budi Santoso',
    medicalRecordNumber: 'MR-2025-001',
    polyclinic: 'Poli Interna',
    registrationTime: '08:00',
    status: 'completed'
  },
  {
    id: 2,
    queueNumber: 'A-002',
    patientName: 'Dewi Lestari',
    medicalRecordNumber: 'MR-2025-002',
    polyclinic: 'Poli Anak',
    registrationTime: '08:15',
    status: 'in-progress'
  },
  {
    id: 3,
    queueNumber: 'A-003',
    patientName: 'Andi Prasetyo',
    medicalRecordNumber: 'MR-2025-003',
    polyclinic: 'Poli Bedah',
    registrationTime: '08:30',
    status: 'waiting'
  },
  {
    id: 4,
    queueNumber: 'A-004',
    patientName: 'Siti Rahayu',
    medicalRecordNumber: 'MR-2025-004',
    polyclinic: 'Poli Interna',
    registrationTime: '08:45',
    status: 'waiting'
  }
]

export default function AntrianPoliPage() {
  const [queues] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredQueues = queues.filter(queue =>
    queue.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.queueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    queue.polyclinic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'waiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'in-progress': return 'Dalam Pemeriksaan'
      case 'waiting': return 'Menunggu'
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaListAlt className="text-blue-500" />
        <span className="truncate">Antrian Poliklinik</span>
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari antrian..."
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
                <th className="py-3 px-2">No. Antrian</th>
                <th className="px-2">Nama Pasien</th>
                <th className="px-2 hidden md:table-cell">No. RM</th>
                <th className="px-2">Poli</th>
                <th className="px-2 hidden sm:table-cell">Waktu Daftar</th>
                <th className="px-2">Status</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueues.map((queue) => (
                <tr
                  key={queue.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 px-2 font-medium">{queue.queueNumber}</td>
                  <td className="px-2">
                    <div className="flex flex-col">
                      <span>{queue.patientName}</span>
                      <span className="text-xs text-gray-500 md:hidden">{queue.medicalRecordNumber}</span>
                    </div>
                  </td>
                  <td className="px-2 hidden md:table-cell">{queue.medicalRecordNumber}</td>
                  <td className="px-2">{queue.polyclinic}</td>
                  <td className="px-2 hidden sm:table-cell">{queue.registrationTime}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(queue.status)}`}>
                      {getStatusText(queue.status)}
                    </span>
                  </td>
                  <td className="text-right px-2">
                    <div className="flex justify-end gap-1">
                      {queue.status === 'waiting' && (
                        <button className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition">
                          <FaUserClock />
                        </button>
                      )}
                      {queue.status === 'in-progress' && (
                        <button className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition">
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQueues.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaListAlt className="mx-auto text-4xl mb-2" />
            <p>Tidak ada antrian yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Statistik Antrian</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Antrian</p>
              <p className="text-lg md:text-2xl font-bold">{queues.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Selesai</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'completed').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Dalam Pemeriksaan</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Menunggu</p>
              <p className="text-lg md:text-2xl font-bold">
                {queues.filter(q => q.status === 'waiting').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Rekap Poliklinik</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Poli Interna</span>
              <span className="font-bold">15 pasien</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Poli Anak</span>
              <span className="font-bold">12 pasien</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Poli Bedah</span>
              <span className="font-bold">10 pasien</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Poli Gigi</span>
              <span className="font-bold">8 pasien</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}