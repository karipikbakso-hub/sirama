import { useState } from 'react'
import { useAntrianData } from '../hooks'

export default function AntrianForm() {
  const { addAntrian } = useAntrianData()
  const [nama, setNama] = useState('')
  const [poli, setPoli] = useState('Umum')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addAntrian({ nama, poli, status: 'menunggu' })
    setNama('')
    setPoli('Umum')
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
        <select
          value={poli}
          onChange={e => setPoli(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="Umum">Umum</option>
          <option value="Gigi">Gigi</option>
          <option value="Anak">Anak</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Tambah Antrian
      </button>
    </form>
  )
}
