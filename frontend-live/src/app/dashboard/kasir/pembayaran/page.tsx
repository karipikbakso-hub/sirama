'use client'

import { useState } from 'react'
import { FiPlus, FiCalendar, FiCreditCard } from 'react-icons/fi'

type Payment = {
  pasien: string
  total: string
  metode: string
  tanggal: string
}

const initialHistory: Payment[] = [
  { pasien: 'Dewi', total: 'Rp 250.000', metode: 'Tunai', tanggal: '2025-10-25' },
  { pasien: 'Budi', total: 'Rp 180.000', metode: 'Transfer', tanggal: '2025-10-24' },
]

const formatTanggal = (tanggal: string) => {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RiwayatPembayaranPage() {
  const [history, setHistory] = useState(initialHistory)
  const [showForm, setShowForm] = useState(false)
  const [newPayment, setNewPayment] = useState<Payment>({
    pasien: '',
    total: '',
    metode: '',
    tanggal: '',
  })

  const handleAdd = () => {
    if (Object.values(newPayment).some((v) => v.trim() === '')) return
    setHistory([...history, newPayment])
    setNewPayment({ pasien: '', total: '', metode: '', tanggal: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📜 Riwayat Pembayaran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Transaksi pembayaran yang telah dilakukan oleh pasien.
      </p>

      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FiPlus className="text-lg" />
        Tambah Riwayat Pembayaran
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Form Pembayaran Baru</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Pasien</label>
                <input
                  value={newPayment.pasien}
                  onChange={(e) => setNewPayment({ ...newPayment, pasien: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Total</label>
                <input
                  value={newPayment.total}
                  onChange={(e) => setNewPayment({ ...newPayment, total: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                  placeholder="Rp ..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Metode</label>
                <select
                  value={newPayment.metode}
                  onChange={(e) => setNewPayment({ ...newPayment, metode: e.target.value })}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Pilih Metode</option>
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={newPayment.tanggal}
                  onChange={(e) => setNewPayment({ ...newPayment, tanggal: e.target.value })}
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
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Metode</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{h.pasien}</td>
                <td className="px-4 py-2">{h.total}</td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                  <FiCreditCard className="text-gray-400" />
                  {h.metode}
                </td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  {formatTanggal(h.tanggal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}