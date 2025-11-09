'use client'

import { useState } from 'react'
import { Download, RotateCcw, Search, X } from 'lucide-react'

export default function BackupAuditPage() {
  const [search, setSearch] = useState('')
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  const backups = [
    { id: 1, filename: 'backup_2025_11_01.sql', date: '2025-11-01 02:14', size: '512 MB', status: 'Completed' },
    { id: 2, filename: 'backup_2025_11_03.sql', date: '2025-11-03 01:59', size: '530 MB', status: 'Completed' },
    { id: 3, filename: 'backup_2025_11_04.sql', date: '2025-11-04 03:10', size: '518 MB', status: 'Completed' },
    { id: 4, filename: 'backup_2025_11_05.sql', date: '2025-11-05 03:00', size: '520 MB', status: 'Running' },
  ]

  const filtered = backups.filter(
    (b) => b.filename.toLowerCase().includes(search.toLowerCase()) || b.date.includes(search)
  )

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h1 className="text-2xl font-semibold tracking-wide">Backup Audit</h1>
      </div>

      {/* Search Bar */}
      <div className="p-6 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 opacity-60" />
          <input
            type="text"
            placeholder="Search backup by name or date..."
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
              <th className="px-4 py-3 font-medium">Filename</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="text-sm border-b border-border hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">{b.id}</td>
                  <td className="px-4 py-3 font-medium">{b.filename}</td>
                  <td className="px-4 py-3">{b.date}</td>
                  <td className="px-4 py-3">{b.size}</td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      b.status === 'Completed'
                        ? 'text-green-500'
                        : b.status === 'Running'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {b.status}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => setSelectedBackup(b.filename)}
                      className="px-3 py-1 rounded-md bg-yellow-500 text-white text-xs hover:bg-yellow-600 transition"
                    >
                      Detail
                    </button>
                    <button className="p-2 rounded-md border border-border hover:bg-muted transition">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-md border border-border hover:bg-muted transition">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground italic text-sm"
                >
                  No backup records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Backup */}
      {selectedBackup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card text-foreground rounded-xl shadow-lg w-[90%] max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedBackup(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Backup Detail — <span className="text-yellow-500">{selectedBackup}</span>
            </h2>

            <ul className="text-sm space-y-3">
              <li>
                <strong>Created at:</strong> 03:00 AM
              </li>
              <li>
                <strong>File Size:</strong> 520 MB
              </li>
              <li>
                <strong>Status:</strong> Completed
              </li>
              <li>
                <strong>Checksum:</strong> SHA256-9f9a0e5eaa1d8d4c1...
              </li>
            </ul>

            <div className="flex justify-end mt-6 gap-3">
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 transition"
              >
                Restore Backup
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SIRAMA System — Backup Audit
      </div>
    </div>
  )
}
