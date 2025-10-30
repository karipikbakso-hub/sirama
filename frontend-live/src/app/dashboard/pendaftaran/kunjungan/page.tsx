'use client'

import { useState } from 'react'
import { FiEdit, FiPlus } from 'react-icons/fi'

type Kunjungan = {
  pasien: string
  poli: string
  tanggal: string
  status: 'Diproses' | 'Selesai'
}

const initialData: Kunjungan[] = [
  { pasien: 'Dewi', poli: 'Umum', tanggal: '2025-10-25', status: 'Selesai' },
  { pasien: 'Budi', poli: 'Dalam', tanggal: '2025-10-24', status: 'Diproses' },
]

export default function KunjunganPage() {
  const [data, setData] = useState(initialData)
  const [form, setForm] = useState<Kunjungan>({
    pasien: '',
    poli: '',
    tanggal: '',
    status: 'Diproses',
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleTambah = () => {
    setForm({ pasien: '', poli: '', tanggal: '', status: 'Diproses' })
    setEditIndex(null)
    setShowForm(true)
  }

  const handleEdit = (index: number) => {
    setForm(data[index])
    setEditIndex(index)
    setShowForm(true)
  }

  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...data]
      updated[editIndex] = form
      setData(updated)
    } else {
      setData(prev => [...prev, form])
    }
    setShowForm(false)
    setEditIndex(null)
    setForm({ pasien: '', poli: '', tanggal: '', status: 'Diproses' })
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📅 Riwayat Kunjungan</h1>
        <button
          onClick={handleTambah}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus />
          Tambah Kunjungan
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar kunjungan pasien ke fasilitas kesehatan.
      </p>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editIndex !== null ? 'Edit Kunjungan' : 'Tambah Kunjungan Baru'}
            </h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <input
                type="text"
                placeholder="Nama Pasien"
                value={form.pasien}
                onChange={e => setForm({ ...form, pasien: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Poli Tujuan"
                value={form.poli}
                onChange={e => setForm({ ...form, poli: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="date"
                value={form.tanggal}
                onChange={e => setForm({ ...form, tanggal: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Kunjungan['status'] })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              >
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Poli</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((k, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{k.pasien}</td>
                <td className="px-4 py-2">{k.poli}</td>
                <td className="px-4 py-2">{k.tanggal}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    k.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {k.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <FiEdit
                    onClick={() => handleEdit(i)}
                    className="text-gray-500 hover:text-yellow-600 cursor-pointer text-lg"
                    title="Edit Kunjungan"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}