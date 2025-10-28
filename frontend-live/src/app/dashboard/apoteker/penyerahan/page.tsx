'use client'

const data = [
  { pasien: 'Rina', obat: 'Paracetamol', status: 'Diserahkan' },
  { pasien: 'Budi', obat: 'Amoxicillin', status: 'Menunggu' },
  { pasien: 'Siti', obat: 'Omeprazole', status: 'Diserahkan' },
  { pasien: 'Andi', obat: 'Cetirizine', status: 'Menunggu' },
  { pasien: 'Dewi', obat: 'Ibuprofen', status: 'Diserahkan' },
  { pasien: 'Tono', obat: 'Metformin', status: 'Menunggu' },
  { pasien: 'Lina', obat: 'Simvastatin', status: 'Diserahkan' },
  { pasien: 'Agus', obat: 'Amlodipine', status: 'Menunggu' },
  { pasien: 'Maya', obat: 'Omeprazole', status: 'Diserahkan' },
  { pasien: 'Joko', obat: 'Paracetamol', status: 'Menunggu' },
]

export default function PenyerahanObatPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Penyerahan Obat</h1>
      <table className="w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Pasien</th>
            <th className="px-4 py-2 text-left">Obat</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{row.pasien}</td>
              <td className="px-4 py-2">{row.obat}</td>
              <td
                className={`px-4 py-2 font-medium ${
                  row.status === 'Diserahkan'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
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