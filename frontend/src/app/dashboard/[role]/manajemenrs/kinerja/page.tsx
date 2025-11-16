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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <span>📈 Indikator Kualitas</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitoring indikator kualitas dan performa sistem rumah sakit
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Kinerja Modul Sistem
          </h3>
          <button
            onClick={handleTambah}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus />
            Tambah Modul
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700 text-left">
                <th className="py-3 px-2">Modul</th>
                <th className="px-2">Status</th>
                <th className="px-2">Uptime</th>
                <th className="px-2">Transaksi</th>
                <th className="text-right px-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={i} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition">
                  <td className="py-3 px-2 font-medium">{m.nama}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.status === 'Aktif'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-2">{m.uptime}</td>
                  <td className="px-2">{m.transaksi}</td>
                  <td className="text-right px-2">
                    <button
                      onClick={() => handleEdit(i)}
                      className="p-2 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                      title="Edit Modul"
                    >
                      <FiEdit className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl">📊</span>
            <p className="mt-2">Tidak ada data modul yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {editIndex !== null ? 'Edit Modul' : 'Tambah Modul Baru'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Modul
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Modul"
                    value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as Modul['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Uptime
                  </label>
                  <input
                    type="text"
                    placeholder="Uptime (contoh: 99.8%)"
                    value={form.uptime}
                    onChange={e => setForm({ ...form, uptime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jumlah Transaksi
                  </label>
                  <input
                    type="number"
                    placeholder="Jumlah Transaksi"
                    value={form.transaksi}
                    onChange={e => setForm({ ...form, transaksi: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
