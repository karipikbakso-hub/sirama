'use client'

const bills = [
  { pasien: 'Dewi', layanan: 'Rawat Jalan', total: 'Rp 250.000', status: 'Belum Dibayar', tanggal: '2025-10-25' },
  { pasien: 'Budi', layanan: 'Laboratorium', total: 'Rp 180.000', status: 'Sudah Dibayar', tanggal: '2025-10-24' },
  // ...
]

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💳 Billing & Pembayaran</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Daftar tagihan pasien dan status pembayarannya.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Layanan</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{b.pasien}</td>
                <td>{b.layanan}</td>
                <td>{b.total}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    b.status === 'Sudah Dibayar'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td>{b.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}