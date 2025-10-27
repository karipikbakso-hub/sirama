export interface AuditLog {
  id: number
  user: string
  action: string
  module: string
  timestamp: string
}
