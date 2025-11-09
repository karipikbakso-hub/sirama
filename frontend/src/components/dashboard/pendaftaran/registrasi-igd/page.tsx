'use client'

import { useState } from 'react'
import { FaAmbulance, FaUserInjured, FaClock, FaMapMarkerAlt, FaPhone, FaNotesMedical } from 'react-icons/fa'

// Mock data for emergency registrations
const mockEmergencyRegistrations = [
  {
    id: 1,
    patientName: 'Budi Santoso',
    patientId: 'P004',
    emergencyType: 'Kecelakaan Motor',
    severity: 'Kritis',
    arrivalTime: '2025-01-15 14:30:00',
    status: 'Dalam Perawatan',
    location: 'Jl. Sudirman No. 123',
    contact: '081234567890',
    notes: 'Kecelakaan tunggal, patah tulang kaki kanan'
  },
  {
    id: 2,
    patientName: 'Siti Aminah',
    patientId: 'P005',
    emergencyType: 'Serangan Jantung',
    severity: 'Darurat',
    arrivalTime: '2025-01-15 13:15:00',
    status: 'Stabil',
    location: 'Jl. Thamrin No. 45',
    contact: '081987654321',
    notes: 'Nyeri dada hebat, sesak nafas'
  },
  {
    id: 3,
    patientName: 'Ahmad Rahman',
    patientId: 'P006',
    emergencyType: 'Pendarahan',
    severity: 'Urgent',
    arrivalTime: '2025-01-15 12:45:00',
    status: 'Dalam Perawatan',
    location: 'Jl. Gatot Subroto No. 67',
    contact: '081345678901',
    notes: 'Pendarahan hidung yang tidak berhenti'
  }
]

export default function RegistrasiIGDPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRegistrations, setFilteredRegistrations] = useState(mockEmergencyRegistrations)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = mockEmergencyRegistrations.filter(item =>
      item.patientName.toLowerCase().includes(term.toLowerCase()) ||
      item.patientId.toLowerCase().includes(term.toLowerCase()) ||
      item.emergencyType.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredRegistrations(filtered)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Kritis':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Kritis</span>
      case 'Darurat':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full text-xs font-medium">Darurat</span>
      case 'Urgent':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Urgent</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{severity}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dalam Perawatan':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">Dalam Perawatan</span>
      case 'Stabil':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Stabil</span>
      case 'Menunggu':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">Menunggu</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaAmbulance className="text-red-500" />
        <span className="truncate">Registrasi IGD</span>
      </h1>

      {/* Emergency Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pasien Hari Ini</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+3 dari kemarin</p>
            </div>
            <FaUserInjured className="text-2xl text-red-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Response</p>
              <p className="text-2xl font-bold">8.5</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">menit dari panggilan</p>
            </div>
            <FaClock className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tingkat Keparahan</p>
              <p className="text-2xl font-bold">65%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">kasus urgent/darurat</p>
            </div>
            <FaNotesMedical className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bed Occupancy</p>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tempat tidur terisi</p>
            </div>
            <FaAmbulance className="text-2xl text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex flex-col items-center gap-2">
            <FaAmbulance className="text-2xl text-red-500" />
            <span className="font-medium">Registrasi Baru</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Pasien emergency baru</span>
          </button>
          <button className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex flex-col items-center gap-2">
            <FaPhone className="text-2xl text-blue-500" />
            <span className="font-medium">Panggilan Emergency</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Log panggilan masuk</span>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex flex-col items-center gap-2">
            <FaMapMarkerAlt className="text-2xl text-green-500" />
            <span className="font-medium">Tracking Ambulance</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Pantau posisi ambulance</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Cari Registrasi IGD</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaUserInjured className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien atau jenis emergency..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Filter Status
          </button>
        </div>
      </div>

      {/* Emergency Registrations Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Daftar Registrasi IGD</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Pantau semua pasien emergency yang sedang ditangani</p>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">ID Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Jenis Emergency</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Tingkat</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Waktu Kedatangan</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3 font-mono text-sm">{registration.patientId}</td>
                  <td className="px-4 py-3 font-medium">{registration.patientName}</td>
                  <td className="px-4 py-3">{registration.emergencyType}</td>
                  <td className="px-4 py-3">{getSeverityBadge(registration.severity)}</td>
                  <td className="px-4 py-3">{new Date(registration.arrivalTime).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3">{getStatusBadge(registration.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm">
                        Detail
                      </button>
                      <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm">
                        Update
                      </button>
                    </div>
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
