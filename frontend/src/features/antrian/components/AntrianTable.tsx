import { Antrian } from '../types'

export default function AntrianTable({ data }: { data: Antrian[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-left">Poli</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {data.map(a => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.nama}</td>
              <td className="p-2">{a.poli}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-white text-sm ${
                    a.status === 'menunggu'
                      ? 'bg-yellow-500'
                      : a.status === 'dipanggil'
                      ? 'bg-blue-500'
                      : 'bg-green-600'
                  }`}
                >
                  {a.status}
                </span>
              </td>
              <td className="p-2 text-sm text-gray-500">{new Date(a.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
