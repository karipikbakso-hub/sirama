'use client'

import { useState } from 'react'

type Resep = {
  pasien: string
  jenis: string
  obat: string
  dosis: string
}

export default function EntryResepPage() {
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState<Resep | null>(null)
  const [form, setForm] = useState<Resep>({
    pasien: '',
    jenis: '',
    obat: '',
    dosis: '',
  })
  const [data, setData] = useState<Resep[]>([
    { pasien: 'Rina', jenis: 'Tablet', obat: 'Paracetamol', dosis: '3x1' },
    { pasien: 'Budi', jenis: 'Kapsul', obat: 'Amoxicillin', dosis: '2x1' },
    { pasien: 'Siti', jenis: 'Injeksi', obat: 'Omeprazole', dosis: '1x1' },
    { pasien: 'Andi', jenis: 'Sirup', obat: 'Cetirizine', dosis: '1x1 malam' },
  ])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setData(prev => [...prev, form])
    setForm({ pasien: '', jenis: '', obat: '', dosis: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Entry Resep</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Tambah Resep
        </button>
      </div>

      {/* Table */}
      <table className="w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Pasien</th>
            <th className="px-4 py-2 text-left">Jenis Obat</th>
            <th className="px-4 py-2 text-left">Nama Obat</th>
            <th className="px-4 py-2 text-left">Dosis</th>
            <th className="px-4 py-2 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={i} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{r.pasien}</td>
              <td className="px-4 py-2">{r.jenis}</td>
              <td className="px-4 py-2">{r.obat}</td>
              <td className="px-4 py-2">{r.dosis}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => setShowDetail(r)}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-xl space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tambah Resep Baru</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama Pasien"
                value={form.pasien}
                onChange={e => setForm({ ...form, pasien: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Jenis Obat"
                value={form.jenis}
                onChange={e => setForm({ ...form, jenis: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Nama Obat"
                value={form.obat}
                onChange={e => setForm({ ...form, obat: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Dosis"
                value={form.dosis}
                onChange={e => setForm({ ...form, dosis: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
                required
              />
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Detail Resep</h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Pasien:</strong> {showDetail.pasien}</p>
              <p><strong>Jenis Obat:</strong> {showDetail.jenis}</p>
              <p><strong>Nama Obat:</strong> {showDetail.obat}</p>
              <p><strong>Dosis:</strong> {showDetail.dosis}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 bg-green-600 text-white rounded text-sm">Validasi</button>
              <button className="px-3 py-2 bg-yellow-500 text-white rounded text-sm">Edit</button>
              <button
                onClick={() => setShowDetail(null)}
                className="px-3 py-2 bg-gray-400 text-white rounded text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}