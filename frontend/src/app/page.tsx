'use client'

import { useEffect, useState } from 'react'
import { fetchMock } from '../lib/api'
import StatCard from '../components/StatCard'

type DashboardStats = {
  total_pasien_hari_ini: number
  pendapatan_harian: number
  jumlah_dokter_jaga: number
}

export default function Page() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetchMock('dashboard.json')
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {stats === null ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Kunjungan Hari Ini" value={stats.total_pasien_hari_ini ?? '—'} />
          <StatCard
            title="Pendapatan"
            value={
              stats.pendapatan_harian
                ? `Rp ${stats.pendapatan_harian.toLocaleString()}`
                : '—'
            }
          />
          <StatCard title="Dokter Jaga" value={stats.jumlah_dokter_jaga ?? '—'} />
        </div>
      )}

      <div className="card p-4 bg-white rounded shadow">
        Grafik placeholder (Recharts siap diintegrasi)
      </div>
    </div>
  )
}
