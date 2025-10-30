'use client'

import { useState } from 'react'
import { FiCheck, FiPrinter } from 'react-icons/fi'

type Obat = {
  pasien: string
  obat: string
  status: 'Menunggu' | 'Diserahkan'
}

const initialData: Obat[] = [
  { pasien: 'Rina', obat: 'Paracetamol', status: 'Diserahkan' },
  { pasien: 'Budi', obat: 'Amoxicillin', status: 'Menunggu' },
  { pasien: 'Siti', obat: 'Omeprazole', status: 'Diserahkan' },
  { pasien: 'Andi', obat: 'Cetirizine', status: 'Menunggu' },
  { pasien: 'Dewi', obat: 'Ibuprofen', status: 'Diserahkan' },
  { pasien: 'Tono', obat: 'Metformin', status: 'Menunggu' },
  { pasien: 'Lina', obat: 'Simvastatin', status: 'Diserahkan' },
  { pasien: 'Agus', obat: 'Amlodipine', status: 'Menunggu' },
  { pasien: 'Maya', obat: 'Omeprazole', status: 'Diserahkan' },
  { pasien: 'Joko', obat: 'Paracetamol', status: 'Menunggu' },
]

export default function PenyerahanObatPage() {
  const [data, setData] = useState(initialData)

  const handleSerahkan = (index: number) => {
    const updated = [...data]
    updated[index].status = 'Diserahkan'
    setData(updated)
  }

  const handleCetak = (index: number) => {
    console.log('🖨️ Cetak slip penyerahan:', data[index])
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💊 Penyerahan Obat</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar obat yang siap diserahkan kepada pasien.
      </p>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Obat</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{row.pasien}</td>
                <td className="px-4 py-2">{row.obat}</td>
                <td className="px-4 py-2 font-medium">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    row.status === 'Diserahkan'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
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
                  {row.status === 'Menunggu' && (
                    <FiCheck
                      onClick={() => handleSerahkan(i)}
                      className="text-gray-500 hover:text-green-600 cursor-pointer text-lg"
                      title="Tandai Diserahkan"
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