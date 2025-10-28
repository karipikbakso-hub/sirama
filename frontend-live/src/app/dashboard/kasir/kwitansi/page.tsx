'use client'

const receipts = [
  { nomor: 'KW-001', pasien: 'Dewi', total: 'Rp 250.000', metode: 'Tunai', tanggal: '2025-10-25' },
  { nomor: 'KW-002', pasien: 'Budi', total: 'Rp 180.000', metode: 'Transfer', tanggal: '2025-10-24' },
  // ...
]

export default function KwitansiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🧾 Kwitansi</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar kwitansi yang telah dicetak dan diserahkan.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Nomor</th>
              <th>Pasien</th>
              <th>Total</th>
              <th>Metode</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{r.nomor}</td>
                <td>{r.pasien}</td>
                <td>{r.total}</td>
                <td>{r.metode}</td>
                <td>{r.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}