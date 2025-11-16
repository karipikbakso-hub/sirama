'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import RoleHeader from '@/components/layout/RoleHeader'
import { setGlobalRole } from '@/components/layout/PersistentSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, isLoggedOut } = useAuth()

  // Extract role from pathname
  const requestedRole = pathname?.split('/')[2] || 'admin'

  useEffect(() => {
    // Update global sidebar role
    setGlobalRole(requestedRole)

    if (loading) return

    // 🔐 Check if user is logged out - redirect to login
    if (isLoggedOut) {
      router.push('/login')
      return
    }

    // 🔐 Check if user is authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // 🔐 Role validation - redirect to correct role dashboard
    const userRole = user.role || (user.roles?.[0]?.name?.toLowerCase() || 'user')
    if (userRole !== requestedRole) {
      router.push(`/dashboard/${userRole}`)
    }
  }, [user, loading, requestedRole, router, isLoggedOut])

  // Show loading while verifying authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <RoleHeader role={requestedRole} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
