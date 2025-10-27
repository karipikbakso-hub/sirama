import { Transaksi } from '../types'

export default function KasirTable({ data }: { data: Transaksi[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-left">Layanan</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {data.map(t => (
            <tr key={t.id} className="border-t">
              <td className="p-2">{t.nama}</td>
              <td className="p-2">{t.layanan}</td>
              <td className="p-2">Rp {t.total.toLocaleString()}</td>
              <td className="p-2 text-sm text-gray-500">{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
