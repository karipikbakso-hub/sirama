'use client'

const vital = [
  { pasien: 'Dewi', suhu: '36.8°C', nadi: '82 bpm', tekanan: '120/80', tanggal: '2025-10-25' },
  { pasien: 'Budi', suhu: '37.2°C', nadi: '88 bpm', tekanan: '130/85', tanggal: '2025-10-25' },
  { pasien: 'Siti', suhu: '38.0°C', nadi: '95 bpm', tekanan: '110/70', tanggal: '2025-10-25' },
]

export default function VitalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">❤️ Vital Sign</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Pencatatan tanda-tanda vital pasien hari ini.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Suhu</th>
              <th>Nadi</th>
              <th>Tekanan Darah</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {vital.map((v, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{v.pasien}</td>
                <td>{v.suhu}</td>
                <td>{v.nadi}</td>
                <td>{v.tekanan}</td>
                <td>{v.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}