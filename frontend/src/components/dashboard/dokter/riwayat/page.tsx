'use client'

import { useState } from 'react'
import { FiCalendar, FiFileText, FiPrinter } from 'react-icons/fi'

type Riwayat = {
  pasien: string
  kunjungan: string
  tanggal: string
  status: string
}

const initialData: Riwayat[] = [
  { pasien: 'Dewi', kunjungan: 'Poli Umum', tanggal: '2025-10-25', status: 'Selesai' },
  { pasien: 'Budi', kunjungan: 'Poli Dalam', tanggal: '2025-10-24', status: 'Selesai' },
]

const formatTanggal = (tanggal: string) => {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function RiwayatPage() {
  const [data] = useState(initialData)

  const handleLihatResume = (index: number) => {
    console.log('📄 Lihat resume medis:', data[index])
    // Integrasi resume bisa ditambahkan di sini
  }

  const handleCetak = (index: number) => {
    console.log('🖨️ Cetak riwayat kunjungan:', data[index])
    // Integrasi cetak bisa ditambahkan di sini
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📜 Riwayat Kunjungan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar kunjungan pasien ke fasilitas kesehatan.
      </p>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Poli</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{d.pasien}</td>
                <td className="px-4 py-2">{d.kunjungan}</td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  {formatTanggal(d.tanggal)}
                </td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-3 items-center">
                  <FiFileText
                    onClick={() => handleLihatResume(i)}
                    className="text-gray-500 hover:text-purple-600 cursor-pointer text-lg"
                    title="Lihat Resume Medis"
                  />
                  <FiPrinter
                    onClick={() => handleCetak(i)}
                    className="text-gray-500 hover:text-blue-600 cursor-pointer text-lg"
                    title="Cetak Riwayat"
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