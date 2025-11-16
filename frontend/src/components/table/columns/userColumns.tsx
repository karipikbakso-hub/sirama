'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

type User = {
  id: number
  name: string
  username: string
  email: string
  email_verified_at: string | null
  created_at: string
  status?: string
}

export function getUserColumns({
  onEdit,
  onDelete,
  onAudit,
}: {
  onEdit: (user: User) => void
  onDelete: (id: number) => void
  onAudit: (id: number) => void
}): ColumnDef<User>[] {
  return [
    { accessorKey: 'name', header: 'Nama' },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'email_verified_at',
      header: 'Verifikasi',
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="text-green-600 font-semibold">✔️</span>
        ) : (
          <span className="text-red-500 font-semibold">❌</span>
        ),
    },
    {
      accessorKey: 'created_at',
      header: 'Tanggal Daftar',
      cell: ({ getValue }) =>
        format(new Date(getValue() as string), 'dd MMM yyyy'),
    },
    {
      header: 'Aksi',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onEdit(user)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(user.id)}>Hapus</Button>
            <Button size="sm" variant="ghost" onClick={() => onAudit(user.id)}>Audit</Button>
          </div>
        )
      },
    },
  ]
}
