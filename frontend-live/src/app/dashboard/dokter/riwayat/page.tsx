'use client'

const data = [
  { pasien: 'Dewi', kunjungan: 'Poli Umum', tanggal: '2025-10-25', status: 'Selesai' },
  { pasien: 'Budi', kunjungan: 'Poli Dalam', tanggal: '2025-10-24', status: 'Selesai' },
  // ...
]

export default function RiwayatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📜 Riwayat Kunjungan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar kunjungan pasien ke fasilitas kesehatan.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Poli</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{d.pasien}</td>
                <td>{d.kunjungan}</td>
                <td>{d.tanggal}</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}