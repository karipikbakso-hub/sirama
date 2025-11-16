// Role-to-dashboard route mapping for RBAC
export function getDashboardRoute(role: string): string {
  const roleRouteMap: Record<string, string> = {
    // Existing database roles
    'admin': '/dashboard/admin',
    'super-admin': '/dashboard/admin',
    'dokter': '/dashboard/dokter',
    'doctor': '/dashboard/dokter',
    'perawat': '/dashboard/perawat',
    'nurse': '/dashboard/perawat',
    'pasien': '/dashboard/pasien',
    'patient': '/dashboard/pasien',

    // Roles that need to be added to database later
    'apoteker': '/dashboard/apoteker',
    'pharmacist': '/dashboard/apoteker',
    'kasir': '/dashboard/kasir',
    'cashier': '/dashboard/kasir',
    'pendaftaran': '/dashboard/pendaftaran',
    'registration': '/dashboard/pendaftaran',
    'laboratorium': '/dashboard/laboratorium',
    'laboratory': '/dashboard/laboratorium',
    'radiologi': '/dashboard/radiologi',
    'radiology': '/dashboard/radiologi',
    'manajemenrs': '/dashboard/manajemenrs',
    'management': '/dashboard/manajemenrs',

    // Fallback
    'user': '/dashboard',
    'default': '/dashboard',
  }

  const normalizedRole = role?.toString().toLowerCase().trim()
  return roleRouteMap[normalizedRole] || '/dashboard'
}

// Helper to check if user has any of the required roles
export function hasAnyRole(userRoles: string[] | undefined, requiredRoles: string[]): boolean {
  if (!userRoles || !Array.isArray(userRoles)) return false
  return requiredRoles.some(role =>
    userRoles.includes(role) ||
    userRoles.includes(role.toLowerCase())
  )
}

// Extract primary role from user object
export function getPrimaryRole(user: any): string {
  if (!user) return 'user'

  // Try different ways to get role
  if (Array.isArray(user.roles)) {
    // If roles is array of objects
    if (typeof user.roles[0] === 'object' && user.roles[0]?.name) {
      return user.roles[0].name
    }
    // If roles is array of strings
    if (typeof user.roles[0] === 'string') {
      return user.roles[0]
    }
  }

  // Fallback to role field
  return user.role || 'user'
}
