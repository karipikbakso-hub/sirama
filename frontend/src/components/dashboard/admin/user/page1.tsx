'use client'

import { useState } from 'react'
import { useUserTable, useCreateUser, useUpdateUser, useDeleteUser } from '@/components/dash/hooks/useUserTable'
import { getUserColumns } from '@/components/table/columns/userColumns'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import useRoles from '@/lib/useRoles'
import { AuditLogModal } from '@/components/modal/AuditLogModal'

type User = {
  id: number
  name: string
  username: string
  email: string
  email_verified_at: string | null
  created_at: string
  status?: string
  role?: string
}

export default function UserPage() {
  const { data = [], isLoading, error } = useUserTable()
  const { roles, loading: rolesLoading } = useRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [auditUserId, setAuditUserId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
  })

  const columns = getUserColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onAudit: handleAudit,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleCreate() {
    setEditingUser(null)
    setFormData({ name: '', username: '', email: '', password: '', role: '' })
    setIsModalOpen(true)
  }

  function handleEdit(user: User) {
    setEditingUser(user)
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    })
    setIsModalOpen(true)
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser.mutate(id)
    }
  }

  function handleAudit(id: number) {
    setAuditUserId(id)
    setIsAuditModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, userData: formData })
    } else {
      createUser.mutate(formData)
    }
    setIsModalOpen(false)
  }

  if (error) {
    return <div className="p-4">Error loading users: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">👥 Pengguna & Role</h2>
        <Button onClick={handleCreate}>Add User</Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="border p-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          {!editingUser && (
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}

          <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="">Select Role</option>
            {roles.map((role: string) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>

          <div className="flex gap-2">
            <Button type="submit">{editingUser ? 'Update' : 'Create'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        userId={auditUserId || 0}
      />
    </div>
  )
}
