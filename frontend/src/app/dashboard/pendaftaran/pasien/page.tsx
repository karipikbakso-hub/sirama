'use client'

import { useState } from 'react'
import { FiEdit, FiPlus, FiPrinter } from 'react-icons/fi'

type Pasien = {
  nama: string
  nik: string
  umur: number
  alamat: string
  status: 'Aktif' | 'Nonaktif'
}

const initialData: Pasien[] = [
  { nama: 'Dewi', nik: '3401010101010001', umur: 32, alamat: 'Mlati, Sleman', status: 'Aktif' },
  { nama: 'Budi', nik: '3401010101010002', umur: 45, alamat: 'Godean, Sleman', status: 'Aktif' },
  { nama: 'Siti', nik: '3401010101010003', umur: 29, alamat: 'Ngaglik, Sleman', status: 'Nonaktif' },
  { nama: 'Agus', nik: '3401010101010004', umur: 51, alamat: 'Kalasan, Sleman', status: 'Aktif' },
  { nama: 'Lina', nik: '3401010101010005', umur: 38, alamat: 'Berbah, Sleman', status: 'Aktif' },
  { nama: 'Joko', nik: '3401010101010006', umur: 60, alamat: 'Tempel, Sleman', status: 'Nonaktif' },
  { nama: 'Rina', nik: '3401010101010007', umur: 26, alamat: 'Depok, Sleman', status: 'Aktif' },
]

export default function PasienPage() {
  const [data, setData] = useState(initialData)
  const [form, setForm] = useState<Pasien>({
    nama: '',
    nik: '',
    umur: 0,
    alamat: '',
    status: 'Aktif',
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleTambah = () => {
    setForm({ nama: '', nik: '', umur: 0, alamat: '', status: 'Aktif' })
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
    setForm({ nama: '', nik: '', umur: 0, alamat: '', status: 'Aktif' })
  }

  const handleCetak = (index: number) => {
    console.log('🖨️ Cetak kartu pasien:', data[index])
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧑‍⚕️ Data Pasien</h1>
        <button
          onClick={handleTambah}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus />
          Tambah Pasien
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Informasi identitas, status, dan domisili pasien.
      </p>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editIndex !== null ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
            </h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <input type="text" placeholder="Nama" value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white" />
              <input type="text" placeholder="NIK" value={form.nik}
                onChange={e => setForm({ ...form, nik: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white" />
              <input type="number" placeholder="Umur" value={form.umur}
                onChange={e => setForm({ ...form, umur: Number(e.target.value) })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white" />
              <input type="text" placeholder="Alamat" value={form.alamat}
                onChange={e => setForm({ ...form, alamat: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white" />
              <select value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Pasien['status'] })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white">
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
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">NIK</th>
              <th className="px-4 py-2 text-left">Umur</th>
              <th className="px-4 py-2 text-left">Alamat</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{p.nama}</td>
                <td className="px-4 py-2">{p.nik}</td>
                <td className="px-4 py-2">{p.umur} tahun</td>
                <td className="px-4 py-2">{p.alamat}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === 'Aktif'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-3 items-center">
                  <FiPrinter
                    onClick={() => handleCetak(i)}
                    className="text-gray-500 hover:text-blue-600 cursor-pointer text-lg"
                    title="Cetak Kartu"
                  />
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