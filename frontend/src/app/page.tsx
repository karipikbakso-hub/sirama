'use client'

import { useEffect, useState } from 'react'
import { fetchMock } from '../lib/api'
import StatCard from '../components/StatCard'
import { BarChart3, Users, Stethoscope, Loader2 } from 'lucide-react'

type DashboardStats = {
  total_pasien_hari_ini: number
  pendapatan_harian: number
  jumlah_dokter_jaga: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetchMock('dashboard.json')
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">Demo Fase 1</span>
      </div>

      {stats === null ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Kunjungan Hari Ini"
            value={stats.total_pasien_hari_ini ?? '—'}
            icon={<Users size={20} />}
          />
          <StatCard
            title="Pendapatan"
            value={
              stats.pendapatan_harian
                ? `Rp ${stats.pendapatan_harian.toLocaleString()}`
                : '—'
            }
            icon={<BarChart3 size={20} />}
          />
          <StatCard
            title="Dokter Jaga"
            value={stats.jumlah_dokter_jaga ?? '—'}
            icon={<Stethoscope size={20} />}
          />
        </div>
      )}

      <div className="card p-6 bg-white dark:bg-gray-900 rounded shadow">
        <div className="text-lg font-semibold mb-2">Grafik Kunjungan</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Placeholder grafik — siap integrasi Recharts atau Chart.js
        </div>
      </div>
    </div>
  )
}
