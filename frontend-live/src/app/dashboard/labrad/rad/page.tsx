'use client'

const radOrders = [
  { pasien: 'Siti', jenis: 'Rontgen Thorax', status: 'Selesai', tanggal: '2025-10-25' },
  { pasien: 'Agus', jenis: 'USG Abdomen', status: 'Pending', tanggal: '2025-10-24' },
  // ...
]

export default function RadPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🩻 Pemeriksaan Radiologi</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar order radiologi dan status hasilnya.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Jenis Pemeriksaan</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {radOrders.map((r, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{r.pasien}</td>
                <td>{r.jenis}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    r.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}