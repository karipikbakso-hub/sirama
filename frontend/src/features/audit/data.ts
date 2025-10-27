import { AuditLog } from './types'

export const dummyAudit: AuditLog[] = [
  {
    id: 1,
    user: 'admin',
    action: 'Login',
    module: 'Auth',
    timestamp: '2025-10-27T08:00:00Z',
  },
  {
    id: 2,
    user: 'kasir',
    action: 'Tambah Transaksi',
    module: 'Kasir',
    timestamp: '2025-10-27T09:00:00Z',
  },
  {
    id: 3,
    user: 'admin',
    action: 'Edit Pasien',
    module: 'Pasien',
    timestamp: '2025-10-27T09:30:00Z',
  },
]
