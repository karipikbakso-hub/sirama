'use client'

import { useState } from 'react'

type OrderLab = {
  pasien: string
  jenis: string
  status: string
  tanggal: string
}

const initialOrders: OrderLab[] = [
  { pasien: 'Dewi', jenis: 'Hematologi Lengkap', status: 'Selesai', tanggal: '2025-10-25' },
  { pasien: 'Budi', jenis: 'Urinalisa', status: 'Pending', tanggal: '2025-10-24' },
  { pasien: 'Siti', jenis: 'Kimia Darah', status: 'Selesai', tanggal: '2025-10-23' },
  { pasien: 'Agus', jenis: 'Tes Fungsi Hati', status: 'Pending', tanggal: '2025-10-22' },
  { pasien: 'Lina', jenis: 'Tes Kolesterol', status: 'Selesai', tanggal: '2025-10-21' },
  { pasien: 'Joko', jenis: 'Tes Gula Darah', status: 'Selesai', tanggal: '2025-10-20' },
  { pasien: 'Rina', jenis: 'Tes Urin Mikroalbumin', status: 'Pending', tanggal: '2025-10-19' },
  { pasien: 'Tono', jenis: 'Tes Elektrolit', status: 'Selesai', tanggal: '2025-10-18' },
  { pasien: 'Maya', jenis: 'Tes HBsAg', status: 'Pending', tanggal: '2025-10-17' },
  { pasien: 'Andi', jenis: 'Tes TSH', status: 'Selesai', tanggal: '2025-10-16' },
  { pasien: 'Dewi', jenis: 'Tes CRP', status: 'Pending', tanggal: '2025-10-15' },
  { pasien: 'Budi', jenis: 'Tes D-Dimer', status: 'Selesai', tanggal: '2025-10-14' },
  { pasien: 'Siti', jenis: 'Tes HbA1c', status: 'Pending', tanggal: '2025-10-13' },
  { pasien: 'Agus', jenis: 'Tes Kreatinin', status: 'Selesai', tanggal: '2025-10-12' },
  { pasien: 'Lina', jenis: 'Tes SGPT/SGOT', status: 'Pending', tanggal: '2025-10-11' },
]

export default function OrderLabPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [showForm, setShowForm] = useState(false)
  const [newOrder, setNewOrder] = useState<OrderLab>({
    pasien: '',
    jenis: '',
    status: 'Pending',
    tanggal: '',
  })

  const handleAdd = () => {
    if (Object.values(newOrder).some((v) => v.trim() === '')) return
    setOrders([...orders, newOrder])
    setNewOrder({ pasien: '', jenis: '', status: 'Pending', tanggal: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧫 Order Laboratorium</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar permintaan pemeriksaan laboratorium dan status hasilnya.
      </p>

      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ➕ Input Order Lab
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Form Order Lab Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Pasien</label>
                <input
                  value={newOrder.pasien}
                  onChange={(e) => setNewOrder({ ...newOrder, pasien: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Jenis Pemeriksaan</label>
                <input
                  value={newOrder.jenis}
                  onChange={(e) => setNewOrder({ ...newOrder, jenis: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Status</label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={newOrder.tanggal}
                  onChange={(e) => setNewOrder({ ...newOrder, tanggal: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleAdd}
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
              <th className="px-4 py-2 text-left">Jenis Pemeriksaan</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{o.pasien}</td>
                <td className="px-4 py-2">{o.jenis}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      o.status === 'Selesai'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2">{o.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}