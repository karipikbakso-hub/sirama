'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const logs = [
    { id: 1, action: 'Login', user: 'admin', time: '2025-11-05 09:22', status: 'Success' },
    { id: 2, action: 'Update Patient Record', user: 'dokter', time: '2025-11-05 09:31', status: 'Updated' },
    { id: 3, action: 'Delete Record', user: 'staff', time: '2025-11-05 10:02', status: 'Deleted' },
    { id: 4, action: 'Add New User', user: 'superadmin', time: '2025-11-05 10:15', status: 'Created' },
  ]

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
  )

  const userActivities = {
    admin: [
      { time: '09:22', action: 'Login' },
      { time: '09:25', action: 'Accessed Dashboard' },
      { time: '09:40', action: 'Viewed Audit Log' },
    ],
    dokter: [
      { time: '09:31', action: 'Updated Patient Record (ID 123)' },
      { time: '09:40', action: 'Printed Prescription' },
    ],
    staff: [
      { time: '10:02', action: 'Deleted Record (Temp ID 88)' },
      { time: '10:05', action: 'Updated Room Status' },
    ],
    superadmin: [
      { time: '10:15', action: 'Created new user: kasir01' },
      { time: '10:20', action: 'Granted role: Kasir' },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h1 className="text-2xl font-semibold tracking-wide">Audit Log</h1>
      </div>

      {/* Search Bar */}
      <div className="p-6 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 opacity-60" />
          <input
            type="text"
            placeholder="Search logs by user or action..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground outline-none focus:ring-2 focus:ring-yellow-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow bg-card">
          <thead>
            <tr className="text-left text-sm bg-muted text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedUser(log.user)}
                  className="text-sm cursor-pointer border-b border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">{log.id}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 font-medium text-yellow-500">{log.user}</td>
                  <td className="px-4 py-3">{log.time}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      log.status === 'Success'
                        ? 'text-green-500'
                        : log.status === 'Deleted'
                        ? 'text-red-500'
                        : log.status === 'Created'
                        ? 'text-blue-500'
                        : 'text-yellow-500'
                    }`}
                  >
                    {log.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground italic text-sm">
                  No matching logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card text-foreground rounded-xl shadow-lg w-[90%] max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              User Activity — <span className="text-yellow-500">{selectedUser}</span>
            </h2>

            <div className="space-y-3">
              {userActivities[selectedUser as keyof typeof userActivities]?.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-border pb-2 text-sm"
                >
                  <span>{a.action}</span>
                  <span className="text-muted-foreground">{a.time}</span>
                </div>
              )) || (
                <p className="text-muted-foreground italic text-sm">
                  No detailed logs for this user.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SIRAMA System — Audit Log Monitoring
      </div>
    </div>
  )
}
