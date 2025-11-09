'use client'

import { useState } from 'react'
import { FaMobile, FaQrcode, FaDownload, FaShare, FaClock, FaUsers, FaCheckCircle } from 'react-icons/fa'

// Mock data for Antrol Mobile
const mockAntrolStats = {
  totalRegistrations: 1247,
  todayRegistrations: 89,
  activeTokens: 23,
  completedTokens: 156
}

const mockActiveTokens = [
  {
    id: 1,
    tokenNumber: 'A001',
    patientName: 'Ahmad Surya',
    service: 'Poli Umum',
    registrationTime: '2025-01-15 08:30:00',
    estimatedTime: '09:15',
    status: 'waiting'
  },
  {
    id: 2,
    tokenNumber: 'B015',
    patientName: 'Sari Dewi',
    service: 'Poli Anak',
    registrationTime: '2025-01-15 08:45:00',
    estimatedTime: '10:30',
    status: 'waiting'
  },
  {
    id: 3,
    tokenNumber: 'C008',
    patientName: 'Rudi Hartono',
    service: 'Poli Jantung',
    registrationTime: '2025-01-15 09:00:00',
    estimatedTime: '11:45',
    status: 'in_service'
  }
]

export default function AntrolPage() {
  const [selectedService, setSelectedService] = useState('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">Menunggu</span>
      case 'in_service':
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">Dilayani</span>
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">Selesai</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-full text-xs font-medium">{status}</span>
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaMobile className="text-green-500" />
        <span className="truncate">Antrol Mobile</span>
      </h1>

      {/* Antrol Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registrasi</p>
              <p className="text-2xl font-bold">{mockAntrolStats.totalRegistrations.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">bulan ini</p>
            </div>
            <FaUsers className="text-2xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registrasi Hari Ini</p>
              <p className="text-2xl font-bold">{mockAntrolStats.todayRegistrations}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">+12% dari kemarin</p>
            </div>
            <FaMobile className="text-2xl text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Aktif</p>
              <p className="text-2xl font-bold">{mockAntrolStats.activeTokens}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">sedang menunggu</p>
            </div>
            <FaClock className="text-2xl text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Token Selesai</p>
              <p className="text-2xl font-bold">{mockAntrolStats.completedTokens}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">hari ini</p>
            </div>
            <FaCheckCircle className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Mobile App Features */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Fitur Aplikasi Mobile</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <FaQrcode className="text-3xl text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Scan QR Code</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Scan kode QR untuk registrasi cepat</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <FaClock className="text-3xl text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update status antrian secara real-time</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <FaShare className="text-3xl text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Share & Notify</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bagikan informasi antrian ke keluarga</p>
          </div>
        </div>
      </div>

      {/* Active Tokens */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Token Aktif Saat Ini</h2>
        <div className="space-y-3">
          {mockActiveTokens.map((token) => (
            <div key={token.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{token.tokenNumber}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{token.patientName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{token.service}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Registrasi: {new Date(token.registrationTime).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(token.status)}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Estimasi: {token.estimatedTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Selection & QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Selection */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">Pilih Layanan</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih Poli/Klinik
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              >
                <option value="all">Semua Layanan</option>
                <option value="umum">Poli Umum</option>
                <option value="anak">Poli Anak</option>
                <option value="jantung">Poli Jantung</option>
                <option value="mata">Poli Mata</option>
                <option value="kulit">Poli Kulit & Kelamin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Kunjungan
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Waktu Kedatangan
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                <option>Pagi (08:00 - 12:00)</option>
                <option>Siang (13:00 - 17:00)</option>
              </select>
            </div>

            <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium">
              Generate Token Antrian
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold mb-4">QR Code Registrasi</h2>
          <div className="text-center">
            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500">
                <FaQrcode className="text-6xl mx-auto mb-2" />
                <p className="text-sm">QR Code akan muncul di sini</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2">
                <FaDownload />
                Download QR Code
              </button>

              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2">
                <FaShare />
                Bagikan Link
              </button>
            </div>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Petunjuk:</strong> Buka aplikasi SIRAMA Mobile, scan QR code ini untuk registrasi cepat tanpa antri.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Download */}
      <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold mb-4">Download Aplikasi Mobile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-lg">📱</span>
            </div>
            <h3 className="font-semibold mb-2">Android App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download dari Google Play Store
            </p>
            <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition">
              Download APK
            </button>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍎</span>
            </div>
            <h3 className="font-semibold mb-2">iOS App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Tersedia di App Store
            </p>
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
              Download iOS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
