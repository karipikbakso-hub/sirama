'use client'

import { useState, useEffect } from 'react'

const dummyPasien = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  nama: ['Andi', 'Budi', 'Citra', 'Dewi', 'Eka'][i % 5],
  dokter: ['dr. Sari', 'dr. Rudi'][i % 2],
  keluhan: ['Demam', 'Batuk', 'Nyeri Kepala', 'Kontrol Diabetes'][i % 4],
  status: ['Menunggu', 'Sedang Diperiksa', 'Selesai'][i % 3],
  waktu: `2025-10-${(i % 30) + 1} 09:${(i % 60).toString().padStart(2, '0')}`,
}))

const statusColor = {
  Menunggu: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200',
  'Sedang Diperiksa': 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200',
  Selesai: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
}

export default function KlinikPage() {
  const [filterDokter, setFilterDokter] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [modalPasien, setModalPasien] = useState<any>(null)
  const [modalType, setModalType] = useState<'ubah' | 'periksa' | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Pastikan komponen hanya render di client untuk mencegah hydration mismatch
    setMounted(true)
  }, [])

  if (!mounted) return null

  const pasienFiltered = dummyPasien.filter(
    (p) =>
      (filterDokter === 'Semua' || p.dokter === filterDokter) &&
      (filterStatus === 'Semua' || p.status === filterStatus)
  )

  const openModal = (pasien: any, type: 'ubah' | 'periksa') => {
    setModalPasien(pasien)
    setModalType(type)
  }

  const closeModal = () => {
    setModalPasien(null)
    setModalType(null)
  }

  const handleCetak = (pasien: any) => {
    alert(`🖨️ Mencetak data pasien: ${pasien.nama}`)
  }

  const handleHapus = (pasien: any) => {
    if (window.confirm(`Yakin ingin menghapus data ${pasien.nama}?`)) {
      alert(`🗑️ Data ${pasien.nama} dihapus`)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">🏥 Klinik</h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filterDokter}
          onChange={(e) => setFilterDokter(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          <option>Semua</option>
          <option>dr. Sari</option>
          <option>dr. Rudi</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          <option>Semua</option>
          <option>Menunggu</option>
          <option>Sedang Diperiksa</option>
          <option>Selesai</option>
        </select>

        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          🔍 Filter
        </button>
      </div>

      {/* Tabel Pasien */}
      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 shadow">
        <table className="min-w-full text-sm text-left bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Nama</th>
              <th className="p-3 border-b">Dokter</th>
              <th className="p-3 border-b">Keluhan</th>
              <th className="p-3 border-b">Waktu</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pasienFiltered.map((p, i) => (
                <tr
                key={p.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                <td className="p-3 text-gray-700 dark:text-gray-300">{i + 1}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{p.nama}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{p.dokter}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{p.keluhan}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{p.waktu}</td>
                <td>
                    <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                        statusColor[p.status as keyof typeof statusColor] ??
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                    >
                    {p.status}
                    </span>
                </td>
                <td className="p-3 space-x-2">
                    <button
                    onClick={() => openModal(p, 'periksa')}
                    className="px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:scale-105 transition"
                    >
                    🔍 Periksa
                    </button>
                    <button
                    onClick={() => handleCetak(p)}
                    className="px-3 py-1 text-xs rounded bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:scale-105 transition"
                    >
                    🖨️ Cetak
                    </button>
                    <button
                    onClick={() => openModal(p, 'ubah')}
                    className="px-3 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 hover:scale-105 transition"
                    >
                    ✏️ Ubah
                    </button>
                    <button
                    onClick={() => handleHapus(p)}
                    className="px-3 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:scale-105 transition"
                    >
                    🗑️ Hapus
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalPasien && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {modalType === 'ubah' ? 'Ubah Data Pasien' : 'Detail Pemeriksaan'}
            </h3>

            {modalType === 'ubah' ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Nama</label>
                  <input
                    type="text"
                    defaultValue={modalPasien.nama}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Keluhan</label>
                  <input
                    type="text"
                    defaultValue={modalPasien.keluhan}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Nama:</strong> {modalPasien.nama}</p>
                <p><strong>Dokter:</strong> {modalPasien.dokter}</p>
                <p><strong>Keluhan:</strong> {modalPasien.keluhan}</p>
                <p><strong>Waktu:</strong> {modalPasien.waktu}</p>
                <p><strong>Status:</strong> {modalPasien.status}</p>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeModal}
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
