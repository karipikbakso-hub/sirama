// Enhanced User interface for Users Management page
// Based on task requirements and mock data structure
export interface User {
  id: string
  username: string
  email: string
  fullName: string
  nip?: string // 18-digit employee ID
  phone?: string // Indonesian phone format (08xxxxxxxxxx)
  roles: Array<{
    id: string
    name: string // Display name in Indonesian
    slug: string // Internal slug (admin, dokter, etc.)
  }>
  isActive: boolean
  lastLoginAt: string | null // ISO string or null
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

// Form data for creating new user
export interface CreateUserFormData {
  username: string
  email: string
  fullName: string
  password: string
  password_confirmation: string
  nip?: string
  phone?: string
  roleIds: string[] // Array of role IDs
  isActive: boolean
}

// Form data for editing user
export interface EditUserFormData {
  username: string
  email: string
  fullName: string
  nip?: string
  phone?: string
  roleIds: string[] // Array of role IDs
  isActive: boolean
}

// Form data for resetting password
export interface ResetPasswordFormData {
  password: string
  password_confirmation: string
}

// Role interface matching mock data
export interface Role {
  id: string
  name: string // Display name in Indonesian
  slug: string // Internal identifier
}

// User list filters
export interface UserFilters {
  role?: string // Role slug
  status?: 'active' | 'inactive' | 'all'
  search?: string
}

// User list sorting
export interface UserSort {
  field: 'username' | 'fullName' | 'email' | 'lastLoginAt' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

// API response for users list
export interface UsersResponse {
  data: User[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}
