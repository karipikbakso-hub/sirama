// Admin role types and constants

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: string
  createdAt: string
}

export interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  lastBackup: string
}

export interface AuditLogEntry {
  id: number
  user: string
  action: string
  resource: string
  timestamp: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed' | 'warning'
}

export interface BackupRecord {
  id: number
  filename: string
  size: number
  createdAt: string
  status: 'completed' | 'failed' | 'in_progress'
  type: 'full' | 'incremental' | 'differential'
}

export interface JadwalBackup {
  id: number
  nama_jadwal: string
  frekuensi: 'daily' | 'weekly' | 'monthly'
  waktu_eksekusi: string
  hari_eksekusi?: number
  status_aktif: boolean
  terakhir_dijalankan?: string
  created_at: string
  updated_at: string
}

export interface RiwayatBackup {
  id: number
  jadwal_backup_id?: number
  nama_file: string
  ukuran_file?: number
  path_file?: string
  durasi_detik?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  pesan_error?: string
  created_at: string
  jadwalBackup?: JadwalBackup
}

// Constants
export const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'manage_users',
  ROLE_MANAGEMENT: 'manage_roles',
  SYSTEM_MONITORING: 'view_system_metrics',
  AUDIT_LOGS: 'view_audit_logs',
  BACKUP_MANAGEMENT: 'manage_backups',
  SETTINGS_MANAGEMENT: 'manage_settings'
} as const

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
  { value: 'suspended', label: 'Ditangguhkan' }
] as const

export const AUDIT_LOG_ACTIONS = [
  'login',
  'logout',
  'create_user',
  'update_user',
  'delete_user',
  'create_role',
  'update_role',
  'delete_role',
  'backup_created',
  'settings_updated',
  'system_restart'
] as const