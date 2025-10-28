'use client'

const labOrders = [
  { pasien: 'Dewi', jenis: 'Hematologi Lengkap', status: 'Selesai', tanggal: '2025-10-25' },
  { pasien: 'Budi', jenis: 'Kimia Darah', status: 'Pending', tanggal: '2025-10-24' },
  // ...
]

export default function LabPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧫 Pemeriksaan Laboratorium</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar order lab dan status hasilnya.</p>

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
            {labOrders.map((o, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{o.pasien}</td>
                <td>{o.jenis}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    o.status === 'Selesai'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td>{o.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}