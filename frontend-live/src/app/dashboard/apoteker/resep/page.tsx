'use client'

import { useState } from 'react'

type Resep = {
  pasien: string
  jenis: string
  obat: string
  dosis: string
  status: 'Belum Divalidasi' | 'Sudah Divalidasi'
}

export default function EntryResepPage() {
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Resep, 'status'>>({
    pasien: '',
    jenis: '',
    obat: '',
    dosis: '',
  })
  const [data, setData] = useState<Resep[]>([
    { pasien: 'Rina', jenis: 'Tablet', obat: 'Paracetamol', dosis: '3x1', status: 'Sudah Divalidasi' },
    { pasien: 'Budi', jenis: 'Kapsul', obat: 'Amoxicillin', dosis: '2x1', status: 'Belum Divalidasi' },
    { pasien: 'Siti', jenis: 'Injeksi', obat: 'Omeprazole', dosis: '1x1', status: 'Belum Divalidasi' },
    { pasien: 'Andi', jenis: 'Sirup', obat: 'Cetirizine', dosis: '1x1 malam', status: 'Sudah Divalidasi' },
  ])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setData(prev => [...prev, { ...form, status: 'Belum Divalidasi' }])
    setForm({ pasien: '', jenis: '', obat: '', dosis: '' })
    setShowForm(false)
  }

  function handleValidasi(index: number) {
    const updated = [...data]
    updated[index].status = 'Sudah Divalidasi'
    setData(updated)
    setShowDetail(null)
  }

  function handleEdit(index: number) {
    const resep = data[index]
    setForm({ pasien: resep.pasien, jenis: resep.jenis, obat: resep.obat, dosis: resep.dosis })
    setData(data.filter((_, i) => i !== index))
    setShowDetail(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💊 Entry Resep</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Tambah Resep
        </button>
      </div>

      {/* Table */}
      <table className="w-full border dark:border-gray-700 text-sm bg-white dark:bg-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Pasien</th>
            <th className="px-4 py-2 text-left">Jenis Obat</th>
            <th className="px-4 py-2 text-left">Nama Obat</th>
            <th className="px-4 py-2 text-left">Dosis</th>
            <th className="px-4 py-2 text-left">Status</th>
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
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === 'Sudah Divalidasi'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => setShowDetail(i)}
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
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Detail Resep</h2>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Pasien:</strong> {data[showDetail].pasien}</p>
              <p><strong>Jenis Obat:</strong> {data[showDetail].jenis}</p>
              <p><strong>Nama Obat:</strong> {data[showDetail].obat}</p>
              <p><strong>Dosis:</strong> {data[showDetail].dosis}</p>
              <p><strong>Status:</strong> {data[showDetail].status}</p>
            </div>
            <div className="flex justify-end gap-2">
              {data[showDetail].status === 'Belum Divalidasi' && (
                <>
                  <button
                    onClick={() => handleValidasi(showDetail)}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    Validasi
                  </button>
                  <button
                    onClick={() => handleEdit(showDetail)}
                    className="px-3 py-2 bg-yellow-500 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                </>
              )}
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
