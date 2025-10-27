'use client'
import { useEffect, useState } from 'react'
import { fetchMock } from '../../lib/api'

export default function RMPage(){
const [data, setData] = useState<any[]>([])
useEffect(()=>{ fetchMock('rekam_medis.json').then(setData).catch(()=>[]) },[])
return (
<div>
<h1 className="text-2xl font-bold mb-4">Rekam Medis</h1>
<div className="card">
<ul>
{data.map(r => (
<li key={r.id} className="mb-3 border-b pb-2"><div className="font-semibold">{r.dokter} — {r.tanggal}</div><div>{r.diagnosa}</div><div className="text-sm text-gray-500">{r.tindakan}</div></li>
))}
</ul>
</div>
</div>
)
}
