'use client'

import { useState } from 'react'
import { FiCheck, FiPrinter, FiPlus } from 'react-icons/fi'

type Antrian = {
  nomor: string
  pasien: string
  poli: string
  status: 'Menunggu' | 'Dipanggil' | 'Selesai'
  waktu: string
}

export default function AntrianPage() {
  const [antrian, setAntrian] = useState<Antrian[]>([
    { nomor: 'A001', pasien: 'Dewi', poli: 'Umum', status: 'Menunggu', waktu: '08:00' },
    { nomor: 'A002', pasien: 'Budi', poli: 'Dalam', status: 'Dipanggil', waktu: '08:15' },
    { nomor: 'A003', pasien: 'Siti', poli: 'Gigi', status: 'Selesai', waktu: '08:30' },
  ])

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Antrian, 'nomor'>>({
    pasien: '',
    poli: '',
    status: 'Menunggu',
    waktu: '',
  })

  const handleTambah = () => {
    setForm({ pasien: '', poli: '', status: 'Menunggu', waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) })
    setShowForm(true)
  }

  const handleSave = () => {
    const nextNomor = `A${(antrian.length + 1).toString().padStart(3, '0')}`
    setAntrian(prev => [...prev, { nomor: nextNomor, ...form }])
    setShowForm(false)
  }

  const handleUbahStatus = (index: number, status: Antrian['status']) => {
    const updated = [...antrian]
    updated[index].status = status
    setAntrian(updated)
  }

  const handleCetak = (index: number) => {
    console.log('🖨️ Cetak slip antrian:', antrian[index])
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧾 Antrian Pasien</h1>
        <button
          onClick={handleTambah}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPlus />
          Tambah Antrian
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar antrian aktif dan statusnya.
      </p>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tambah Antrian</h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <input
                type="text"
                placeholder="Nama Pasien"
                value={form.pasien}
                onChange={e => setForm({ ...form, pasien: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Poli Tujuan"
                value={form.poli}
                onChange={e => setForm({ ...form, poli: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Waktu (contoh: 09:00)"
                value={form.waktu}
                onChange={e => setForm({ ...form, waktu: e.target.value })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              />
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as Antrian['status'] })}
                className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
              >
                <option value="Menunggu">Menunggu</option>
                <option value="Dipanggil">Dipanggil</option>
                <option value="Selesai">Selesai</option>
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
              <th className="px-4 py-2 text-left">Nomor</th>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Poli</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Waktu</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {antrian.map((a, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{a.nomor}</td>
                <td className="px-4 py-2">{a.pasien}</td>
                <td className="px-4 py-2">{a.poli}</td>
                <td className="px-4 py-2 font-medium">
                  <span className={`px-2 py-1 rounded text-xs ${
                    a.status === 'Menunggu'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : a.status === 'Dipanggil'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-2">{a.waktu}</td>
                <td className="px-4 py-2 flex gap-3 items-center">
                  <FiPrinter
                    onClick={() => handleCetak(i)}
                    className="text-gray-500 hover:text-blue-600 cursor-pointer text-lg"
                    title="Cetak Slip"
                  />
                  {a.status === 'Menunggu' && (
                    <FiCheck
                      onClick={() => handleUbahStatus(i, 'Dipanggil')}
                      className="text-gray-500 hover:text-green-600 cursor-pointer text-lg"
                      title="Tandai Dipanggil"
                    />
                  )}
                  {a.status === 'Dipanggil' && (
                    <FiCheck
                      onClick={() => handleUbahStatus(i, 'Selesai')}
                      className="text-gray-500 hover:text-green-600 cursor-pointer text-lg"
                      title="Tandai Selesai"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}