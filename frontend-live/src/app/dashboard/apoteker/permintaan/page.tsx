'use client'

const permintaan = [
  { tanggal: '2025-10-28', obat: 'Ibuprofen', jumlah: 50, status: 'Diproses' },
  { tanggal: '2025-10-27', obat: 'Cetirizine', jumlah: 30, status: 'Selesai' },
  { tanggal: '2025-10-26', obat: 'Paracetamol', jumlah: 100, status: 'Diproses' },
  { tanggal: '2025-10-25', obat: 'Amoxicillin', jumlah: 60, status: 'Ditolak' },
  { tanggal: '2025-10-24', obat: 'Omeprazole', jumlah: 40, status: 'Selesai' },
  { tanggal: '2025-10-23', obat: 'Metformin', jumlah: 70, status: 'Diproses' },
  { tanggal: '2025-10-22', obat: 'Simvastatin', jumlah: 25, status: 'Selesai' },
  { tanggal: '2025-10-21', obat: 'Amlodipine', jumlah: 35, status: 'Diproses' },
  { tanggal: '2025-10-20', obat: 'Ciprofloxacin', jumlah: 20, status: 'Ditolak' },
  { tanggal: '2025-10-19', obat: 'Lansoprazole', jumlah: 45, status: 'Selesai' },
]

export default function PermintaanObatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Permintaan Obat</h1>
      <table className="w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Tanggal</th>
            <th className="px-4 py-2 text-left">Obat</th>
            <th className="px-4 py-2 text-left">Jumlah</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {permintaan.map((row, i) => (
            <tr key={i} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{row.tanggal}</td>
              <td className="px-4 py-2">{row.obat}</td>
              <td className="px-4 py-2">{row.jumlah}</td>
              <td
                className={`px-4 py-2 font-medium ${
                  row.status === 'Selesai'
                    ? 'text-green-600 dark:text-green-400'
                    : row.status === 'Diproses'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}