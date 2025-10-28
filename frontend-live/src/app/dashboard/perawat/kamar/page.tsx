'use client'

const kamar = [
  { nomor: '101', kelas: 'VIP', pasien: 'Dewi', status: 'Terisi' },
  { nomor: '102', kelas: 'Kelas 1', pasien: 'Budi', status: 'Terisi' },
  { nomor: '103', kelas: 'Kelas 2', pasien: '-', status: 'Kosong' },
  { nomor: '104', kelas: 'Kelas 3', pasien: '-', status: 'Kosong' },
]

export default function KamarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🛏️ Kamar & Penempatan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Status kamar dan penempatan pasien.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Nomor</th>
              <th>Kelas</th>
              <th>Pasien</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {kamar.map((k, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{k.nomor}</td>
                <td>{k.kelas}</td>
                <td>{k.pasien}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    k.status === 'Terisi'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {k.status}
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