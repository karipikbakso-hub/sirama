'use client'

const reports = [
  { judul: 'Laporan Kunjungan Mingguan', tanggal: '2025-10-25', status: 'Selesai' },
  { judul: 'Laporan Keuangan Bulanan', tanggal: '2025-10-24', status: 'Pending' },
  { judul: 'Laporan Resep & Farmasi', tanggal: '2025-10-23', status: 'Selesai' },
  { judul: 'Laporan SDM & Kehadiran', tanggal: '2025-10-22', status: 'Selesai' },
]

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📄 Laporan Aktivitas</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar laporan operasional dan statusnya.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Judul</th>
              <th>Tanggal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{r.judul}</td>
                <td>{r.tanggal}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {r.status}
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