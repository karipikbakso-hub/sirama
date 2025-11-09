'use client'

import { FaMicroscope, FaXRay, FaPrint, FaUpload } from 'react-icons/fa'

const stats = [
  { icon: <FaMicroscope className="text-blue-600 text-xl" />, label: 'Order Laboratorium', value: '128 pemeriksaan' },
  { icon: <FaXRay className="text-purple-600 text-xl" />, label: 'Order Radiologi', value: '87 pemeriksaan' },
  { icon: <FaPrint className="text-green-600 text-xl" />, label: 'Hasil Dicetak', value: '342 hasil' },
  { icon: <FaUpload className="text-yellow-600 text-xl" />, label: 'Hasil Diunggah', value: '56 file' },
]

export default function LabradDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧪 Dashboard Lab & Radiologi</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aktivitas pemeriksaan dan hasil hari ini.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-md transition">
            <div>{stat.icon}</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
