import { AuditLog } from './types'

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  return new Promise(resolve => setTimeout(() => resolve([]), 500))
}
