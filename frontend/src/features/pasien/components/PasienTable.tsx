import { Pasien } from '../types'

export default function PasienTable({ data }: { data: Pasien[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-left">NIK</th>
            <th className="p-2 text-left">Umur</th>
            <th className="p-2 text-left">Keluhan</th>
            <th className="p-2 text-left">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.nama}</td>
              <td className="p-2">{p.nik}</td>
              <td className="p-2">{p.umur}</td>
              <td className="p-2">{p.keluhan}</td>
              <td className="p-2 text-sm text-gray-500">{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
