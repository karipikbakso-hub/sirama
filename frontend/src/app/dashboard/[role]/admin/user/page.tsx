'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MdPerson,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdRefresh,
  MdPersonAdd,
  MdEmail,
  MdAdminPanelSettings,
  MdLocalHospital,
  MdAccountBalance,
  MdFilterList,
  MdLockReset,
  MdCheckCircle,
  MdError,
  MdWarning
} from 'react-icons/md'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'
import toast from '@/lib/toast'

interface User {
  id: number
  name?: string
  username?: string
  fullName?: string
  email: string
  role?: string // untuk backward compatibility
  roles?: Array<{id: number, name: string, label?: string, guard_name: string}>
  status: 'active' | 'inactive'
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

interface Role {
  id: number
  name: string
  label?: string
  guard_name: string
}

interface UserFormData {
  username: string
  fullName: string
  email: string
  role: string
  password?: string
  password_confirmation?: string
  roleIds?: number[]
  isActive?: boolean
}

export default function UserPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<UserFormData>({
    fullName: '',
    email: '',
    role: 'kasir',
    username: '',
    isActive: true
  })
  const [editUser, setEditUser] = useState<UserFormData>({
    fullName: '',
    email: '',
    role: 'kasir',
    username: '',
    isActive: true
  })
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    password_confirmation: ''
  })

  const queryClient = useQueryClient()

  // Fetch users
  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['users', searchTerm, filterRole, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterRole !== 'all') params.append('role', filterRole)
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await api.get(`/api/users?${params}`)
      return response.data.data
    },
    retry: 3,
  })

  // Fetch user statistics
  const { data: statsData } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: async () => {
      const response = await api.get('/api/users-statistics')
      return response.data.data
    },
  })

  // Fetch available roles
  const { data: rolesData, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('🔍 Fetching roles...')
      const response = await api.get('/api/roles')
      console.log('📦 Roles API response:', response.data)
      console.log('👤 Roles count:', response.data.data?.length || 0)
      console.log('👥 Roles names:', response.data.data?.map((r: any) => r.name).join(', ') || 'none')
      // Backend returns {data: [...]}, so access the data property directly
      return response.data.data || []
    },
    retry: 3,
  })

  console.log('🎭 Roles debug:', {
    rolesData,
    rolesLoading,
    rolesError,
    rolesCount: rolesData?.length || 0
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await api.post('/api/users', userData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      setShowAddForm(false)
      setNewUser({ fullName: '', email: '', role: 'kasir', username: '' })
      toast.success('User berhasil ditambahkan')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan user')
    }
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormData> }) => {
      console.log('🔄 Sending edit user request:', { id, data })
      console.log('📋 Payload details:', {
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        roleIds: data.roleIds,
        roleIdsType: typeof data.roleIds?.[0],
        roleIdsValue: data.roleIds?.[0]
      })
      const response = await api.put(`/api/users/${id}`, data)
      console.log('✅ Edit user successful:', response.data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowEditForm(false)
      setSelectedUser(null)
      toast.success('User berhasil diperbarui')
    },
    onError: (error: any) => {
      console.error('❌ Edit user error:', error.response?.data || error.message)
      console.log('🔍 Detailed error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        validationErrors: error.response?.data?.errors,
        message: error.response?.data?.message,
        rawData: error.response?.data
      })
      console.log('🚨 VALIDATION ERRORS DETAIL:', error.response?.data?.errors || 'NO ERRORS')
      console.log('🚨 LARAVEL MESSAGE:', error.response?.data?.message || 'NO MESSAGE')

      // Show specific validation error if available
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0] as string[]
        toast.error(`Validation Error: ${firstError[0]}`)
      } else {
        toast.error(error.response?.data?.message || 'Gagal memperbarui user')
      }
    }
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/users/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      toast.success('User berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus user')
    }
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.post(`/api/users/${id}/reset-password`, data)
      return response.data
    },
    onSuccess: () => {
      setShowResetPasswordForm(false)
      setSelectedUser(null)
      setResetPasswordData({ password: '', password_confirmation: '' })
      toast.success('Password berhasil direset')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mereset password')
    }
  })

  const users = usersData?.data || []
  const pagination = usersData?.meta || {}

  // Note: Role and status filtering is now handled by the API, keeping only client-side search for additional filtering
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = (user.name || user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
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
        return <MdPerson className="text-gray-500 text-lg" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'dokter':
        return 'Dokter'
      case 'perawat':
        return 'Perawat'
      case 'kasir':
        return 'Kasir'
      case 'apoteker':
        return 'Apoteker'
      default:
        return role
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.fullName || !newUser.email) {
      toast.error('Username, nama lengkap dan email harus diisi')
      return
    }

    // Find selected role and use its ID
    const selectedRole = roles.find((role: { id: number; name: string; label?: string }) => role.name === newUser.role)
    if (!selectedRole) {
      toast.error('Role tidak valid')
      return
    }

    // Add password for new user
    const userData = {
      username: newUser.username,
      fullName: newUser.fullName, // Map 'fullName' to 'fullName' for backend
      email: newUser.email,
      role: newUser.role,
      password: 'password123', // Default password, user should change it
      password_confirmation: 'password123',
      roleIds: [selectedRole.id], // Send role IDs instead of role name
      isActive: newUser.isActive
    }

    createUserMutation.mutate(userData)
  }

  const handleEditUser = () => {
    if (!selectedUser || !editUser.username || !editUser.fullName || !editUser.email) {
      toast.error('Username, nama lengkap dan email harus diisi')
      return
    }

    // DEBUG: Log role validation
    console.log('🔍 Edit User Debug:', {
      editUserRole: editUser.role,
      availableRoles: roles.map((r: {name: string, id: number}) => ({name: r.name, id: r.id})),
      rolesCount: roles.length,
      rolesLoading,
      rolesError
    })

    // Find selected role and use its ID (case-insensitive comparison)
    const selectedRole = roles.find((role: { id: number; name: string; label?: string }) =>
      role.name.toLowerCase() === editUser.role.toLowerCase()
    )
    console.log('🎯 Selected role from roles.find():', selectedRole)

    if (!selectedRole) {
      console.error('❌ Role tidak valid!', {
        selectedRole,
        editUserRole: editUser.role,
        availableRoleNames: roles.map((r: { id: number; name: string; label?: string }) => r.name)
      })
      toast.error(`Role '${editUser.role}' tidak valid. Pastikan role tersedia.`)
      return
    }

    updateUserMutation.mutate({
      id: selectedUser.id,
      data: {
        username: editUser.username,
        fullName: editUser.fullName,  // Map 'fullName' to 'fullName' for backend
        email: editUser.email,
        roleIds: [selectedRole.id], // Send role IDs instead of role name
        isActive: editUser.isActive
      }
    })
  }

  const handleResetPassword = () => {
    if (!resetPasswordData.password || resetPasswordData.password !== resetPasswordData.password_confirmation) {
      toast.error('Password tidak cocok atau kosong')
      return
    }

    if (selectedUser) {
      resetPasswordMutation.mutate({
        id: selectedUser.id,
        data: resetPasswordData
      })
    }
  }

  const roles = rolesData || []

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-end gap-4">
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
            Tambah User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              disabled={rolesLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              aria-label="Filter by role"
            >
              <option value="all">Semua Role</option>
              {rolesLoading ? (
                <option disabled>Loading roles...</option>
              ) : rolesError ? (
                <option disabled>Error loading roles</option>
              ) : (
                roles.map((role: { id: number; name: string; label?: string }) => (
                  <option key={role.name} value={role.name}>{role.label || role.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Login Terakhir
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <MdPerson className="text-gray-600 dark:text-gray-400 text-lg" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || user.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.roles?.[0]?.name || 'pengguna')}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getRoleLabel(user.roles?.[0]?.name || 'pengguna')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Belum pernah login'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setEditUser({
                              fullName: user.name || user.fullName || '',
                              username: user.username || '',
                              email: user.email,
                              role: user.roles?.[0]?.name || user.role || 'kasir',
                              isActive: user.isActive || false
                            })
                            setShowEditForm(true)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MdEdit className="text-lg" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
                              deleteUserMutation.mutate(user.id)
                            }
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <MdDelete className="text-lg" />
                          Hapus
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowResetPasswordForm(true)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                        >
                          <MdLockReset className="text-lg" />
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tambah Pengguna Baru
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  disabled={rolesLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  aria-label="Pilih role pengguna"
                >
                  {rolesLoading ? (
                    <option disabled>Loading roles...</option>
                  ) : rolesError ? (
                    <option disabled>Error loading roles</option>
                  ) : (
                    roles.map((role: { id: number; name: string; label?: string }) => (
                      <option key={role.name} value={role.name}>{role.label || role.name}</option>
                    ))
                  )}
                </select>
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
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Tambah User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Pengguna
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editUser.fullName}
                  onChange={(e) => setEditUser(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser(prev => ({ ...prev, role: e.target.value }))}
                  disabled={rolesLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  aria-label="Pilih role pengguna"
                >
                  {rolesLoading ? (
                    <option disabled>Loading roles...</option>
                  ) : rolesError ? (
                    <option disabled>Error loading roles</option>
                  ) : (
                    roles.map((role: { id: number; name: string; label?: string }) => (
                      <option key={role.name} value={role.name}>{role.label || role.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status Akun Aktif
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Aktifkan/inaktifkan akun pengguna
                  </p>
                </div>
                <Switch
                  checked={editUser.isActive}
                  onCheckedChange={(checked) => setEditUser(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditForm(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordForm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reset Password
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Reset password untuk: <strong>{selectedUser.name}</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={resetPasswordData.password}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password baru"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={resetPasswordData.password_confirmation}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Konfirmasi password baru"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowResetPasswordForm(false)
                  setSelectedUser(null)
                  setResetPasswordData({ password: '', password_confirmation: '' })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdPerson className="text-blue-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdAdminPanelSettings className="text-purple-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u: User) => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdLocalHospital className="text-green-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dokter</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u: User) => u.role === 'dokter').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <MdAccountBalance className="text-orange-500 text-2xl" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u: User) => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
