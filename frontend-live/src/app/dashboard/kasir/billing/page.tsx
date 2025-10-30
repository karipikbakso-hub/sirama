'use client'

import { useState } from 'react'

type Bill = {
  pasien: string
  layanan: string
  total: string
  status: string
  tanggal: string
}

const initialBills: Bill[] = [
  { pasien: 'Dewi', layanan: 'Rawat Jalan', total: 'Rp 250.000', status: 'Belum Dibayar', tanggal: '2025-10-25' },
  { pasien: 'Budi', layanan: 'Laboratorium', total: 'Rp 180.000', status: 'Sudah Dibayar', tanggal: '2025-10-24' },
]

export default function BillingPage() {
  const [bills, setBills] = useState(initialBills)
  const [showForm, setShowForm] = useState(false)
  const [newBill, setNewBill] = useState<Bill>({
    pasien: '',
    layanan: '',
    total: '',
    status: 'Belum Dibayar',
    tanggal: '',
  })

  const handleAdd = () => {
    if (Object.values(newBill).some((v) => v.trim() === '')) return
    setBills([...bills, newBill])
    setNewBill({ pasien: '', layanan: '', total: '', status: 'Belum Dibayar', tanggal: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💳 Billing & Pembayaran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar tagihan pasien dan status pembayarannya.</p>

      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ➕ Input Tagihan
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Form Tagihan Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Pasien</label>
                <input
                  value={newBill.pasien}
                  onChange={(e) => setNewBill({ ...newBill, pasien: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Layanan</label>
                <input
                  value={newBill.layanan}
                  onChange={(e) => setNewBill({ ...newBill, layanan: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Total</label>
                <input
                  value={newBill.total}
                  onChange={(e) => setNewBill({ ...newBill, total: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                  placeholder="Rp ..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Status</label>
                <select
                  value={newBill.status}
                  onChange={(e) => setNewBill({ ...newBill, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                >
                  <option value="Belum Dibayar">Belum Dibayar</option>
                  <option value="Sudah Dibayar">Sudah Dibayar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={newBill.tanggal}
                  onChange={(e) => setNewBill({ ...newBill, tanggal: e.target.value })}
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
              <th className="px-4 py-2 text-left">Layanan</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{b.pasien}</td>
                <td className="px-4 py-2">{b.layanan}</td>
                <td className="px-4 py-2">{b.total}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    b.status === 'Sudah Dibayar'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-2">{b.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}