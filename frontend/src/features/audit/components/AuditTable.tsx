import { AuditLog } from '../types'

export default function AuditTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Aksi</th>
            <th className="p-2 text-left">Modul</th>
            <th className="p-2 text-left">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-t">
              <td className="p-2">{log.user}</td>
              <td className="p-2">{log.action}</td>
              <td className="p-2">{log.module}</td>
              <td className="p-2 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
