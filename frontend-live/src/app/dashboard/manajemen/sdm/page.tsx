'use client'

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const sdm = [
  { nama: 'Dewi', jabatan: 'Perawat', status: 'Hadir', shift: 'Pagi', unit: 'Rawat Inap' },
  { nama: 'Budi', jabatan: 'Dokter Umum', status: 'Hadir', shift: 'Sore', unit: 'Poli Umum' },
  { nama: 'Siti', jabatan: 'Kasir', status: 'Izin', shift: '-', unit: 'Kasir' },
  { nama: 'Agus', jabatan: 'Admin Sistem', status: 'Hadir', shift: 'Pagi', unit: 'Manajemen' },
  { nama: 'Lina', jabatan: 'Apoteker', status: 'Hadir', shift: 'Pagi', unit: 'Farmasi' },
  { nama: 'Joko', jabatan: 'Radiografer', status: 'Sakit', shift: '-', unit: 'Radiologi' },
  { nama: 'Rina', jabatan: 'Analis Lab', status: 'Hadir', shift: 'Sore', unit: 'Laboratorium' },
  { nama: 'Tono', jabatan: 'Dokter Spesialis', status: 'Hadir', shift: 'Pagi', unit: 'Poli Dalam' },
]

export default function SDMPage() {
  const statusCount = useMemo(() => {
    const count = { Hadir: 0, Izin: 0, Sakit: 0 }
    sdm.forEach(s => count[s.status]++)
    return count
  }, [])

  const unitCount = useMemo(() => {
    const map = new Map<string, number>()
    sdm.forEach(s => {
      map.set(s.unit, (map.get(s.unit) || 0) + 1)
    })
    return {
      labels: Array.from(map.keys()),
      values: Array.from(map.values()),
    }
  }, [])

  const shiftCount = useMemo(() => {
    const count = { Pagi: 0, Sore: 0, '-': 0 }
    sdm.forEach(s => count[s.shift]++)
    return count
  }, [])

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">👥 SDM & Kehadiran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Rekap visual kehadiran dan distribusi tenaga kerja per unit.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h2 className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">Status Kehadiran</h2>
          <Pie
            data={{
              labels: ['Hadir', 'Izin', 'Sakit'],
              datasets: [
                {
                  data: [statusCount.Hadir, statusCount.Izin, statusCount.Sakit],
                  backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
                },
              ],
            }}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h2 className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">Distribusi Unit Kerja</h2>
          <Bar
            data={{
              labels: unitCount.labels,
              datasets: [
                {
                  label: 'Jumlah SDM',
                  data: unitCount.values,
                  backgroundColor: '#3b82f6',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
          <h2 className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">Distribusi Shift</h2>
          <Bar
            data={{
              labels: ['Pagi', 'Sore', 'Tanpa Shift'],
              datasets: [
                {
                  label: 'Jumlah SDM',
                  data: [shiftCount.Pagi, shiftCount.Sore, shiftCount['-']],
                  backgroundColor: '#8b5cf6',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>
      </div>

      <div className="overflow-x-auto border rounded shadow mt-6">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Jabatan</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-left">Shift</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sdm.map((s, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{s.nama}</td>
                <td className="px-4 py-2">{s.jabatan}</td>
                <td className="px-4 py-2">{s.unit}</td>
                <td className="px-4 py-2">{s.shift}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    s.status === 'Hadir'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : s.status === 'Izin'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}