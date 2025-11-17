import type { User, Role } from '@/types/user'

// Mock data for Users Management - exact data from task requirements

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@sirama.com',
    fullName: 'Administrator System',
    nip: '198501012010011001',
    phone: '08123456789',
    roles: [{ id: '1', name: 'Admin', slug: 'admin' }],
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    username: 'dr.andi',
    email: 'andi@sirama.com',
    fullName: 'Dr. Andi Wijaya, Sp.PD',
    nip: '198705152012011002',
    phone: '08234567890',
    roles: [{ id: '3', name: 'Dokter', slug: 'dokter' }],
    isActive: true,
    lastLoginAt: new Date(Date.now() - 2*60*60*1000).toISOString(),
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    username: 'perawat.lisa',
    email: 'lisa@sirama.com',
    fullName: 'Lisa Permata Sari, S.Kep',
    nip: '199002102015012001',
    phone: '08345678901',
    roles: [{ id: '4', name: 'Perawat', slug: 'perawat' }],
    isActive: true,
    lastLoginAt: new Date(Date.now() - 30*60*1000).toISOString(),
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: '4',
    username: 'kasir.budi',
    email: 'budi@sirama.com',
    fullName: 'Budi Santoso',
    nip: '199208202016011001',
    phone: '08456789012',
    roles: [{ id: '6', name: 'Kasir', slug: 'kasir' }],
    isActive: false,
    lastLoginAt: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  },
  {
    id: '5',
    username: 'apoteker.sari',
    email: 'sari@sirama.com',
    fullName: 'Sari Dewi, S.Farm., Apt',
    nip: '198812152014012001',
    phone: '08567890123',
    roles: [{ id: '5', name: 'Apoteker', slug: 'apoteker' }],
    isActive: true,
    lastLoginAt: new Date(Date.now() - 4*60*60*1000).toISOString(),
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-19T00:00:00Z'
  }
]

export const mockRoles: Role[] = [
  { id: '1', name: 'Admin', slug: 'admin' },
  { id: '2', name: 'Pendaftaran', slug: 'pendaftaran' },
  { id: '3', name: 'Dokter', slug: 'dokter' },
  { id: '4', name: 'Perawat', slug: 'perawat' },
  { id: '5', name: 'Apoteker', slug: 'apoteker' },
  { id: '6', name: 'Kasir', slug: 'kasir' },
  { id: '7', name: 'Laboratorium', slug: 'laboratorium' },
  { id: '8', name: 'Radiologi', slug: 'radiologi' },
  { id: '9', name: 'Manajemen', slug: 'manajemen' }
]

// Mock API handlers - commented out for now, will be enabled after implementing components
/*
export const mockUserAPI = {
  // Get all users with optional filters
  getUsers: (params?: { search?: string; role?: string; status?: string; page?: number; per_page?: number }) => {
    let filteredUsers = [...mockUsers]

    // Apply filters
    if (params?.search) {
      const search = params.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.fullName.toLowerCase().includes(search) ||
        user.nip?.includes(params.search) ||
        user.phone?.includes(params.search)
      )
    }

    if (params?.role && params.role !== 'all') {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.some(role => role.slug === params.role)
      )
    }

    if (params?.status && params.status !== 'all') {
      const isActive = params.status === 'active'
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive)
    }

    // Pagination
    const page = params?.page || 1
    const perPage = params?.per_page || 10
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / perPage)
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    return Promise.resolve({
      data: paginatedUsers,
      meta: {
        current_page: page,
        per_page: perPage,
        total,
        last_page: totalPages,
        from: startIndex + 1,
        to: Math.min(endIndex, total)
      }
    })
  },

  // Create new user
  createUser: (userData: any) => {
    const newUser: User = {
      id: String(Date.now()),
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      nip: userData.nip || undefined,
      phone: userData.phone || undefined,
      roles: mockRoles.filter(role => userData.roleIds.includes(role.id)),
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockUsers.push(newUser)
    return Promise.resolve({ data: newUser })
  },

  // Update existing user
  updateUser: (id: string, userData: any) => {
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return Promise.reject(new Error('User not found'))
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      nip: userData.nip || undefined,
      phone: userData.phone || undefined,
      roles: mockRoles.filter(role => userData.roleIds.includes(role.id)),
      isActive: userData.isActive,
      updatedAt: new Date().toISOString()
    }

    return Promise.resolve({ data: mockUsers[userIndex] })
  },

  // Delete user
  deleteUser: (id: string) => {
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return Promise.reject(new Error('User not found'))
    }

    mockUsers[userIndex].isActive = false // Soft delete by setting inactive
    return Promise.resolve({ data: mockUsers[userIndex] })
  },

  // Reset user password
  resetPassword: (id: string, passwordData: any) => {
    const userIndex = mockUsers.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return Promise.reject(new Error('User not found'))
    }

    // In real app, this would trigger password reset email
    // For mock, we just return success
    return Promise.resolve({ data: { success: true } })
  },

  // Get all roles
  getRoles: () => {
    return Promise.resolve({ data: mockRoles })
  }
}
*/
