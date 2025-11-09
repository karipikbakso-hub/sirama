'use client'

import { useState } from 'react'
import { FaSearch, FaHistory, FaUsers, FaCalendarAlt, FaHospital, FaDownload, FaFilter } from 'react-icons/fa'

// Mock data for patient history
const mockPatientHistory = [
  {
    id: 1,
    patientName: 'Ahmad Surya',
    patientId: 'P001',
    visitDate: '2025-01-15',
    diagnosis: 'Demam Berdarah',
    doctor: 'Dr. Siti Aminah',
    department: 'Penyakit Dalam',
    status: 'Selesai'
  },
  {
    id: 2,
    patientName: 'Sari Dewi',
    patientId: 'P002',
    visitDate: '2025-01-14',
    diagnosis: 'Hipertensi',
    doctor: 'Dr. Budi Santoso',
    department: 'Jantung',
    status: 'Selesai'
  },
  {
    id: 3,
    patientName: 'Rudi Hartono',
    patientId: 'P003',
    visitDate: '2025-01-13',
    diagnosis: 'Diabetes Mellitus',
    doctor: 'Dr. Maya Sari',
    department: 'Endokrinologi',
    status: 'Selesai'
  }
]

export default function RiwayatPasienPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredHistory, setFilteredHistory] = useState(mockPatientHistory)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = mockPatientHistory.filter(item =>
      item.patientName.toLowerCase().includes(term.toLowerCase()) ||
      item.patientId.toLowerCase().includes(term.toLowerCase()) ||
      item.diagnosis.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredHistory(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Selesai</span>
      case 'Dalam Proses':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Dalam Proses</span>
      case 'Dibatalkan':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Dibatalkan</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaHistory className="text-blue-500" />
        <span className="truncate">Riwayat Pasien</span>
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Kunjungan</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+12% dari bulan lalu</p>
            </div>
            <FaUsers className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kunjungan Hari Ini</p>
              <p className="text-2xl font-bold">89</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+5% dari kemarin</p>
            </div>
            <FaCalendarAlt className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Kunjungan</p>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">per hari dalam 30 hari</p>
            </div>
            <FaHospital className="text-2xl text-purple-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasien Aktif</p>
              <p className="text-2xl font-bold">567</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">dengan riwayat kunjungan</p>
            </div>
            <FaUsers className="text-2xl text-orange-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Cari Riwayat Pasien</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Cari berdasarkan nama pasien, nomor ID, atau diagnosis</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pasien berdasarkan nama atau MRN..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
            <FaFilter />
            Filter Tanggal
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
            <FaDownload />
            Export Data
          </button>
        </div>
      </div>

      {/* Patient History Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Riwayat Kunjungan Pasien</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Daftar lengkap riwayat kunjungan pasien ke rumah sakit</p>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">ID Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tanggal Kunjungan</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Diagnosis</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Dokter</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Poli</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {filteredHistory.map((history) => (
                <tr key={history.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3 font-mono text-sm">{history.patientId}</td>
                  <td className="px-4 py-3 font-medium">{history.patientName}</td>
                  <td className="px-4 py-3">{new Date(history.visitDate).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">{history.diagnosis}</td>
                  <td className="px-4 py-3">{history.doctor}</td>
                  <td className="px-4 py-3">{history.department}</td>
                  <td className="px-4 py-3">{getStatusBadge(history.status)}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm">
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
