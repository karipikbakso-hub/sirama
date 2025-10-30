'use client'

import { useState } from 'react'
import { FiEdit, FiPlus } from 'react-icons/fi'

type Income = {
  sumber: string
  total: string
  periode: string
}

const initialData: Income[] = [
  { sumber: 'Rawat Jalan', total: 'Rp 45.000.000', periode: 'Oktober 2025' },
  { sumber: 'Farmasi', total: 'Rp 28.500.000', periode: 'Oktober 2025' },
  { sumber: 'Laboratorium', total: 'Rp 18.000.000', periode: 'Oktober 2025' },
  { sumber: 'Radiologi', total: 'Rp 12.000.000', periode: 'Oktober 2025' },
]

export default function PendapatanPage() {
  const [data, setData] = useState(initialData)
  const [form, setForm] = useState<Income>({
    sumber: '',
    total: '',
    periode: '',
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleTambah = () => {
    setForm({ sumber: '', total: '', periode: '' })
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
    setForm({ sumber: '', total: '', periode: '' })
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💰 Pendapatan & Keuangan</h1>
        <button
          onClick={handleTambah}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus />
          Tambah Data
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Rekap pendapatan per modul dan periode.
      </p>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editIndex !== null ? 'Edit Pendapatan' : 'Tambah Pendapatan Baru'}
            </h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <input
                type="text"
                placeholder="Sumber Pendapatan"
                value={form.sumber}
                onChange={e => setForm({ ...form, sumber: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Total (contoh: Rp 10.000.000)"
                value={form.total}
                onChange={e => setForm({ ...form, total: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Periode (contoh: Oktober 2025)"
                value={form.periode}
                onChange={e => setForm({ ...form, periode: e.target.value })}
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
              <th className="px-4 py-2 text-left">Sumber</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Periode</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((i, idx) => (
              <tr key={idx} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{i.sumber}</td>
                <td className="px-4 py-2">{i.total}</td>
                <td className="px-4 py-2">{i.periode}</td>
                <td className="px-4 py-2">
                  <FiEdit
                    onClick={() => handleEdit(idx)}
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