'use client'

import { useState } from 'react'

type Property = {
  id: number
  nama: string
  lokasi: string
  pemilik: string
  status: 'aktif' | 'nonaktif' | 'maintenance'
  tipe: string
  harga: number
}

export default function PropertyPage() {
  const [filter, setFilter] = useState<'semua' | 'aktif' | 'nonaktif' | 'maintenance'>('semua')
  const [items, setItems] = useState<Property[]>([
    { id: 1, nama: 'Ruko Malioboro', lokasi: 'Yogyakarta', pemilik: 'PT Jogja Properti', status: 'aktif', tipe: 'Ruko', harga: 125_000_000 },
    { id: 2, nama: 'Kost Mahasiswa', lokasi: 'Depok Sleman', pemilik: 'Bu Siti', status: 'nonaktif', tipe: 'Kost', harga: 35_000_000 },
    { id: 3, nama: 'Gudang Logistik', lokasi: 'Bantul', pemilik: 'CV Sumber Makmur', status: 'maintenance', tipe: 'Gudang', harga: 80_000_000 },
    { id: 4, nama: 'Apartemen Tugu', lokasi: 'Yogyakarta', pemilik: 'Pak Budi', status: 'aktif', tipe: 'Apartemen', harga: 150_000_000 },
    { id: 5, nama: 'Villa Kaliurang', lokasi: 'Sleman', pemilik: 'Ibu Rina', status: 'aktif', tipe: 'Villa', harga: 200_000_000 },
  ])

  const [editItem, setEditItem] = useState<Property | null>(null)
  const [deleteItem, setDeleteItem] = useState<Property | null>(null)

  const filtered = filter === 'semua' ? items : items.filter(p => p.status === filter)

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setItems(prev => prev.map(p => (p.id === editItem.id ? editItem : p)))
    setEditItem(null)
  }

  const handleDeleteConfirm = () => {
    if (!deleteItem) return
    setItems(prev => prev.filter(p => p.id !== deleteItem.id))
    setDeleteItem(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white transition">
        Manajemen Properti
      </h2>

      {/* Filter Status */}
      <div className="flex gap-3 flex-wrap">
        {['semua', 'aktif', 'nonaktif', 'maintenance'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabel Properti */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Nama</th>
              <th className="px-4 py-2 text-left">Lokasi</th>
              <th className="px-4 py-2 text-left">Pemilik</th>
              <th className="px-4 py-2 text-left">Tipe</th>
              <th className="px-4 py-2 text-left">Harga</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{p.nama}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{p.lokasi}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{p.pemilik}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{p.tipe}</td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Rp {p.harga.toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-2 capitalize text-gray-700 dark:text-gray-300">{p.status}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => setEditItem(p)}
                    className="px-3 py-1 text-xs rounded bg-yellow-500 text-white hover:scale-105 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteItem(p)}
                    className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:scale-105 transition"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Tidak ada properti dengan status <strong>{filter}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Edit Properti</h3>
            <input
              type="text"
              value={editItem.nama}
              onChange={e => setEditItem({ ...editItem, nama: e.target.value })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <input
              type="text"
              value={editItem.lokasi}
              onChange={e => setEditItem({ ...editItem, lokasi: e.target.value })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            <select
              value={editItem.status}
              onChange={e => setEditItem({ ...editItem, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="maintenance">Maintenance</option>
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

      {/* Modal Hapus */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Hapus Properti</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Yakin ingin menghapus <strong>{deleteItem.nama}</strong> dari daftar properti?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 text-sm rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:scale-105 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
