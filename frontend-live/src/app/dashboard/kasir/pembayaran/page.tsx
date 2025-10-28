'use client'

const history = [
  { pasien: 'Dewi', total: 'Rp 250.000', metode: 'Tunai', tanggal: '2025-10-25' },
  { pasien: 'Budi', total: 'Rp 180.000', metode: 'Transfer', tanggal: '2025-10-24' },
  // ...
]

export default function RiwayatPembayaranPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">📜 Riwayat Pembayaran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Transaksi pembayaran yang telah dilakukan oleh pasien.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Total</th>
              <th>Metode</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{h.pasien}</td>
                <td>{h.total}</td>
                <td>{h.metode}</td>
                <td>{h.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}