'use client'

import { useEffect, useState } from 'react'
import { fetchMock } from './src/lib/api'

export default function Page(){
const [stats, setStats] = useState<any>(null)
useEffect(()=>{ fetchMock('dashboard.json').then(setStats).catch(()=>null) },[])
return (
<div>
<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
<div className="grid grid-cols-3 gap-4 mb-6">
<div className="card">Kunjungan Hari Ini<div className="text-2xl font-semibold">{stats?.total_pasien_hari_ini ?? '—'}</div></div>
<div className="card">Pendapatan<div className="text-2xl font-semibold">{stats?.pendapatan_harian ? `Rp ${stats.pendapatan_harian.toLocaleString()}` : '—'}</div></div>
<div className="card">Dokter Jaga<div className="text-2xl font-semibold">{stats?.jumlah_dokter_jaga ?? '—'}</div></div>
</div>
<div className="card">Grafik placeholder (bisa ganti Recharts nanti)</div>
</div>
)
}
