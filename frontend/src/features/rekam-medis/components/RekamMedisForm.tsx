import { useState } from 'react'
import { useRekamMedisData } from '../hooks'

export default function RekamMedisForm() {
  const { addRekamMedis } = useRekamMedisData()
  const [nama, setNama] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [tindakan, setTindakan] = useState('')
  const [dokter, setDokter] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addRekamMedis({ nama, diagnosis, tindakan, dokter })
    setNama('')
    setDiagnosis('')
    setTindakan('')
    setDokter('')
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
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={e => setDiagnosis(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Tindakan"
          value={tindakan}
          onChange={e => setTindakan(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Dokter"
          value={dokter}
          onChange={e => setDokter(e.target.value)}
          className="p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
        Simpan Rekam Medis
      </button>
    </form>
  )
}
