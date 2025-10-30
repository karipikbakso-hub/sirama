'use client'

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FiPrinter } from 'react-icons/fi'
import { useState } from 'react'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const populer = [
  { nama: 'Paracetamol', jumlah: 45 },
  { nama: 'Amoxicillin', jumlah: 32 },
  { nama: 'Omeprazole', jumlah: 28 },
  { nama: 'Cetirizine', jumlah: 21 },
  { nama: 'Ibuprofen', jumlah: 18 },
]

const chartData = {
  labels: populer.map(p => p.nama),
  datasets: [
    {
      label: 'Jumlah Diresepkan',
      data: populer.map(p => p.jumlah),
      backgroundColor: '#3b82f6',
    },
  ],
}

export default function ObatTerpopulerPage() {
  const [periode] = useState('Oktober 2025')

  const handleCetak = () => {
    console.log('🖨️ Cetak laporan obat terpopuler:', populer)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📊 Obat Terpopuler</h1>
        <button
          onClick={handleCetak}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPrinter />
          Cetak Laporan
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Statistik pemakaian obat berdasarkan resep yang masuk — periode {periode}.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <ul className="space-y-2">
          {populer.map((obat, i) => (
            <li
              key={i}
              className="p-4 bg-white dark:bg-gray-800 rounded shadow flex justify-between"
            >
              <span>{obat.nama}</span>
              <span className="font-semibold">{obat.jumlah} resep</span>
            </li>
          ))}
        </ul>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Grafik Obat Terpopuler
          </h2>
          <Bar data={chartData} />
        </div>
      </div>
    </div>
  )
}