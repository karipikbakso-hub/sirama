'use client'

import { FaFlask, FaFileUpload, FaClipboardCheck, FaChartBar } from 'react-icons/fa'

export default function LabDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaFlask className="text-blue-500" />
        <span>Dashboard Laboratorium</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <FaClipboardCheck className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Order Lab</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Kelola order laboratorium</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <FaFileUpload className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Hasil Lab</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Kelola hasil laboratorium</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <FaClipboardCheck className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Validasi Lab</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Validasi hasil laboratorium</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
              <FaChartBar className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Laporan Lab</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Lihat laporan laboratorium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}