'use client'

import { useState } from 'react'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'

interface Role {
  id: number
  name: string
  description: string
}

interface RoleRelation {
  id: number
  role: string
  inheritsFrom: string[]
}

export default function RoleRelationsPage() {
  // ===== Dummy Data =====
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'Admin', description: 'Full access' },
    { id: 2, name: 'Doctor', description: 'Access patient records' },
    { id: 3, name: 'Nurse', description: 'Assist doctors' },
    { id: 4, name: 'Staff', description: 'General staff' },
    { id: 5, name: 'Guest', description: 'Limited access' },
  ])

  const [relations, setRelations] = useState<RoleRelation[]>([
    { id: 1, role: 'Doctor', inheritsFrom: ['Staff'] },
    { id: 2, role: 'Nurse', inheritsFrom: ['Staff'] },
    { id: 3, role: 'Admin', inheritsFrom: ['Doctor', 'Nurse'] },
  ])

  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedInherits, setSelectedInherits] = useState<string[]>([])

  const handleAddRelation = () => {
    if (!selectedRole || selectedInherits.length === 0) return
    const newRelation: RoleRelation = {
      id: relations.length + 1,
      role: selectedRole,
      inheritsFrom: selectedInherits,
    }
    setRelations([...relations, newRelation])
    setSelectedRole('')
    setSelectedInherits([])
  }

  const handleDeleteRelation = (id: number) => {
    setRelations(relations.filter((r) => r.id !== id))
  }

  const handleInheritToggle = (roleName: string) => {
    if (selectedInherits.includes(roleName)) {
      setSelectedInherits(selectedInherits.filter((r) => r !== roleName))
    } else {
      setSelectedInherits([...selectedInherits, roleName])
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-[#1a4c6e]">Relasi Role</h2>

      {/* Form Add Relation */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Pilih Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Inherits From</label>
          <div className="flex flex-wrap gap-2">
            {roles
              .filter((r) => r.name !== selectedRole)
              .map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleInheritToggle(role.name)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedInherits.includes(role.name)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {role.name}
                </button>
              ))}
          </div>
        </div>

        <button
          onClick={handleAddRelation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <MdAdd /> Tambah Relasi
        </button>
      </div>

      {/* Relation Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Daftar Relasi Role</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="px-3 py-2 border">Role</th>
                <th className="px-3 py-2 border">Inherits From</th>
                <th className="px-3 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {relations.map((rel) => (
                <tr key={rel.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 border">{rel.role}</td>
                  <td className="px-3 py-2 border">{rel.inheritsFrom.join(', ')}</td>
                  <td className="px-3 py-2 border">
                    <button
                      onClick={() => handleDeleteRelation(rel.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                      <MdDelete /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {relations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-center text-gray-500 dark:text-gray-400">
                    Belum ada relasi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
