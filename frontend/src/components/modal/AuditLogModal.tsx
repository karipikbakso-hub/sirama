'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import api from '@/lib/apiData'

export function AuditLogModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/audit?user_id=${userId}&per_page=1000`)
      return res.data
    },
  })

  const logs = data?.data || []

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card text-foreground rounded-lg p-6 w-full max-w-xl space-y-4 shadow-lg">
        <h3 className="text-lg font-semibold">Audit Log Pengguna #{userId}</h3>

        {isLoading ? (
          <p>Loading logs...</p>
        ) : isError ? (
          <p className="text-red-500">Failed to load logs</p>
        ) : logs.length > 0 ? (
          <ul className="text-sm space-y-2 max-h-[400px] overflow-y-auto">
            {logs.map((log: any) => (
              <li key={log.id} className="border-b border-border pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString('id-ID')}</span>
                </div>
                <div className="text-xs text-muted-foreground">Table: {log.table_affected}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-sm">No logs found for this user.</p>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
