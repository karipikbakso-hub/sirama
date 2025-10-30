'use client'

import { useState } from 'react'
import { FiCheck, FiX, FiPrinter } from 'react-icons/fi'

type Permintaan = {
  tanggal: string
  obat: string
  jumlah: number
  status: 'Diproses' | 'Selesai' | 'Ditolak'
}

const initialData: Permintaan[] = [
  { tanggal: '2025-10-28', obat: 'Ibuprofen', jumlah: 50, status: 'Diproses' },
  { tanggal: '2025-10-27', obat: 'Cetirizine', jumlah: 30, status: 'Selesai' },
  { tanggal: '2025-10-26', obat: 'Paracetamol', jumlah: 100, status: 'Diproses' },
  { tanggal: '2025-10-25', obat: 'Amoxicillin', jumlah: 60, status: 'Ditolak' },
  { tanggal: '2025-10-24', obat: 'Omeprazole', jumlah: 40, status: 'Selesai' },
  { tanggal: '2025-10-23', obat: 'Metformin', jumlah: 70, status: 'Diproses' },
  { tanggal: '2025-10-22', obat: 'Simvastatin', jumlah: 25, status: 'Selesai' },
  { tanggal: '2025-10-21', obat: 'Amlodipine', jumlah: 35, status: 'Diproses' },
  { tanggal: '2025-10-20', obat: 'Ciprofloxacin', jumlah: 20, status: 'Ditolak' },
  { tanggal: '2025-10-19', obat: 'Lansoprazole', jumlah: 45, status: 'Selesai' },
]

export default function PermintaanObatPage() {
  const [permintaan, setPermintaan] = useState(initialData)

  const handleUbahStatus = (index: number, status: Permintaan['status']) => {
    const updated = [...permintaan]
    updated[index].status = status
    setPermintaan(updated)
  }

  const handleCetak = (index: number) => {
    console.log('🖨️ Cetak slip permintaan:', permintaan[index])
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📦 Permintaan Obat</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar permintaan obat dari unit layanan ke instalasi farmasi.
      </p>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Obat</th>
              <th className="px-4 py-2 text-left">Jumlah</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {permintaan.map((row, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{row.tanggal}</td>
                <td className="px-4 py-2">{row.obat}</td>
                <td className="px-4 py-2">{row.jumlah}</td>
                <td className="px-4 py-2 font-medium">
                  <span className={`px-2 py-1 rounded text-xs ${
                    row.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : row.status === 'Diproses'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-3 items-center">
                  <FiPrinter
                    onClick={() => handleCetak(i)}
                    className="text-gray-500 hover:text-blue-600 cursor-pointer text-lg"
                    title="Cetak Slip"
                  />
                  {row.status === 'Diproses' && (
                    <>
                      <FiCheck
                        onClick={() => handleUbahStatus(i, 'Selesai')}
                        className="text-gray-500 hover:text-green-600 cursor-pointer text-lg"
                        title="Tandai Selesai"
                      />
                      <FiX
                        onClick={() => handleUbahStatus(i, 'Ditolak')}
                        className="text-gray-500 hover:text-red-600 cursor-pointer text-lg"
                        title="Tolak Permintaan"
                      />
                    </>
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