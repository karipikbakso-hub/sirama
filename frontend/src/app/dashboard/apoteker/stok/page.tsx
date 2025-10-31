'use client'

import { useState } from 'react'
import { FiPrinter } from 'react-icons/fi'

type Obat = {
  nama: string
  jumlah: number
  satuan: string
  bentuk: string
  kategori: string
  kadaluarsa: string
}

const stok: Obat[] = [
  { nama: 'Paracetamol', jumlah: 1200, satuan: 'tablet', bentuk: 'Solid', kategori: 'Analgesik', kadaluarsa: '2026-03-15' },
  { nama: 'Amoxicillin', jumlah: 850, satuan: 'kapsul', bentuk: 'Solid', kategori: 'Antibiotik', kadaluarsa: '2025-12-01' },
  { nama: 'Omeprazole', jumlah: 600, satuan: 'kapsul', bentuk: 'Solid', kategori: 'Antasida', kadaluarsa: '2026-06-30' },
  { nama: 'Cetirizine', jumlah: 400, satuan: 'tablet', bentuk: 'Solid', kategori: 'Antihistamin', kadaluarsa: '2025-11-10' },
  { nama: 'Ibuprofen', jumlah: 950, satuan: 'tablet', bentuk: 'Solid', kategori: 'Anti-inflamasi', kadaluarsa: '2026-01-20' },
  { nama: 'Metformin', jumlah: 720, satuan: 'tablet', bentuk: 'Solid', kategori: 'Antidiabetik', kadaluarsa: '2025-09-05' },
  { nama: 'Simvastatin', jumlah: 500, satuan: 'tablet', bentuk: 'Solid', kategori: 'Hipolipidemik', kadaluarsa: '2026-04-12' },
  { nama: 'Amlodipine', jumlah: 630, satuan: 'tablet', bentuk: 'Solid', kategori: 'Antihipertensi', kadaluarsa: '2026-02-28' },
  { nama: 'Ciprofloxacin', jumlah: 300, satuan: 'kapsul', bentuk: 'Solid', kategori: 'Antibiotik', kadaluarsa: '2025-10-18' },
  { nama: 'Lansoprazole', jumlah: 450, satuan: 'kapsul', bentuk: 'Solid', kategori: 'Antasida', kadaluarsa: '2026-05-07' },
]

export default function StokGudangPage() {
  const [threshold] = useState(500)

  const handleCetak = () => {
    console.log('🖨️ Cetak laporan stok gudang:', stok)
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📦 Stok Gudang</h1>
        <button
          onClick={handleCetak}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FiPrinter />
          Cetak Laporan
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar ketersediaan obat di gudang farmasi. Obat dengan stok &lt; {threshold} ditandai sebagai stok rendah.
      </p>

      <div className="overflow-x-auto border rounded shadow">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Nama Obat</th>
              <th className="px-4 py-3 text-left">Jumlah</th>
              <th className="px-4 py-3 text-left">Satuan</th>
              <th className="px-4 py-3 text-left">Bentuk</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-left">Kadaluarsa</th>
            </tr>
          </thead>
          <tbody>
            {stok.map((item, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{item.nama}</td>
                <td className={`px-4 py-2 font-medium ${
                  item.jumlah < threshold
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {item.jumlah}
                </td>
                <td className="px-4 py-2">{item.satuan}</td>
                <td className="px-4 py-2">{item.bentuk}</td>
                <td className="px-4 py-2">{item.kategori}</td>
                <td className="px-4 py-2">{item.kadaluarsa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}