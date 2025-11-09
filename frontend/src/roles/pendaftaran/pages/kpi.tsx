'use client'

import { FaChartLine, FaTrophy, FaClock, FaUsers } from 'react-icons/fa'

export default function KpiPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaChartLine className="text-green-500" />
        <span>Dashboard KPI Pendaftaran</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Target Pendaftaran</p>
              <p className="text-2xl font-bold text-blue-600">85%</p>
            </div>
            <FaUsers className="text-3xl text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Waktu Tunggu</p>
              <p className="text-2xl font-bold text-green-600">12m</p>
            </div>
            <FaClock className="text-3xl text-green-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kepuasan Pasien</p>
              <p className="text-2xl font-bold text-purple-600">92%</p>
            </div>
            <FaTrophy className="text-3xl text-purple-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{width: '92%'}}></div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efisiensi</p>
              <p className="text-2xl font-bold text-orange-600">88%</p>
            </div>
            <FaChartLine className="text-3xl text-orange-500" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{width: '88%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">KPI Bulanan</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Januari</span>
              <span className="font-bold text-green-600">95%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Februari</span>
              <span className="font-bold text-green-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Maret</span>
              <span className="font-bold text-yellow-600">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>April</span>
              <span className="font-bold text-blue-600">85%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Area Perbaikan</h2>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
              <div className="font-medium text-red-800 dark:text-red-200">Waktu Tunggu IGD</div>
              <div className="text-sm text-red-600 dark:text-red-300">Target: {'<'} 15 menit, Aktual: 18 menit</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">Akurasi Data</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-300">Target: 98%, Aktual: 94%</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="font-medium text-blue-800 dark:text-blue-200">Sistem Antrol</div>
              <div className="text-sm text-blue-600 dark:text-blue-300">Implementasi Mobile JKN</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
