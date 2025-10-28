'use client'

const bpjs = [
  { pasien: 'Dewi', nomor: '0001234567890', faskes: 'Puskesmas Mlati', status: 'Aktif' },
  { pasien: 'Budi', nomor: '0009876543210', faskes: 'RSUD Sleman', status: 'Nonaktif' },
  // ...
]

export default function BPJSPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🪪 Data BPJS</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Informasi peserta BPJS dan status kepesertaan.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Nomor BPJS</th>
              <th>Faskes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bpjs.map((b, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{b.pasien}</td>
                <td>{b.nomor}</td>
                <td>{b.faskes}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}