'use client'

import { useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

export default function LaporanPage() {
  const [filterType, setFilterType] = useState('bulan')
  const [selected, setSelected] = useState('Oktober 2025')

  const kunjunganData = {
    labels: ['IGD', 'Rawat Inap', 'Poli Umum', 'Farmasi', 'Laboratorium'],
    datasets: [
      {
        label: 'Kunjungan Minggu Ini',
        data: [120, 85, 210, 160, 95],
        backgroundColor: '#3b82f6',
      },
    ],
  }

  const pendapatanData = {
    labels: ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    datasets: [
      {
        label: 'Pendapatan (juta)',
        data: [75, 82, 90, 88, 95, 102],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const distribusiData = {
    labels: ['BPJS', 'Umum', 'Asuransi'],
    datasets: [
      {
        data: [62, 28, 10],
        backgroundColor: ['#6366f1', '#f59e0b', '#ef4444'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">📊 Laporan & Statistik</h2>

      {/* Filter & Ekspor */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Group */}
        <div className="flex items-center gap-3">
            
            {/* Label + Select */}
            <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300">  Filter</label>
            <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 shadow-sm"
            >
                <option value="tanggal">Tanggal</option>
                <option value="minggu">Minggu</option>
                <option value="bulan">Bulan</option>
            </select>
            </div>

            {/* Periode */}
            <div className="flex flex-col">
            <label className="text-sm text-gray-600 dark:text-gray-300">  Periode</label>
            <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 shadow-sm"
            >
                {filterType === 'bulan' && (
                <>
                    <option>September 2025</option>
                    <option>Oktober 2025</option>
                    <option>November 2025</option>
                </>
                )}
                {filterType === 'tanggal' && (
                <>
                    <option>28 Okt 2025</option>
                    <option>29 Okt 2025</option>
                    <option>30 Okt 2025</option>
                </>
                )}
            </select>
            </div>
        </div>

        {/* Tombol Ekspor */}
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow">
            📤 Ekspor Laporan
        </button>
        </div>

      {/* Ringkasan Metrik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Kunjungan</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">670</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendapatan</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">Rp 102 Juta</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pasien BPJS</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">62%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pasien Umum</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">28%</p>
        </div>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kunjungan per Unit</h3>
          <Bar data={kunjunganData} options={{ responsive: true }} />
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pendapatan Bulanan</h3>
          <Line data={pendapatanData} options={{ responsive: true }} />
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distribusi Pasien</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut data={distribusiData} options={{ responsive: true, cutout: '80%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}