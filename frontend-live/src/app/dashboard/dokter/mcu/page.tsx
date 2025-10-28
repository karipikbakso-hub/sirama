'use client'

const data = [
  { pasien: 'Dewi', jenis: 'MCU Karyawan', hasil: 'Normal', tanggal: '2025-10-20' },
  { pasien: 'Budi', jenis: 'MCU Pra Nikah', hasil: 'Anemia ringan', tanggal: '2025-10-19' },
  // ...
]

export default function MCUPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧪 Medical Check Up</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Hasil pemeriksaan MCU pasien.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Jenis MCU</th>
              <th>Hasil</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{d.pasien}</td>
                <td>{d.jenis}</td>
                <td>{d.hasil}</td>
                <td>{d.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}