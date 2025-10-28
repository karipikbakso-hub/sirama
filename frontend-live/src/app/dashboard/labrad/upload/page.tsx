'use client'

const uploads = [
  { pasien: 'Budi', jenis: 'Kimia Darah', file: 'kimia-budi.pdf', tanggal: '2025-10-25' },
  { pasien: 'Agus', jenis: 'USG Abdomen', file: 'usg-agus.jpg', tanggal: '2025-10-24' },
  { pasien: 'Siti', jenis: 'Rontgen Thorax', file: 'rontgen-siti.pdf', tanggal: '2025-10-23' },
  { pasien: 'Lina', jenis: 'Tes Kolesterol', file: 'kolesterol-lina.pdf', tanggal: '2025-10-22' },
  { pasien: 'Joko', jenis: 'Tes Gula Darah', file: 'gula-joko.pdf', tanggal: '2025-10-21' },
  { pasien: 'Rina', jenis: 'Tes Elektrolit', file: 'elektrolit-rina.pdf', tanggal: '2025-10-20' },
  { pasien: 'Tono', jenis: 'Tes HBsAg', file: 'hbsag-tono.pdf', tanggal: '2025-10-19' },
]

export default function UploadHasilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📤 Upload Hasil Pemeriksaan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar hasil pemeriksaan yang telah diunggah ke sistem.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Jenis Pemeriksaan</th>
              <th>File</th>
              <th>Tanggal Upload</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{u.pasien}</td>
                <td>{u.jenis}</td>
                <td>
                  <a
                    href="#"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                    title={`Lihat ${u.file}`}
                  >
                    {u.file}
                  </a>
                </td>
                <td>{u.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}