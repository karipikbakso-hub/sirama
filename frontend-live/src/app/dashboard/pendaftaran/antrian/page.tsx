'use client'

const antrian = [
  { nomor: 'A001', pasien: 'Dewi', poli: 'Umum', status: 'Menunggu', waktu: '08:00' },
  { nomor: 'A002', pasien: 'Budi', poli: 'Dalam', status: 'Dipanggil', waktu: '08:15' },
  { nomor: 'A003', pasien: 'Siti', poli: 'Gigi', status: 'Selesai', waktu: '08:30' },
  // ...
]

export default function AntrianPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧾 Antrian Pasien</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar antrian aktif dan statusnya.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Nomor</th>
              <th>Pasien</th>
              <th>Poli</th>
              <th>Status</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {antrian.map((a, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{a.nomor}</td>
                <td>{a.pasien}</td>
                <td>{a.poli}</td>
                <td>{a.status}</td>
                <td>{a.waktu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}