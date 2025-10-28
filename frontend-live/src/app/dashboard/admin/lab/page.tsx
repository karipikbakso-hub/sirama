'use client'

import { useState } from 'react'

type Status = 'Menunggu' | 'Diproses' | 'Selesai'

const dummyLab = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  pasien: ['Andi', 'Budi', 'Citra', 'Dewi', 'Eka'][i % 5],
  dokter: ['dr. Sari', 'dr. Rudi'][i % 2],
  tes: ['Darah Lengkap', 'Urinalisis', 'Kolesterol', 'Gula Darah'][i % 4],
  status: ['Menunggu', 'Diproses', 'Selesai'][i % 3] as Status,
  tanggal: `2025-10-${(i % 30) + 1}`,
}))

const statusColor: Record<Status, string> = {
  Menunggu: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200',
  Diproses: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200',
  Selesai: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
}

export default function LabPage() {
  const [search, setSearch] = useState('')
  const [filterDokter, setFilterDokter] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterTanggal, setFilterTanggal] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const labFiltered = dummyLab.filter(
    (r) =>
      (filterDokter === 'Semua' || r.dokter === filterDokter) &&
      (filterStatus === 'Semua' || r.status === filterStatus) &&
      (filterTanggal === '' || r.tanggal === filterTanggal) &&
      (search === '' ||
        r.pasien.toLowerCase().includes(search.toLowerCase()) ||
        r.dokter.toLowerCase().includes(search.toLowerCase()) ||
        r.tes.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(labFiltered.length / perPage)
  const paginated = labFiltered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">🧪 Laboratorium</h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Cari pasien, dokter, tes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 w-full md:w-64 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        />
        <input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        />
        <select
          value={filterDokter}
          onChange={(e) => setFilterDokter(e.target.value)}
          className="appearance-none px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          <option>Semua</option>
          <option>dr. Sari</option>
          <option>dr. Rudi</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="appearance-none px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          <option>Semua</option>
          <option>Menunggu</option>
          <option>Diproses</option>
          <option>Selesai</option>
        </select>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value))
            setPage(1)
          }}
          className="appearance-none px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200"
        >
          <option value={10}>10 / halaman</option>
          <option value={25}>25 / halaman</option>
          <option value={50}>50 / halaman</option>
        </select>
      </div>

      {/* Pagination Atas */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={labFiltered.length}
        perPage={perPage}
        onPageChange={setPage}
        label="permintaan"
      />

      {/* Tabel */}
      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 shadow">
        <table className="min-w-full text-sm text-left bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Pasien</th>
              <th className="p-3 border-b">Dokter</th>
              <th className="p-3 border-b">Tes</th>
              <th className="p-3 border-b">Tanggal</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, i) => (
              <tr
                key={r.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="p-3 text-gray-700 dark:text-gray-300">
                  {(page - 1) * perPage + i + 1}
                </td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{r.pasien}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{r.dokter}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{r.tes}</td>
                <td className="p-3 text-gray-700 dark:text-gray-300">{r.tanggal}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      statusColor[r.status as keyof typeof statusColor] ??
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button className="text-blue-600 dark:text-blue-400 text-xs">🔍 Detail</button>
                  <button className="text-green-600 dark:text-green-400 text-xs">✅ Selesaikan</button>
                  <button className="text-red-600 dark:text-red-400 text-xs">🗑️ Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bawah */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={labFiltered.length}
        perPage={perPage}
        onPageChange={setPage}
        label="permintaan"
      />
    </div>
  )
}

function PaginationBar({
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  label = 'data',
}: {
  page: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (p: number) => void
  label?: string
}) {
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, totalItems)

  return (
    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 py-2">
      <span>
        Menampilkan {start}–{end} dari {totalItems} {label}
      </span>
      <div className="space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          ← Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Selanjutnya →
        </button>
      </div>
    </div>
  )
}