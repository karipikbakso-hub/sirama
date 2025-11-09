'use client'

import { FaCalendarAlt, FaClock, FaUser, FaCheckCircle } from 'react-icons/fa'

export default function AppointmentPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaCalendarAlt className="text-green-500" />
        <span>Sistem Appointment</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Jadwal Appointment</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pilih Dokter</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <option>dr. John Doe - Sp. Penyakit Dalam</option>
                    <option>dr. Jane Smith - Sp. Anak</option>
                    <option>dr. Bob Johnson - Sp. Kandungan</option>
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
                  <label className="block text-sm font-medium mb-2">Pilih Waktu</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <option>08:00 - 08:30</option>
                    <option>08:30 - 09:00</option>
                    <option>09:00 - 09:30</option>
                    <option>09:30 - 10:00</option>
                  </select>
                </div>

                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition">
                  Buat Appointment
                </button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FaCheckCircle className="text-green-600" />
                  Keuntungan Appointment
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Tidak perlu antri lama</li>
                  <li>• Waktu konsultasi terjamin</li>
                  <li>• Dokter yang diinginkan</li>
                  <li>• Reminder otomatis</li>
                  <li>• Pembatalan fleksibel</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Appointment Hari Ini</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaClock className="text-blue-600" />
                  <div>
                    <div className="font-medium">08:00 - dr. John Doe</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">John Smith - Konsultasi Penyakit Dalam</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Menunggu</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaUser className="text-green-600" />
                  <div>
                    <div className="font-medium">09:00 - dr. Jane Smith</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sarah Johnson - Kontrol Anak</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Sedang Dilayani</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Cek Appointment</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Masukkan nomor appointment"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                Cek Status
              </button>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Statistik Appointment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Hari Ini</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Bulan Ini</span>
                <span className="font-bold">245</span>
              </div>
              <div className="flex justify-between">
                <span>Rata-rata/Hari</span>
                <span className="font-bold">8.2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
