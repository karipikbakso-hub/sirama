'use client'

import { useState } from 'react'
import { FiEdit, FiPlus } from 'react-icons/fi'

type Modul = {
  nama: string
  status: 'Aktif' | 'Nonaktif'
  uptime: string
  transaksi: number
}

const initialData: Modul[] = [
  { nama: 'Rawat Inap', status: 'Aktif', uptime: '99.8%', transaksi: 128 },
  { nama: 'Farmasi', status: 'Aktif', uptime: '99.9%', transaksi: 342 },
  { nama: 'Kasir', status: 'Aktif', uptime: '99.7%', transaksi: 210 },
  { nama: 'Radiologi', status: 'Aktif', uptime: '99.6%', transaksi: 87 },
]

export default function KinerjaPage() {
  const [data, setData] = useState(initialData)
  const [form, setForm] = useState<Modul>({
    nama: '',
    status: 'Aktif',
    uptime: '',
    transaksi: 0,
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleTambah = () => {
    setForm({ nama: '', status: 'Aktif', uptime: '', transaksi: 0 })
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
    setForm({ nama: '', status: 'Aktif', uptime: '', transaksi: 0 })
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📈 Kinerja Modul</h1>
        <button
          onClick={handleTambah}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus />
          Tambah Modul
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Status dan performa tiap modul sistem.
      </p>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editIndex !== null ? 'Edit Modul' : 'Tambah Modul Baru'}
            </h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <input
                type="text"
                placeholder="Nama Modul"
                value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Modul['status'] })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <input
                type="text"
                placeholder="Uptime (contoh: 99.8%)"
                value={form.uptime}
                onChange={e => setForm({ ...form, uptime: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="number"
                placeholder="Jumlah Transaksi"
                value={form.transaksi}
                onChange={e => setForm({ ...form, transaksi: Number(e.target.value) })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
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
              <th className="px-4 py-2 text-left">Modul</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Uptime</th>
              <th className="px-4 py-2 text-left">Transaksi</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{m.nama}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    m.status === 'Aktif'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-2">{m.uptime}</td>
                <td className="px-4 py-2">{m.transaksi}</td>
                <td className="px-4 py-2">
                  <FiEdit
                    onClick={() => handleEdit(i)}
                    className="text-gray-500 hover:text-yellow-600 cursor-pointer text-lg"
                    title="Edit Modul"
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