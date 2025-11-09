'use client'

import { FaCamera, FaFileUpload, FaClipboardCheck, FaXRay } from 'react-icons/fa'

export default function RadiograferDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 transition-all duration-500 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-800 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide flex items-center gap-3">
        <FaXRay className="text-blue-500" />
        <span>Dashboard Radiografer</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <FaClipboardCheck className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Order Radiologi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Kelola order radiologi</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <FaFileUpload className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Hasil Radiologi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Kelola hasil radiologi</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 backdrop-blur-md shadow-xl rounded-2xl p-6 hover:shadow-2xl transition">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <FaClipboardCheck className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Validasi Radiologi</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Validasi hasil radiologi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}