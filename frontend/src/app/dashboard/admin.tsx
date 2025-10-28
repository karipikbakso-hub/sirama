'use client'

import Sidebar from '../../components/Sidebar'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-[30] bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard Admin</h1>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 hover:underline"
          >
            Keluar
          </button>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Statistik Ringkas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              ['👥 Total Pasien', '3.782', 'text-green-500'],
              ['💊 Resep Hari Ini', '1.245', 'text-blue-500'],
              ['📋 Rawat Inap Aktif', '87', 'text-yellow-500'],
              ['💳 Billing Hari Ini', 'Rp 32.870.000', 'text-red-500'],
            ].map(([label, value, color]) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded shadow p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`text-2xl font-bold dark:text-white ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Target Bulanan */}
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-[6px] border-green-500 flex items-center justify-center text-xl font-bold text-green-600">
              75%
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">Target Kunjungan Bulanan</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kamu sudah capai 75% dari target 20.000 kunjungan. Teruskan!
              </p>
            </div>
          </div>

          {/* Grafik Dummy */}
          <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Grafik Kunjungan Pasien</p>
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xl">
              Grafik Dummy
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}