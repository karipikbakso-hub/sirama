'use client'

const modules = [
  { nama: 'Rawat Inap', status: 'Aktif', uptime: '99.8%', transaksi: 128 },
  { nama: 'Farmasi', status: 'Aktif', uptime: '99.9%', transaksi: 342 },
  { nama: 'Kasir', status: 'Aktif', uptime: '99.7%', transaksi: 210 },
  { nama: 'Radiologi', status: 'Aktif', uptime: '99.6%', transaksi: 87 },
]

export default function KinerjaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📈 Kinerja Modul</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Status dan performa tiap modul sistem.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Modul</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>Transaksi</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{m.nama}</td>
                <td>{m.status}</td>
                <td>{m.uptime}</td>
                <td>{m.transaksi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}