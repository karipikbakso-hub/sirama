'use client'

import { Table } from '@/components/table/core/Table'
import { getUserColumns } from '@/components/table/columns/userColumns'
import { pasienColumns } from '@/components/table/columns/pasienColumns'
import { resepColumns } from '@/components/table/columns/resepColumns'

import type { Role } from '@/types/role'
import type { ColumnDef } from '@tanstack/react-table'

const columnsByRole: Record<Role, ColumnDef<any>[]> = {
  admin: getUserColumns({ onEdit: () => {}, onDelete: () => {}, onAudit: () => {} }),
  dokter: resepColumns,
  perawatpoli: pasienColumns,
  perawatigd: pasienColumns,
  radiografer: resepColumns,
  lab: resepColumns,
  apoteker: resepColumns,
  gizi: resepColumns,
  rekammedis: pasienColumns,
  kepalaunit: pasienColumns,
  tpp: pasienColumns,
  kasir: pasienColumns,
  sdm: getUserColumns({ onEdit: () => {}, onDelete: () => {}, onAudit: () => {} }),
  keuangan: pasienColumns,
  logmedis: resepColumns,
  logumum: resepColumns,
  manajemenrs: pasienColumns,
  supplier: getUserColumns({ onEdit: () => {}, onDelete: () => {}, onAudit: () => {} }),
  penjamin: getUserColumns({ onEdit: () => {}, onDelete: () => {}, onAudit: () => {} }),
  bpjs: pasienColumns,
  satusehat: resepColumns,
  audit: getUserColumns({ onEdit: () => {}, onDelete: () => {}, onAudit: () => {} }),
}

export default function TableByRole({
  role,
  data,
}: {
  role: Role
  data: any[]
}) {
  const columns = columnsByRole[role] ?? []
  return <Table columns={columns} data={data} />
}
