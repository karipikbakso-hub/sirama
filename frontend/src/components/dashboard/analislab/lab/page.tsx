'use client'

import { useState } from 'react'
import { FiCheck, FiPrinter, FiUpload, FiCalendar } from 'react-icons/fi'

type LabOrder = {
  pasien: string
  jenis: string
  status: 'Pending' | 'Selesai'
  tanggal: string
  hasil?: string
}

const initialLabOrders: LabOrder[] = [
  { pasien: 'Dewi', jenis: 'Hematologi Lengkap', status: 'Selesai', tanggal: '2025-10-25', hasil: 'hematologi-dewi.pdf' },
  { pasien: 'Budi', jenis: 'Kimia Darah', status: 'Pending', tanggal: '2025-10-24' },
]

const formatTanggal = (tanggal: string) => {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function LabPage() {
  const [labOrders, setLabOrders] = useState(initialLabOrders)
  const [uploadIndex, setUploadIndex] = useState<number | null>(null)
  const [fileName, setFileName] = useState('')

  const handleTandaiSelesai = (index: number) => {
    const updated = [...labOrders]
    updated[index].status = 'Selesai'
    setLabOrders(updated)
  }

  const handleCetak = (index: number) => {
    console.log('🖨️ Cetak permintaan lab:', labOrders[index])
  }

  const handleUpload = () => {
    if (uploadIndex === null || !fileName.trim()) return
    const updated = [...labOrders]
    updated[uploadIndex].hasil = fileName
    setLabOrders(updated)
    setUploadIndex(null)
    setFileName('')
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧫 Pemeriksaan Laboratorium</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar order lab dan status hasilnya.
      </p>

      {/* Modal Upload */}
      {uploadIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Hasil Pemeriksaan</h3>
            <input
              type="text"
              placeholder="Nama file hasil (contoh: hasil-budi.pdf)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setUploadIndex(null)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
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
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Jenis Pemeriksaan</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Hasil</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {labOrders.map((o, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{o.pasien}</td>
                <td className="px-4 py-2">{o.jenis}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    o.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  {formatTanggal(o.tanggal)}
                </td>
                <td className="px-4 py-2">
                  {o.hasil ? (
                    <a
                      href="#"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      title={`Lihat ${o.hasil}`}
                    >
                      {o.hasil}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Belum diupload</span>
                  )}
                </td>
                <td className="px-4 py-2 flex gap-3 items-center">
                  <FiPrinter
                    onClick={() => handleCetak(i)}
                    className="text-gray-500 hover:text-blue-600 cursor-pointer text-lg"
                    title="Cetak Permintaan"
                  />
                  {o.status === 'Pending' && (
                    <FiCheck
                      onClick={() => handleTandaiSelesai(i)}
                      className="text-gray-500 hover:text-green-600 cursor-pointer text-lg"
                      title="Tandai Selesai"
                    />
                  )}
                  {o.status === 'Selesai' && !o.hasil && (
                    <FiUpload
                      onClick={() => setUploadIndex(i)}
                      className="text-gray-500 hover:text-purple-600 cursor-pointer text-lg"
                      title="Upload Hasil"
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