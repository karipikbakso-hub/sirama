'use client'

const cetak = [
  { pasien: 'Dewi', jenis: 'Hematologi Lengkap', status: 'Dicetak', tanggal: '2025-10-25' },
  { pasien: 'Siti', jenis: 'Rontgen Thorax', status: 'Belum Dicetak', tanggal: '2025-10-24' },
  // ...
]

export default function CetakHasilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🖨️ Cetak Hasil Pemeriksaan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar hasil pemeriksaan yang siap dicetak.</p>

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
            {cetak.map((c, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{c.pasien}</td>
                <td>{c.jenis}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.status === 'Dicetak'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td>{c.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}