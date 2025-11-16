// app/dashboard/[role]/layout.tsx - Role-Specific Dashboard UI Layout
// AuthProvider sudah ada di parent (dashboard/layout.tsx)
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import RoleHeader from '@/components/layout/RoleHeader'
import RoleSidebar from '@/components/layout/RoleSidebar'
import * as React from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ role: string }>
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const resolvedParams = React.use(params)
  const requestedRole = resolvedParams.role
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Check for auth cookies first to prevent long loading states
    const hasAuthCookies = typeof window !== 'undefined' &&
      (document.cookie.includes('laravel_session') || document.cookie.includes('XSRF-TOKEN'))

    // Immediate redirect if no auth cookies present (server-side auth failure)
    if (!hasAuthCookies && !loading) {
      console.log('No auth cookies found, redirecting to login')
      window.location.href = '/login'
      return
    }

    // Only proceed with auth checks if loading is complete
    if (loading) return

    if (!user) {
      // Auth fetch completed but no user - authentication failed
      console.log('Auth fetch completed but no user, redirecting to login')
      window.location.href = '/login'
      return
    }

    // Check role mismatch
    const userRole = user.role?.toLowerCase() || 'user'
    if (userRole !== requestedRole.toLowerCase()) {
      // Role doesn't match URL - redirect to correct role dashboard
      console.log(`Role mismatch: user has ${userRole}, but accessing ${requestedRole}`)
      router.push(`/dashboard/${userRole}`)
      return
    }
  }, [user, loading, requestedRole, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
          <p className="mt-2 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-r-transparent" />
          <p className="mt-2 text-gray-600">Access denied - redirecting...</p>
        </div>
      </div>
    )
  }

  // Render dashboard only when user is authenticated and role matches
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <RoleSidebar role={requestedRole} />
      <main className="flex-1">
        <RoleHeader role={requestedRole} />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
