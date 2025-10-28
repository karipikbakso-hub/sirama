'use client'

const sdm = [
  { nama: 'Dewi', jabatan: 'Perawat', status: 'Hadir', shift: 'Pagi', unit: 'Rawat Inap' },
  { nama: 'Budi', jabatan: 'Dokter Umum', status: 'Hadir', shift: 'Sore', unit: 'Poli Umum' },
  { nama: 'Siti', jabatan: 'Kasir', status: 'Izin', shift: '-', unit: 'Kasir' },
  { nama: 'Agus', jabatan: 'Admin Sistem', status: 'Hadir', shift: 'Pagi', unit: 'Manajemen' },
  { nama: 'Lina', jabatan: 'Apoteker', status: 'Hadir', shift: 'Pagi', unit: 'Farmasi' },
  { nama: 'Joko', jabatan: 'Radiografer', status: 'Sakit', shift: '-', unit: 'Radiologi' },
  { nama: 'Rina', jabatan: 'Analis Lab', status: 'Hadir', shift: 'Sore', unit: 'Laboratorium' },
  { nama: 'Tono', jabatan: 'Dokter Spesialis', status: 'Hadir', shift: 'Pagi', unit: 'Poli Dalam' },
]

export default function SDMPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">👥 SDM & Kehadiran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Rekap kehadiran dan distribusi tenaga kerja per unit.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Nama</th>
              <th>Jabatan</th>
              <th>Unit</th>
              <th>Shift</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sdm.map((s, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{s.nama}</td>
                <td>{s.jabatan}</td>
                <td>{s.unit}</td>
                <td>{s.shift}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    s.status === 'Hadir'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : s.status === 'Izin'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}