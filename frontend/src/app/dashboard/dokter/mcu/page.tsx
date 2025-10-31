'use client'

import { useState } from 'react'

type MCU = {
  pasien: string
  jenis: string
  hasil: string
  tanggal: string
}

const initialData: MCU[] = [
  { pasien: 'Dewi', jenis: 'MCU Karyawan', hasil: 'Normal', tanggal: '2025-10-20' },
  { pasien: 'Budi', jenis: 'MCU Pra Nikah', hasil: 'Anemia ringan', tanggal: '2025-10-19' },
]

export default function MCUPage() {
  const [data, setData] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [formEntry, setFormEntry] = useState<MCU>({
    pasien: '',
    jenis: '',
    hasil: '',
    tanggal: '',
  })

  const openForm = (entry?: MCU, index?: number) => {
    if (entry && index !== undefined) {
      setFormEntry(entry)
      setEditIndex(index)
    } else {
      setFormEntry({
        pasien: '',
        jenis: '',
        hasil: '',
        tanggal: '',
      })
      setEditIndex(null)
    }
    setShowForm(true)
  }

  const handleSave = () => {
    if (Object.values(formEntry).some((v) => v.trim() === '')) return
    if (editIndex !== null) {
      const updated = [...data]
      updated[editIndex] = formEntry
      setData(updated)
    } else {
      setData([...data, formEntry])
    }
    setShowForm(false)
    setEditIndex(null)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧪 Medical Check Up</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Hasil pemeriksaan MCU pasien.</p>

      <button
        onClick={() => openForm()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ➕ Input MCU
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editIndex !== null ? 'Edit Data MCU' : 'Form MCU Baru'}
            </h3>
            <div className="space-y-3">
              {Object.entries(formEntry).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 capitalize">{key}</label>
                  {key === 'hasil' ? (
                    <textarea
                      value={value}
                      onChange={(e) => setFormEntry({ ...formEntry, [key]: e.target.value })}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                      rows={3}
                    />
                  ) : key === 'tanggal' ? (
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => setFormEntry({ ...formEntry, [key]: e.target.value })}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                    />
                  ) : (
                    <input
                      value={value}
                      onChange={(e) => setFormEntry({ ...formEntry, [key]: e.target.value })}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto border rounded shadow mt-4">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Jenis MCU</th>
              <th className="px-4 py-2 text-left">Hasil</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{d.pasien}</td>
                <td className="px-4 py-2">{d.jenis}</td>
                <td className="px-4 py-2 whitespace-pre-wrap">{d.hasil}</td>
                <td className="px-4 py-2">{d.tanggal}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => openForm(d, i)}
                    className="px-2 py-1 text-xs rounded bg-yellow-500 text-white"
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}