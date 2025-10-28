'use client'

const data = [
  { pasien: 'Dewi', ringkasan: 'ISPA ringan, istirahat', dokter: 'dr. Andi', tanggal: '2025-10-25' },
  { pasien: 'Budi', ringkasan: 'Gastritis, edukasi diet', dokter: 'dr. Rina', tanggal: '2025-10-24' },
  // ...
]

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📄 Resume Medis</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan hasil pemeriksaan dan terapi pasien.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Ringkasan</th>
              <th>Dokter</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{d.pasien}</td>
                <td>{d.ringkasan}</td>
                <td>{d.dokter}</td>
                <td>{d.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}