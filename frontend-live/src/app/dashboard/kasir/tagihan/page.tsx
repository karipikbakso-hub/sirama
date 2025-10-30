'use client'

import { useState } from 'react'
import { FiPlus, FiPrinter, FiCheck, FiCalendar } from 'react-icons/fi'

type Tagihan = {
  pasien: string
  tagihan: string
  total: string
  status: string
  tanggal: string
}

const initialCetakan: Tagihan[] = [
  { pasien: 'Dewi', tagihan: 'Rawat Jalan', total: 'Rp 250.000', status: 'Dicetak', tanggal: '2025-10-25' },
  { pasien: 'Budi', tagihan: 'Laboratorium', total: 'Rp 180.000', status: 'Dicetak', tanggal: '2025-10-24' },
  { pasien: 'Siti', tagihan: 'MCU Karyawan', total: 'Rp 300.000', status: 'Belum Dicetak', tanggal: '2025-10-23' },
  { pasien: 'Agus', tagihan: 'Rawat Inap', total: 'Rp 1.200.000', status: 'Dicetak', tanggal: '2025-10-22' },
  { pasien: 'Lina', tagihan: 'Farmasi', total: 'Rp 95.000', status: 'Belum Dicetak', tanggal: '2025-10-21' },
  { pasien: 'Joko', tagihan: 'Radiologi', total: 'Rp 450.000', status: 'Dicetak', tanggal: '2025-10-20' },
  { pasien: 'Rina', tagihan: 'Konsultasi Dokter', total: 'Rp 150.000', status: 'Belum Dicetak', tanggal: '2025-10-19' },
]

const formatTanggal = (tanggal: string) => {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function CetakTagihanPage() {
  const [cetakan, setCetakan] = useState(initialCetakan)
  const [showForm, setShowForm] = useState(false)
  const [newTagihan, setNewTagihan] = useState<Tagihan>({
    pasien: '',
    tagihan: '',
    total: '',
    status: 'Belum Dicetak',
    tanggal: '',
  })

  const handleAdd = () => {
    if (Object.values(newTagihan).some((v) => v.trim() === '')) return
    setCetakan([...cetakan, newTagihan])
    setNewTagihan({ pasien: '', tagihan: '', total: '', status: 'Belum Dicetak', tanggal: '' })
    setShowForm(false)
  }

  const handlePrint = (index: number) => {
    console.log('Cetak tagihan:', cetakan[index])
    // Integrasi cetak bisa ditambahkan di sini
  }

  const handleMarkPrinted = (index: number) => {
    const updated = [...cetakan]
    updated[index].status = 'Dicetak'
    setCetakan(updated)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🖨️ Cetak Tagihan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar tagihan pasien yang siap dicetak atau sudah dicetak.
      </p>

      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <FiPlus className="text-lg" />
        Tambah Tagihan
      </button>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Form Tagihan Baru</h3>
            <div className="space-y-3">
              {Object.entries(newTagihan).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 capitalize">{key}</label>
                  {key === 'status' ? (
                    <select
                      value={value}
                      onChange={(e) => setNewTagihan({ ...newTagihan, [key]: e.target.value })}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
                    >
                      <option value="Belum Dicetak">Belum Dicetak</option>
                      <option value="Dicetak">Dicetak</option>
                    </select>
                  ) : (
                    <input
                      type={key === 'tanggal' ? 'date' : 'text'}
                      value={value}
                      onChange={(e) => setNewTagihan({ ...newTagihan, [key]: e.target.value })}
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
                <th className="px-4 py-2 text-left">Jenis Tagihan</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
            </thead>
            <tbody>
            {cetakan.map((c, i) => (
                <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{c.pasien}</td>
                <td className="px-4 py-2">{c.tagihan}</td>
                <td className="px-4 py-2">{c.total}</td>
                <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.status === 'Dicetak'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                    {c.status}
                    </span>
                </td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    {formatTanggal(c.tanggal)}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  )
}