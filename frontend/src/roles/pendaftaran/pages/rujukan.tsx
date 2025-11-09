'use client'

import { FaHospital, FaFileAlt, FaCheckCircle, FaClock } from 'react-icons/fa'

export default function RujukanPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaHospital className="text-red-500" />
        <span>Sistem Rujukan</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Buat Rujukan Baru</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Jenis Rujukan</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <option>Rujukan Horizontal</option>
                <option>Rujukan Vertikal Naik</option>
                <option>Rujukan Vertikal Turun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Faskes Tujuan</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <option>RSUD Jakarta Pusat</option>
                <option>RS Cipto Mangunkusumo</option>
                <option>RS Harapan Kita</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Diagnosa</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                rows={3}
                placeholder="Jelaskan diagnosa dan alasan rujukan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tingkat Urgensi</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <option>Elektif</option>
                <option>Urgent</option>
                <option>Emergency</option>
              </select>
            </div>

            <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition">
              Buat Rujukan
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Status Rujukan</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-600" />
                  <div>
                    <div className="font-medium">Disetujui</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">RS Harapan Kita</div>
                  </div>
                </div>
                <span className="text-sm text-green-600">Aktif</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaClock className="text-yellow-600" />
                  <div>
                    <div className="font-medium">Menunggu Approval</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">RSCM</div>
                  </div>
                </div>
                <span className="text-sm text-yellow-600">Pending</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Panduan Rujukan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Rujukan horizontal antar RS tipe C/D</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Rujukan vertikal ke RS tipe A/B</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Dokumen lengkap diagnosis dan tindakan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
