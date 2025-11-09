'use client'

const monitoring = [
  { pasien: 'Dewi', observasi: 'Mual ringan, diberikan antiemetik', waktu: '08:00', perawat: 'Lina' },
  { pasien: 'Budi', observasi: 'Keluhan nyeri, diberikan analgesik', waktu: '09:15', perawat: 'Agus' },
  { pasien: 'Siti', observasi: 'Demam, kompres hangat dilakukan', waktu: '10:30', perawat: 'Rina' },
]

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">👀 Monitoring Observasi</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Catatan observasi dan tindakan keperawatan.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Observasi</th>
              <th>Waktu</th>
              <th>Perawat</th>
            </tr>
          </thead>
          <tbody>
            {monitoring.map((m, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{m.pasien}</td>
                <td>{m.observasi}</td>
                <td>{m.waktu}</td>
                <td>{m.perawat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}