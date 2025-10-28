'use client'

const income = [
  { sumber: 'Rawat Jalan', total: 'Rp 45.000.000', periode: 'Oktober 2025' },
  { sumber: 'Farmasi', total: 'Rp 28.500.000', periode: 'Oktober 2025' },
  { sumber: 'Laboratorium', total: 'Rp 18.000.000', periode: 'Oktober 2025' },
  { sumber: 'Radiologi', total: 'Rp 12.000.000', periode: 'Oktober 2025' },
]

export default function PendapatanPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💰 Pendapatan & Keuangan</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Rekap pendapatan per modul dan periode.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2">Sumber</th>
              <th>Total</th>
              <th>Periode</th>
            </tr>
          </thead>
          <tbody>
            {income.map((i, idx) => (
              <tr key={idx} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">{i.sumber}</td>
                <td>{i.total}</td>
                <td>{i.periode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}