import type { User } from '@/types/user'
import type { Role } from '@/types/user'

// Helper functions for Users Management

/**
 * Generate user avatar initials from full name
 */
export function getUserInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Belum pernah'

  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Get time ago string
 */
export function getTimeAgo(dateString: string): string {
  if (!dateString) return 'Belum pernah'

  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Baru saja'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`

  return formatDate(dateString)
}

/**
 * Get role display color for badges
 */
export function getRoleColor(roleSlug: string): string {
  const colorMap: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    dokter: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    perawat: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    apoteker: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    kasir: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    pendaftaran: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
    laboratorium: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    radiologi: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800',
    manajemen: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
  }

  return colorMap[roleSlug] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
}

/**
 * Get status color for badges
 */
export function getStatusColor(isActive: boolean): string {
  return isActive
    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
}

/**
 * Get Indonesian status text
 */
export function getStatusText(isActive: boolean): string {
  return isActive ? 'Aktif' : 'Nonaktif'
}

/**
 * Validate NIP format (basic validation)
 */
export function isValidNIP(nip: string): boolean {
  return nip.length === 18 && /^\d+$/.test(nip)
}

/**
 * Format phone number to Indonesian format
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/^(\d{4})(\d{4})(\d{3,4})$/, '$1-$2-$3')
}

/**
 * Generate default password for new users
 */
export function generateDefaultPassword(): string {
  return 'Sirama2024!' // Simple default for demo
}

/**
 * Check if user is online (last login within 5 minutes)
 */
export function isUserOnline(lastLoginAt: string | null): boolean {
  if (!lastLoginAt) return false

  const now = new Date()
  const lastLogin = new Date(lastLoginAt)
  const diffInMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60))

  return diffInMinutes <= 5
}

/**
 * Sort users by different criteria
 */
export function sortUsers(users: User[], sortBy: 'username' | 'fullName' | 'email' | 'lastLoginAt' | 'createdAt' | 'updatedAt', direction: 'asc' | 'desc' = 'asc'): User[] {
  return [...users].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'username':
        aValue = a.username.toLowerCase()
        bValue = b.username.toLowerCase()
        break
      case 'fullName':
        aValue = a.fullName.toLowerCase()
        bValue = b.fullName.toLowerCase()
        break
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'lastLoginAt':
        aValue = new Date(a.lastLoginAt || '1970-01-01').getTime()
        bValue = new Date(b.lastLoginAt || '1970-01-01').getTime()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter users by search term
 */
export function filterUsersBySearch(users: User[], searchTerm: string): User[] {
  if (!searchTerm) return users

  const term = searchTerm.toLowerCase()
  return users.filter(user =>
    user.username.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term) ||
    user.fullName.toLowerCase().includes(term) ||
    user.nip?.includes(term) ||
    user.phone?.includes(term) ||
    user.roles.some(role => role.name.toLowerCase().includes(term))
  )
}

/**
 * Filter users by role
 */
export function filterUsersByRole(users: User[], roleSlug: string | null): User[] {
  if (!roleSlug || roleSlug === 'all') return users

  return users.filter(user =>
    user.roles.some(role => role.slug === roleSlug)
  )
}

/**
 * Filter users by status
 */
export function filterUsersByStatus(users: User[], status: 'active' | 'inactive' | 'all'): User[] {
  if (status === 'all') return users

  return users.filter(user => user.isActive === (status === 'active'))
}

/**
 * Get role names string for display
 */
export function getRoleNamesString(roles: User['roles']): string {
  if (roles.length === 0) return 'Tidak ada role'

  const names = roles.map(role => role.name)
  if (names.length <= 2) {
    return names.join(', ')
  }

  return `${names.slice(0, 2).join(', ')} +${names.length - 2} lainnya`
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
