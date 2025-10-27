import { useState } from 'react'
import { AuditLog } from './types'
import { dummyAudit } from './data'

export function useAuditData() {
  const [logs] = useState<AuditLog[]>(dummyAudit)
  return { logs }
}
