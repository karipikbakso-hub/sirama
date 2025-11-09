'use client'

import { useState } from 'react'
import { FaHospital, FaUserMd, FaFileMedical, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa'

// Mock data for referrals
const mockReferrals = [
  {
    id: 1,
    patientName: 'Dewi Sartika',
    patientId: 'P007',
    fromHospital: 'RSUD Jakarta Pusat',
    toHospital: 'RS Cipto Mangunkusumo',
    referralReason: 'Kebutuhan operasi jantung',
    referralDate: '2025-01-15',
    status: 'Disetujui',
    doctor: 'Dr. Ahmad Faisal',
    specialty: 'Kardiologi',
    urgency: 'Urgent'
  },
  {
    id: 2,
    patientName: 'Rizki Ramadhan',
    patientId: 'P008',
    fromHospital: 'RSUD Jakarta Utara',
    toHospital: 'RS Harapan Kita',
    referralReason: 'Perawatan kanker stadium lanjut',
    referralDate: '2025-01-14',
    status: 'Menunggu',
    doctor: 'Dr. Siti Nurhaliza',
    specialty: 'Onkologi',
    urgency: 'Darurat'
  },
  {
    id: 3,
    patientName: 'Maya Sari',
    patientId: 'P009',
    fromHospital: 'RSUD Jakarta Barat',
    toHospital: 'RS Fatmawati',
    referralReason: 'Konsultasi spesialis mata',
    referralDate: '2025-01-13',
    status: 'Ditolak',
    doctor: 'Dr. Budi Santoso',
    specialty: 'Oftalmologi',
    urgency: 'Elektif'
  }
]

export default function SistemRujukanPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredReferrals, setFilteredReferrals] = useState(mockReferrals)
  const [statusFilter, setStatusFilter] = useState('all')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    let filtered = mockReferrals.filter(item =>
      item.patientName.toLowerCase().includes(term.toLowerCase()) ||
      item.patientId.toLowerCase().includes(term.toLowerCase()) ||
      item.fromHospital.toLowerCase().includes(term.toLowerCase()) ||
      item.toHospital.toLowerCase().includes(term.toLowerCase())
    )

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredReferrals(filtered)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    let filtered = mockReferrals

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fromHospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toHospital.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status)
    }

    setFilteredReferrals(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Disetujui
        </span>
      case 'Menunggu':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaClock className="text-xs" />
          Menunggu
        </span>
      case 'Ditolak':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium flex items-center gap-1">
          <FaExclamationTriangle className="text-xs" />
          Ditolak
        </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Darurat':
        return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-medium">Darurat</span>
      case 'Urgent':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 rounded-full text-xs font-medium">Urgent</span>
      case 'Elektif':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">Elektif</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{urgency}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaHospital className="text-blue-500" />
        <span className="truncate">Sistem Rujukan</span>
      </h1>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rujukan</p>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">bulan ini</p>
            </div>
            <FaFileMedical className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disetujui</p>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">tingkat approval</p>
            </div>
            <FaCheckCircle className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rata-rata Proses</p>
              <p className="text-2xl font-bold">2.3</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">hari approval</p>
            </div>
            <FaClock className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Menunggu Approval</p>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">kasus aktif</p>
            </div>
            <FaExclamationTriangle className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex flex-col items-center gap-2">
            <FaFileMedical className="text-2xl text-blue-500" />
            <span className="font-medium">Buat Rujukan Baru</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Ajukan rujukan pasien</span>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition flex flex-col items-center gap-2">
            <FaCheckCircle className="text-2xl text-green-500" />
            <span className="font-medium">Approval Rujukan</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Setujui/menolak rujukan</span>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex flex-col items-center gap-2">
            <FaHospital className="text-2xl text-purple-500" />
            <span className="font-medium">Tracking Rujukan</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Pantau status rujukan</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Cari Rujukan</h2>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaHospital className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari berdasarkan nama pasien, rumah sakit, atau ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleStatusFilter('Menunggu')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'Menunggu'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => handleStatusFilter('Disetujui')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'Disetujui'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Disetujui
            </button>
            <button
              onClick={() => handleStatusFilter('Ditolak')}
              className={`px-4 py-2 rounded-lg border transition ${
                statusFilter === 'Ditolak'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Ditolak
            </button>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-2">Daftar Rujukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Kelola semua permohonan rujukan pasien antar rumah sakit</p>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">ID Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Nama Pasien</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">RS Asal</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">RS Tujuan</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Spesialis</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Urgensi</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3 font-mono text-sm">{referral.patientId}</td>
                  <td className="px-4 py-3 font-medium">{referral.patientName}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={referral.fromHospital}>{referral.fromHospital}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={referral.toHospital}>{referral.toHospital}</td>
                  <td className="px-4 py-3">{referral.specialty}</td>
                  <td className="px-4 py-3">{getUrgencyBadge(referral.urgency)}</td>
                  <td className="px-4 py-3">{getStatusBadge(referral.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm">
                        Detail
                      </button>
                      {referral.status === 'Menunggu' && (
                        <div className="flex gap-1">
                          <button className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm">
                            ✓
                          </button>
                          <button className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                            ✗
                          </button>
                        </div>
                      )}
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
