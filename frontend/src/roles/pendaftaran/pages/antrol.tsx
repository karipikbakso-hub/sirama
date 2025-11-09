'use client'

import { useState } from 'react'
import { FaMobile, FaQrcode, FaCalendarAlt, FaClock } from 'react-icons/fa'

export default function AntrolPage() {
  const [activeTab, setActiveTab] = useState<'booking' | 'status'>('booking')

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaMobile className="text-blue-500" />
        <span>Antrol - Mobile JKN</span>
      </h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('booking')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'booking'
              ? 'bg-blue-600 text-white'
              : 'bg-white/70 dark:bg-zinc-900/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Booking Online
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'status'
              ? 'bg-blue-600 text-white'
              : 'bg-white/70 dark:bg-zinc-900/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Cek Status
        </button>
      </div>

      {activeTab === 'booking' ? (
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Booking Antrian Online</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Poli</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <option>Poli Umum</option>
                  <option>Poli Anak</option>
                  <option>Poli Kandungan</option>
                  <option>Poli Penyakit Dalam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pilih Tanggal</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pilih Dokter</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <option>dr. John Doe</option>
                  <option>dr. Jane Smith</option>
                  <option>dr. Bob Johnson</option>
                </select>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition">
                Booking Sekarang
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FaQrcode className="text-blue-600" />
                Cara Booking
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Unduh aplikasi Mobile JKN</li>
                <li>Login dengan akun BPJS Anda</li>
                <li>Pilih rumah sakit dan poli</li>
                <li>Tentukan tanggal dan waktu</li>
                <li>Konfirmasi booking</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Cek Status Booking</h2>

          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nomor Booking</label>
              <input
                type="text"
                placeholder="Masukkan nomor booking"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
              />
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition">
              Cek Status
            </button>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaClock className="text-blue-500" />
                <span className="font-medium">Status: Menunggu Konfirmasi</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Booking Anda sedang diproses. Anda akan menerima notifikasi melalui SMS.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
