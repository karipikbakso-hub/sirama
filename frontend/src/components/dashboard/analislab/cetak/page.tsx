'use client'

import { useState } from 'react'
import { FiPrinter, FiCheck, FiCalendar } from 'react-icons/fi'

type Hasil = {
  pasien: string
  jenis: string
  status: 'Dicetak' | 'Belum Dicetak'
  tanggal: string
}

const initialCetak: Hasil[] = [
  { pasien: 'Dewi', jenis: 'Hematologi Lengkap', status: 'Dicetak', tanggal: '2025-10-25' },
  { pasien: 'Siti', jenis: 'Rontgen Thorax', status: 'Belum Dicetak', tanggal: '2025-10-24' },
]

const formatTanggal = (tanggal: string) => {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function CetakHasilPage() {
  const [cetak, setCetak] = useState(initialCetak)

  const handleCetak = (index: number) => {
    console.log('🖨️ Mencetak hasil:', cetak[index])
    // Integrasi cetak PDF atau printer bisa ditambahkan di sini
  }

  const handleTandaiDicetak = (index: number) => {
    const updated = [...cetak]
    updated[index].status = 'Dicetak'
    setCetak(updated)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🖨️ Cetak Hasil Pemeriksaan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar hasil pemeriksaan yang siap dicetak atau sudah dicetak.
      </p>

      <div className="overflow-x-auto border rounded shadow mt-4">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
                <th className="px-4 py-2 text-left">Pasien</th>
                <th className="px-4 py-2 text-left">Jenis Pemeriksaan</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tanggal</th>
                <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
            </thead>
            <tbody>
            {cetak.map((c, i) => (
                <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{c.pasien}</td>
                <td className="px-4 py-2">{c.jenis}</td>
                <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.status === 'Dicetak'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                    {c.status}
                    </span>
                </td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                    <FiCalendar className="text-gray-400" />
                    {formatTanggal(c.tanggal)}
                </td>
                <td className="px-4 py-2 flex gap-3 items-center">
                    <FiPrinter
                    onClick={() => handleCetak(i)}
                    className="text-gray-500 hover:text-blue-600 cursor-pointer text-lg"
                    title="Cetak Hasil"
                    />
                    {c.status === 'Belum Dicetak' && (
                    <FiCheck
                        onClick={() => handleTandaiDicetak(i)}
                        className="text-gray-500 hover:text-green-600 cursor-pointer text-lg"
                        title="Tandai Dicetak"
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