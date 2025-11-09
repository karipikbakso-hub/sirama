'use client'

import { useState } from 'react'
import { FiEdit, FiPlus } from 'react-icons/fi'

type BPJS = {
  pasien: string
  nomor: string
  faskes: string
  status: 'Aktif' | 'Nonaktif'
}

const initialData: BPJS[] = [
  { pasien: 'Dewi', nomor: '0001234567890', faskes: 'Puskesmas Mlati', status: 'Aktif' },
  { pasien: 'Budi', nomor: '0009876543210', faskes: 'RSUD Sleman', status: 'Nonaktif' },
]

export default function BPJSPage() {
  const [data, setData] = useState(initialData)
  const [form, setForm] = useState<BPJS>({
    pasien: '',
    nomor: '',
    faskes: '',
    status: 'Aktif',
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleTambah = () => {
    setForm({ pasien: '', nomor: '', faskes: '', status: 'Aktif' })
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
    setForm({ pasien: '', nomor: '', faskes: '', status: 'Aktif' })
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🪪 Data BPJS</h1>
        <button
          onClick={handleTambah}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus />
          Tambah Peserta
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Informasi peserta BPJS dan status kepesertaan.
      </p>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editIndex !== null ? 'Edit Data BPJS' : 'Tambah Peserta BPJS'}
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
                placeholder="Nomor BPJS"
                value={form.nomor}
                onChange={e => setForm({ ...form, nomor: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Faskes Terdaftar"
                value={form.faskes}
                onChange={e => setForm({ ...form, faskes: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as BPJS['status'] })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
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
              <th className="px-4 py-2 text-left">Nomor BPJS</th>
              <th className="px-4 py-2 text-left">Faskes</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{b.pasien}</td>
                <td className="px-4 py-2">{b.nomor}</td>
                <td className="px-4 py-2">{b.faskes}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    b.status === 'Aktif'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <FiEdit
                    onClick={() => handleEdit(i)}
                    className="text-gray-500 hover:text-yellow-600 cursor-pointer text-lg"
                    title="Edit Data"
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