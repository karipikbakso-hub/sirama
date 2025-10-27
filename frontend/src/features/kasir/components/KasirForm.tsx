import { useState } from 'react'
import { useKasirData } from '../hooks'

export default function KasirForm() {
  const { addTransaksi } = useKasirData()
  const [nama, setNama] = useState('')
  const [layanan, setLayanan] = useState('')
  const [total, setTotal] = useState<number>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTransaksi({ nama, layanan, total })
    setNama('')
    setLayanan('')
    setTotal(0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nama Pasien"
          value={nama}
          onChange={e => setNama(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Layanan"
          value={layanan}
          onChange={e => setLayanan(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Total (Rp)"
          value={total}
          onChange={e => setTotal(Number(e.target.value))}
          className="p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Tambah Transaksi
      </button>
    </form>
  )
}
