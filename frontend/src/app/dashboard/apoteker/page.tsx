'use client'

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function ApotekerDashboard() {
  const stats = [
    {
      icon: '💊',
      label: 'Entry Resep',
      value: '124 resep hari ini',
      color: 'bg-green-400',
      gradient: 'bg-gradient-to-r from-green-500 to-green-700',
    },
    {
      icon: '📦',
      label: 'Obat Diserahkan',
      value: '98 penyerahan',
      color: 'bg-blue-400',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-700',
    },
    {
      icon: '🏥',
      label: 'Stok Gudang',
      value: '87% kapasitas',
      color: 'bg-yellow-400',
      gradient: 'bg-gradient-to-r from-yellow-500 to-yellow-700',
    },
    {
      icon: '📋',
      label: 'Resep Pending',
      value: '12 belum diproses',
      color: 'bg-red-400',
      gradient: 'bg-gradient-to-r from-red-500 to-red-700',
    },
  ]

  const riwayatResepData = {
    labels: ['Selesai', 'Pending', 'Dibatalkan'],
    datasets: [
      {
        data: [72, 12, 4],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 1,
      },
    ],
  }

  const obatPopulerData = {
    labels: ['Paracetamol', 'Amoxicillin', 'Omeprazole', 'Cetirizine', 'Ibuprofen'],
    datasets: [
      {
        label: 'Jumlah Diresepkan',
        data: [45, 32, 28, 21, 18],
        backgroundColor: '#3b82f6',
      },
    ],
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-wide">
        Rangkuman Modul Apoteker
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Berikut status aktivitas hari ini di modul Entry Resep, Penyerahan Obat, dan Stok Gudang:
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ icon, label, value, color, gradient }) => (
          <div
            key={label}
            className={`relative p-5 rounded-xl shadow-md text-white ${gradient} overflow-hidden`}
          >
            <div className="absolute top-2 right-2 text-5xl opacity-20">{icon}</div>
            <div className="relative z-10 space-y-1">
              <h3 className="text-sm font-medium">{label}</h3>
              <p className="text-xl font-bold">{value}</p>
              <div className="mt-2 h-1 w-full bg-white/30 rounded-full">
                <div className={`h-1 rounded-full ${color}`} style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Riwayat Resep</h2>
          <Pie data={riwayatResepData} />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Obat Terpopuler</h2>
          <Bar data={obatPopulerData} />
        </div>
      </div>
    </div>
  )
}