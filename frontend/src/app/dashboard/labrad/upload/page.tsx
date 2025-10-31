'use client'

import { useState } from 'react'
import { FiUpload, FiCalendar } from 'react-icons/fi'

type HasilUpload = {
  pasien: string
  jenis: string
  file: string
  tanggal: string
}

const initialUploads: HasilUpload[] = [
  { pasien: 'Budi', jenis: 'Kimia Darah', file: 'kimia-budi.pdf', tanggal: '2025-10-25' },
  { pasien: 'Agus', jenis: 'USG Abdomen', file: 'usg-agus.jpg', tanggal: '2025-10-24' },
  { pasien: 'Siti', jenis: 'Rontgen Thorax', file: 'rontgen-siti.pdf', tanggal: '2025-10-23' },
  { pasien: 'Lina', jenis: 'Tes Kolesterol', file: 'kolesterol-lina.pdf', tanggal: '2025-10-22' },
  { pasien: 'Joko', jenis: 'Tes Gula Darah', file: 'gula-joko.pdf', tanggal: '2025-10-21' },
  { pasien: 'Rina', jenis: 'Tes Elektrolit', file: 'elektrolit-rina.pdf', tanggal: '2025-10-20' },
  { pasien: 'Tono', jenis: 'Tes HBsAg', file: 'hbsag-tono.pdf', tanggal: '2025-10-19' },
]

const formatTanggal = (tanggal: string) => {
  const date = new Date(tanggal)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function UploadHasilPage() {
  const [uploads, setUploads] = useState(initialUploads)
  const [showModal, setShowModal] = useState(false)
  const [newFile, setNewFile] = useState('')
  const [newPasien, setNewPasien] = useState('')
  const [newJenis, setNewJenis] = useState('')

  const handleUpload = () => {
    if (!newFile || !newPasien || !newJenis) return
    const newEntry: HasilUpload = {
      pasien: newPasien,
      jenis: newJenis,
      file: newFile,
      tanggal: new Date().toISOString().split('T')[0],
    }
    setUploads([newEntry, ...uploads])
    setShowModal(false)
    setNewFile('')
    setNewPasien('')
    setNewJenis('')
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📤 Upload Hasil Pemeriksaan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar hasil laboratorium dan radiologi yang telah diunggah ke sistem.
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        title="Upload Hasil Baru"
      >
        <FiUpload className="text-lg" />
        Upload Hasil
      </button>

      {/* Modal Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Hasil Pemeriksaan</h3>
            <input
              type="text"
              placeholder="Nama Pasien"
              value={newPasien}
              onChange={(e) => setNewPasien(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Jenis Pemeriksaan"
              value={newJenis}
              onChange={(e) => setNewJenis(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Nama File (contoh: hasil-budi.pdf)"
              value={newFile}
              onChange={(e) => setNewFile(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowModal(false)}
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

      <div className="overflow-x-auto border rounded shadow mt-4">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Pasien</th>
              <th className="px-4 py-2 text-left">Jenis Pemeriksaan</th>
              <th className="px-4 py-2 text-left">File</th>
              <th className="px-4 py-2 text-left">Tanggal Upload</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{u.pasien}</td>
                <td className="px-4 py-2">{u.jenis}</td>
                <td className="px-4 py-2">
                  <a
                    href="#"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                    title={`Lihat ${u.file}`}
                  >
                    {u.file}
                  </a>
                </td>
                <td className="px-4 py-2 inline-flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  {formatTanggal(u.tanggal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}