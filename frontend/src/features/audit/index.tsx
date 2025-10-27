import { useAuditData } from './hooks'
import AuditTable from './components/AuditTable'

export default function AuditPage() {
  const { logs } = useAuditData()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <AuditTable logs={logs} />
    </div>
  )
}
