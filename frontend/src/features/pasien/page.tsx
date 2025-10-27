'use client'
import { useEffect, useState } from 'react'
import { fetchMock } from '../../lib/api'

export default function PasienPage(){
const [list, setList] = useState<any[]>([])
useEffect(()=>{ fetchMock('pasien.json').then(setList).catch(()=>[]) },[])
return (
<div>
<h1 className="text-2xl font-bold mb-4">Daftar Pasien</h1>
<div className="card">
<table className="w-full table-auto">
<thead><tr><th className="text-left">RM</th><th className="text-left">Nama</th><th className="text-left">NIK</th><th className="text-left">Alamat</th></tr></thead>
<tbody>
{list.map(p => (
<tr key={p.id}><td className="py-2">{String(p.id).padStart(4,'0')}</td><td>{p.nama}</td><td>{p.nik}</td><td>{p.alamat}</td></tr>
))}
</tbody>
</table>
</div>
</div>
)
}
