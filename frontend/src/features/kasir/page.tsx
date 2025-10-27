'use client'
import { useEffect, useState } from 'react'
import { fetchMock } from '../../lib/api'

export default function Kasir(){
const [list, setList] = useState<any[]>([])
useEffect(()=>{ fetchMock('kasir.json').then(setList).catch(()=>[]) },[])
return (
<div>
<h1 className="text-2xl font-bold mb-4">Kasir & Billing</h1>
<div className="card">
<table className="w-full">
<thead><tr><th>No</th><th>Pasien</th><th>Total</th><th>Status</th></tr></thead>
<tbody>
{list.map((b,i)=>(<tr key={b.id}><td className="py-2">{i+1}</td><td>{b.nama}</td><td>Rp {b.total.toLocaleString()}</td><td>{b.status}</td></tr>))}
</tbody>
</table>
</div>
</div>
)
}
