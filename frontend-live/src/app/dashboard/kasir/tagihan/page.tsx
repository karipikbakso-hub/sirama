'use client'

const cetakan = [
  { pasien: 'Dewi', tagihan: 'Rawat Jalan', total: 'Rp 250.000', status: 'Dicetak', tanggal: '2025-10-25' },
  { pasien: 'Budi', tagihan: 'Laboratorium', total: 'Rp 180.000', status: 'Dicetak', tanggal: '2025-10-24' },
  { pasien: 'Siti', tagihan: 'MCU Karyawan', total: 'Rp 300.000', status: 'Belum Dicetak', tanggal: '2025-10-23' },
  { pasien: 'Agus', tagihan: 'Rawat Inap', total: 'Rp 1.200.000', status: 'Dicetak', tanggal: '2025-10-22' },
  { pasien: 'Lina', tagihan: 'Farmasi', total: 'Rp 95.000', status: 'Belum Dicetak', tanggal: '2025-10-21' },
  { pasien: 'Joko', tagihan: 'Radiologi', total: 'Rp 450.000', status: 'Dicetak', tanggal: '2025-10-20' },
  { pasien: 'Rina', tagihan: 'Konsultasi Dokter', total: 'Rp 150.000', status: 'Belum Dicetak', tanggal: '2025-10-19' },
]

export default function CetakTagihanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">🖨️ Cetak Tagihan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Daftar tagihan pasien yang siap dicetak atau sudah dicetak.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Pasien</th>
              <th>Jenis Tagihan</th>
              <th>Total</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {cetakan.map((c, i) => (
              <tr key={i} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{c.pasien}</td>
                <td>{c.tagihan}</td>
                <td>{c.total}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.status === 'Dicetak'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
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