'use client'

import { useState } from 'react'
import { FaUserInjured, FaSearch, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa'

type Patient = {
  id: number
  name: string
  medicalRecordNumber: string
  age: number
  gender: string
  lastVisit: string
  diagnosis: string
  status: string
}

const initialData: Patient[] = [
  { 
    id: 1, 
    name: 'Budi Santoso', 
    medicalRecordNumber: 'MR-2025-001', 
    age: 45, 
    gender: 'Laki-laki', 
    lastVisit: '2025-11-05', 
    diagnosis: 'Hipertensi', 
    status: 'Aktif' 
  },
  { 
    id: 2, 
    name: 'Dewi Lestari', 
    medicalRecordNumber: 'MR-2025-002', 
    age: 32, 
    gender: 'Perempuan', 
    lastVisit: '2025-11-04', 
    diagnosis: 'Diabetes Mellitus', 
    status: 'Aktif' 
  },
  { 
    id: 3, 
    name: 'Andi Prasetyo', 
    medicalRecordNumber: 'MR-2025-003', 
    age: 28, 
    gender: 'Laki-laki', 
    lastVisit: '2025-11-03', 
    diagnosis: 'Migren', 
    status: 'Selesai' 
  },
  { 
    id: 4, 
    name: 'Siti Rahayu', 
    medicalRecordNumber: 'MR-2025-004', 
    age: 56, 
    gender: 'Perempuan', 
    lastVisit: '2025-11-02', 
    diagnosis: 'Artritis', 
    status: 'Aktif' 
  },
  { 
    id: 5, 
    name: 'Joko Susilo', 
    medicalRecordNumber: 'MR-2025-005', 
    age: 38, 
    gender: 'Laki-laki', 
    lastVisit: '2025-11-01', 
    diagnosis: 'Asma', 
    status: 'Selesai' 
  },
]

export default function PatientPage() {
  const [patients] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-8 tracking-wide flex items-center gap-3">
        <FaUserInjured className="text-blue-500" />
        Manajemen Pasien
      </h1>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
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
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition flex items-center gap-2">
            <FaPlus />
            Tambah Pasien
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3">Nama Pasien</th>
                <th>No. Rekam Medis</th>
                <th>Umur</th>
                <th>Jenis Kelamin</th>
                <th>Kunjungan Terakhir</th>
                <th>Diagnosis</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition"
                >
                  <td className="py-3 font-medium">{patient.name}</td>
                  <td>{patient.medicalRecordNumber}</td>
                  <td>{patient.age} tahun</td>
                  <td>{patient.gender}</td>
                  <td>{patient.lastVisit}</td>
                  <td>{patient.diagnosis}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      patient.status === 'Aktif' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <button className="px-3 py-1 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition flex items-center gap-1">
                      <FaEye /> Lihat
                    </button>
                    <button className="px-3 py-1 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition flex items-center gap-1">
                      <FaEdit /> Edit
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition flex items-center gap-1">
                      <FaTrash /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FaUserInjured className="mx-auto text-4xl mb-2" />
            <p>Tidak ada pasien yang ditemukan</p>
          </div>
        )}
      </div>

      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Statistik Pasien</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Pasien</p>
            <p className="text-2xl font-bold">{patients.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Pasien Aktif</p>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.status === 'Aktif').length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Kunjungan Hari Ini</p>
            <p className="text-2xl font-bold">
              {patients.filter(p => p.lastVisit === '2025-11-05').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}