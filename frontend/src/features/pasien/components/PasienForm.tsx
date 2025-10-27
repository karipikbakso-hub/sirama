import { useState } from 'react'
import { usePasienData } from '../hooks'

export default function PasienForm() {
  const { addPasien } = usePasienData()
  const [nama, setNama] = useState('')
  const [nik, setNik] = useState('')
  const [umur, setUmur] = useState<number>(0)
  const [keluhan, setKeluhan] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPasien({ nama, nik, umur, keluhan })
    setNama('')
    setNik('')
    setUmur(0)
    setKeluhan('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nama"
          value={nama}
          onChange={e => setNama(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="NIK"
          value={nik}
          onChange={e => setNik(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Umur"
          value={umur}
          onChange={e => setUmur(Number(e.target.value))}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Keluhan"
          value={keluhan}
          onChange={e => setKeluhan(e.target.value)}
          className="p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Tambah Pasien
      </button>
    </form>
  )
}
