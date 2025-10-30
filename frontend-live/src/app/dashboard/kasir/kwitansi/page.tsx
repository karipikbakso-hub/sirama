'use client'

import { useState } from 'react'
import { FiPlus, FiPrinter, FiCopy } from 'react-icons/fi'

type Receipt = {
  nomor: string
  pasien: string
  total: string
  metode: string
  tanggal: string
}

const initialReceipts: Receipt[] = [
  { nomor: 'KW-001', pasien: 'Dewi', total: 'Rp 250.000', metode: 'Tunai', tanggal: '2025-10-25' },
  { nomor: 'KW-002', pasien: 'Budi', total: 'Rp 180.000', metode: 'Transfer', tanggal: '2025-10-24' },
]

export default function KwitansiPage() {
  const [receipts, setReceipts] = useState(initialReceipts)
  const [showForm, setShowForm] = useState(false)
  const [newReceipt, setNewReceipt] = useState<Receipt>({
    nomor: '',
    pasien: '',
    total: '',
    metode: '',
    tanggal: '',
  })

  const handleAdd = () => {
    if (Object.values(newReceipt).some((v) => v.trim() === '')) return
    setReceipts([...receipts, newReceipt])
    setNewReceipt({ nomor: '', pasien: '', total: '', metode: '', tanggal: '' })
    setShowForm(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handlePrint = (r: Receipt) => {
    console.log('Cetak kwitansi:', r)
    // Integrasi cetak PDF atau printer bisa ditambahkan di sini
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧾 Kwitansi</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar kwitansi yang telah dicetak dan diserahkan.</p>

      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FiPlus className="text-lg" />
        Buat Kwitansi
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Form Kwitansi Baru</h3>
            <div className="space-y-3">
              {Object.entries(newReceipt).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 capitalize">{key}</label>
                  <input
                    type={key === 'tanggal' ? 'date' : 'text'}
                    value={value}
                    onChange={(e) => setNewReceipt({ ...newReceipt, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                  />
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
              <th className="px-4 py-2 text-left">Nomor</th>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Metode</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2 flex items-center gap-2">
                  {r.nomor}
                  <FiCopy
                    onClick={() => handleCopy(r.nomor)}
                    className="text-gray-400 hover:text-blue-500 cursor-pointer"
                    title="Salin Nomor"
                  />
                </td>
                <td className="px-4 py-2">{r.pasien}</td>
                <td className="px-4 py-2">{r.total}</td>
                <td className="px-4 py-2">{r.metode}</td>
                <td className="px-4 py-2">{r.tanggal}</td>
                <td className="px-4 py-2">
                  <FiPrinter
                    onClick={() => handlePrint(r)}
                    className="text-gray-500 hover:text-green-600 cursor-pointer"
                    title="Cetak Kwitansi"
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