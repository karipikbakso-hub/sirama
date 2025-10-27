import { RekamMedis } from '../types'

export default function RekamMedisTable({ data }: { data: RekamMedis[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-left">Diagnosis</th>
            <th className="p-2 text-left">Tindakan</th>
            <th className="p-2 text-left">Dokter</th>
            <th className="p-2 text-left">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {data.map(rm => (
            <tr key={rm.id} className="border-t">
              <td className="p-2">{rm.nama}</td>
              <td className="p-2">{rm.diagnosis}</td>
              <td className="p-2">{rm.tindakan}</td>
              <td className="p-2">{rm.dokter}</td>
              <td className="p-2 text-sm text-gray-500">{new Date(rm.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
