'use client'

import { useState } from 'react'

type Kursus = {
  id: number
  judul: string
  instruktur: string
  kategori: string
  status: 'Aktif' | 'Draft' | 'Arsip'
  peserta: number
  tanggal: string
}

export default function ElearningPage() {
  const [filter, setFilter] = useState<'Semua' | 'Aktif' | 'Draft' | 'Arsip'>('Semua')
  const [items, setItems] = useState<Kursus[]>([
    { id: 1, judul: 'Dasar Farmasi Klinik', instruktur: 'Dr. Sinta', kategori: 'Kesehatan', status: 'Aktif', peserta: 120, tanggal: '2025-10-01' },
    { id: 2, judul: 'Manajemen Laundry RS', instruktur: 'Budi Santoso', kategori: 'Operasional', status: 'Draft', peserta: 0, tanggal: '2025-10-15' },
    { id: 3, judul: 'Pelatihan Kasir Digital', instruktur: 'Lina Mardika', kategori: 'Keuangan', status: 'Aktif', peserta: 85, tanggal: '2025-09-20' },
    { id: 4, judul: 'Pengelolaan Properti RS', instruktur: 'Rudi Hartono', kategori: 'Manajemen', status: 'Arsip', peserta: 230, tanggal: '2025-08-10' },
    { id: 5, judul: 'Etika Klinik & Komunikasi', instruktur: 'Dr. Andi', kategori: 'Kesehatan', status: 'Aktif', peserta: 150, tanggal: '2025-10-25' },
  ])

  const [editItem, setEditItem] = useState<Kursus | null>(null)
  const [deleteItem, setDeleteItem] = useState<Kursus | null>(null)
  const [detailItem, setDetailItem] = useState<Kursus | null>(null)

  const filtered = filter === 'Semua' ? items : items.filter(k => k.status === filter)

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setItems(prev => prev.map(k => (k.id === editItem.id ? editItem : k)))
    setEditItem(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteItem) return
    setItems(prev => prev.filter(k => k.id !== deleteItem.id))
    setDeleteItem(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white transition">Modul eLearning</h2>

      {/* Filter Status */}
      <div className="flex gap-3 flex-wrap">
        {['Semua', 'Aktif', 'Draft', 'Arsip'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tabel Kursus */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Judul</th>
              <th className="px-4 py-2 text-left">Instruktur</th>
              <th className="px-4 py-2 text-left">Kategori</th>
              <th className="px-4 py-2 text-left">Peserta</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(k => (
              <tr
                key={k.id}
                className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{k.judul}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{k.instruktur}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{k.kategori}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{k.peserta}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{k.tanggal}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{k.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => setDetailItem(k)} className="px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:scale-105 transition">📄 Detail</button>
                  <button onClick={() => setEditItem(k)} className="px-3 py-1 text-xs rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 hover:scale-105 transition">✏️ Edit</button>
                  <button onClick={() => setDeleteItem(k)} className="px-3 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:scale-105 transition">🗑️ Hapus</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada kursus dengan status <strong>{filter}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Detail Kursus</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Judul:</strong> {detailItem.judul}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Instruktur:</strong> {detailItem.instruktur}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Kategori:</strong> {detailItem.kategori}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Peserta:</strong> {detailItem.peserta}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Tanggal:</strong> {detailItem.tanggal}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Status:</strong> {detailItem.status}</p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setDetailItem(null)} className="px-4 py-2 text-sm rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Kursus</h3>

            <input
              type="text"
              value={editItem.judul}
              onChange={e => setEditItem({ ...editItem, judul: e.target.value })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <input
              type="text"
              value={editItem.instruktur}
              onChange={e => setEditItem({ ...editItem, instruktur: e.target.value })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <input
              type="text"
              value={editItem.kategori}
              onChange={e => setEditItem({ ...editItem, kategori: e.target.value })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <input
              type="number"
              value={editItem.peserta}
              onChange={e => setEditItem({ ...editItem, peserta: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <input
              type="date"
              value={editItem.tanggal}
              onChange={e => setEditItem({ ...editItem, tanggal: e.target.value })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <select
              value={editItem.status}
              onChange={e => setEditItem({ ...editItem, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="Aktif">Aktif</option>
              <option value="Draft">Draft</option>
              <option value="Arsip">Arsip</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="px-4 py-2 text-sm rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:scale-105 transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
