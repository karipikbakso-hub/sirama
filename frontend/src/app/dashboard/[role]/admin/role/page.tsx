'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MdPerson,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSecurity,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdRefresh,
  MdPersonAdd,
  MdSettings,
  MdGroup,
  MdAdminPanelSettings,
  MdLocalHospital,
  MdAccountBalance,
  MdWarning,
  MdContentCopy,
  MdPeople
} from 'react-icons/md'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface Role {
  id: number
  name: string
  label: string
  permissions: string[]
  permission_count: number
  created_at: string
  updated_at: string
}

interface Permission {
  id: number
  name: string
  label: string
  group: string
}

interface RoleFormData {
  name: string
  permissions: string[]
}

export default function RolePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'core' | 'custom'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showCloneForm, setShowCloneForm] = useState(false)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showMatrixView, setShowMatrixView] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<any[]>([])
  const [newRole, setNewRole] = useState<RoleFormData>({
    name: '',
    permissions: []
  })
  const [editRole, setEditRole] = useState<RoleFormData>({
    name: '',
    permissions: []
  })
  const [cloneRole, setCloneRole] = useState<{name: string}>({name: ''})
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [bulkPermissions, setBulkPermissions] = useState<string[]>([])
  const [matrixPermissions, setMatrixPermissions] = useState<any>({})

  const queryClient = useQueryClient()

  // Fetch roles
  const { data: rolesData, isLoading, error, refetch } = useQuery({
    queryKey: ['roles-permissions'],
    queryFn: async () => {
      const response = await api.get('/api/role-permissions')
      return response.data.data
    },
    retry: 3,
  })

  // Fetch permissions
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/api/permissions')
      return response.data.data
    },
  })

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData: RoleFormData) => {
      const response = await api.post('/api/role-permissions', roleData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
      setShowAddForm(false)
      setNewRole({ name: '', permissions: [] })
      toast.success('Role berhasil dibuat')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat role')
    }
  })

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RoleFormData> }) => {
      const response = await api.put(`/api/role-permissions/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
      setShowEditForm(false)
      setSelectedRole(null)
      toast.success('Role berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui role')
    }
  })

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/role-permissions/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
      toast.success('Role berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus role')
    }
  })

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: number; permissions: string[] }) => {
      const response = await api.put(`/api/role-permissions/${id}/permissions`, {
        permissions: permissions
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
      setShowPermissionModal(false)
      setSelectedRole(null)
      setSelectedPermissions([])
      toast.success('Permissions berhasil diperbarui')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui permissions')
    }
  })

  // Clone role mutation
  const cloneRoleMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await api.post(`/api/role-permissions/${id}/clone`, { name })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
      setShowCloneForm(false)
      setSelectedRole(null)
      setCloneRole({ name: '' })
      toast.success('Role berhasil di-clone')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal clone role')
    }
  })

  // Get users by role mutation
  const getUsersByRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await api.get(`/api/role-permissions/${roleId}/users`)
      return response.data.data
    },
    onSuccess: (data) => {
      setSelectedUsers(data.users || [])
      setShowUsersModal(true)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengambil data pengguna')
    }
  })

  const roles = rolesData || []
  const permissions = permissionsData || {}

  // Filter roles based on search
  const filteredRoles = roles.filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <MdAdminPanelSettings className="text-purple-500 text-lg" />
      case 'dokter':
        return <MdLocalHospital className="text-blue-500 text-lg" />
      case 'perawat':
        return <MdPerson className="text-green-500 text-lg" />
      case 'kasir':
        return <MdAccountBalance className="text-orange-500 text-lg" />
      case 'apoteker':
        return <MdPerson className="text-red-500 text-lg" />
      default:
        return <MdGroup className="text-gray-500 text-lg" />
    }
  }

  const handleAddRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Nama role harus diisi')
      return
    }

    createRoleMutation.mutate(newRole)
  }

  const handleEditRole = () => {
    if (!selectedRole || !editRole.name.trim()) {
      toast.error('Nama role harus diisi')
      return
    }

    updateRoleMutation.mutate({
      id: selectedRole.id,
      data: {
        name: editRole.name,
        permissions: editRole.permissions
      }
    })
  }

  const handleDeleteRole = async (role: Role) => {
    try {
      // First check if role has users
      const response = await api.get(`/api/role-permissions/${role.id}`)
      const roleData = response.data.data

      if (roleData.user_count > 0) {
        const confirmDelete = confirm(
          `Role "${role.label}" memiliki ${roleData.user_count} pengguna yang masih terhubung.\n\n` +
          `Menghapus role ini akan mempengaruhi akses pengguna tersebut.\n\n` +
          `Apakah Anda yakin ingin melanjutkan?`
        )

        if (!confirmDelete) return
      } else {
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus role "${role.label}"?`)
        if (!confirmDelete) return
      }

      deleteRoleMutation.mutate(role.id)
    } catch (error) {
      toast.error('Gagal memeriksa status role')
    }
  }

  const handleCloneRole = () => {
    if (!selectedRole || !cloneRole.name.trim()) {
      toast.error('Nama role baru harus diisi')
      return
    }

    cloneRoleMutation.mutate({
      id: selectedRole.id,
      name: cloneRole.name
    })
  }

  const handleViewUsers = (role: Role) => {
    setSelectedRole(role)
    getUsersByRoleMutation.mutate(role.id)
  }

  const handleUpdatePermissions = () => {
    if (!selectedRole) return

    updatePermissionsMutation.mutate({
      id: selectedRole.id,
      permissions: selectedPermissions
    })
  }

  const openPermissionModal = (role: Role) => {
    setSelectedRole(role)
    setSelectedPermissions([...role.permissions])
    setShowPermissionModal(true)
  }

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    )
  }

  const toggleGroupPermissions = (groupPermissions: Permission[]) => {
    const permissionNames = groupPermissions.map(p => p.name)
    const allSelected = permissionNames.every(name => selectedPermissions.includes(name))

    if (allSelected) {
      // Remove all permissions in group
      setSelectedPermissions(prev => prev.filter(p => !permissionNames.includes(p)))
    } else {
      // Add all permissions in group
      setSelectedPermissions(prev => [...new Set([...prev, ...permissionNames])])
    }
  }

  const isGroupFullySelected = (groupPermissions: Permission[]) => {
    return groupPermissions.every(permission => selectedPermissions.includes(permission.name))
  }

  const isGroupPartiallySelected = (groupPermissions: Permission[]) => {
    const selectedCount = groupPermissions.filter(permission => selectedPermissions.includes(permission.name)).length
    return selectedCount > 0 && selectedCount < groupPermissions.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Peran & Akses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola peran dan hak akses pengguna sistem SIRAMA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdRefresh className={`text-lg ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MdPersonAdd className="text-lg" />
            Tambah Role
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Cari peran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading roles...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Peran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hak Akses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
                <tr>
                  <th colSpan={4} className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {filteredRoles.length} roles
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 text-xs rounded-full ${viewMode === 'table' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'}`}
                          >
                            Table
                          </button>
                          <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1 text-xs rounded-full ${viewMode === 'matrix' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'}`}
                          >
                            Matrix
                          </button>
                        </div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRoles.map((role: Role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(role.name)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        <MdSecurity className="text-lg" />
                        {role.permission_count} permissions
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(role.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button
                          onClick={() => handleViewUsers(role)}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-green-300 dark:border-green-600 rounded-lg text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Lihat pengguna dalam role ini"
                        >
                          <MdPeople className="text-lg" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRole(role)
                            setCloneRole({ name: `${role.name}_copy` })
                            setShowCloneForm(true)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-purple-300 dark:border-purple-600 rounded-lg text-sm text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          title="Duplikasi role"
                        >
                          <MdContentCopy className="text-lg" />
                        </button>
                        <button
                          onClick={() => openPermissionModal(role)}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-blue-300 dark:border-blue-600 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Atur hak akses"
                        >
                          <MdSettings className="text-lg" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRole(role)
                            setEditRole({
                              name: role.name,
                              permissions: role.permissions
                            })
                            setShowEditForm(true)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Edit role"
                        >
                          <MdEdit className="text-lg" />
                        </button>
                        {!['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs'].includes(role.name) && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                            title="Hapus role"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Role Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tambah Peran Baru
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Peran
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama peran"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddRole}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Tambah Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditForm && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Peran
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Peran
                </label>
                <input
                  type="text"
                  value={editRole.name}
                  onChange={(e) => setEditRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama peran"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditForm(false)
                  setSelectedRole(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditRole}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Role Modal */}
      {showCloneForm && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Duplikasi Peran
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Membuat salinan dari peran "{selectedRole.label}" beserta semua hak aksesnya.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Peran Baru
                </label>
                <input
                  type="text"
                  value={cloneRole.name}
                  onChange={(e) => setCloneRole(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama peran baru"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCloneForm(false)
                  setSelectedRole(null)
                  setCloneRole({ name: '' })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCloneRole}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Duplikasi Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pengguna dengan Peran "{selectedRole.label}"
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedUsers.length} pengguna ditemukan
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedUsers.length > 0 ? (
                <div className="space-y-4">
                  {selectedUsers.map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MdPeople className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Tidak ada pengguna dengan peran ini
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setShowUsersModal(false)
                    setSelectedRole(null)
                    setSelectedUsers([])
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atur Hak Akses - {selectedRole.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Pilih hak akses yang akan diberikan kepada peran ini
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-6">
                {Object.entries(permissions).map(([groupName, groupPermissions]: [string, any]) => (
                  <div key={groupName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => toggleGroupPermissions(groupPermissions)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {isGroupFullySelected(groupPermissions) ? (
                          <MdCheckBox className="text-blue-500 text-lg" />
                        ) : isGroupPartiallySelected(groupPermissions) ? (
                          <MdCheckBoxOutlineBlank className="text-orange-500 text-lg" />
                        ) : (
                          <MdCheckBoxOutlineBlank className="text-gray-400 text-lg" />
                        )}
                        {groupName}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({groupPermissions.length})
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupPermissions.map((permission: Permission) => (
                        <button
                          key={permission.id}
                          onClick={() => togglePermission(permission.name)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                            selectedPermissions.includes(permission.name)
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                          }`}
                        >
                          {selectedPermissions.includes(permission.name) ? (
                            <MdCheckBox className="text-blue-500 text-lg flex-shrink-0" />
                          ) : (
                            <MdCheckBoxOutlineBlank className="text-gray-400 text-lg flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {permission.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPermissions.length} hak akses dipilih
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowPermissionModal(false)
                      setSelectedRole(null)
                      setSelectedPermissions([])
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdatePermissions}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdGroup className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {roles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdSecurity className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Permissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.values(permissions).flat().length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdAdminPanelSettings className="text-purple-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Core Roles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {roles.filter((role: Role) =>
                  ['admin', 'pendaftaran', 'dokter', 'perawat', 'apoteker', 'kasir', 'manajemenrs'].includes(role.name)
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
