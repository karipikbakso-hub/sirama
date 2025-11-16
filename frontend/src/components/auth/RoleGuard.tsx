'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { hasAnyRole, getPrimaryRole, getDashboardRoute } from '@/lib/roleUtils'

interface RoleGuardProps {
  allowedRoles: string[]
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function RoleGuard({
  allowedRoles,
  children,
  redirectTo,
  fallback
}: RoleGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('RoleGuard: Not authenticated, redirecting to login')
      router.push('/login')
      setIsChecking(false)
      return
    }

    // If no user data yet, wait
    if (!user) {
      console.log('RoleGuard: No user data yet, waiting...')
      return
    }

    // Check if user has required roles
    const userRoles = user.roles || []
    const hasAccess = hasAnyRole(userRoles, allowedRoles)

    console.log('RoleGuard check:', {
      userRoles,
      allowedRoles,
      hasAccess,
      pathname
    })

    if (hasAccess) {
      setIsAuthorized(true)
    } else {
      // User doesn't have access, redirect appropriately
      const primaryRole = getPrimaryRole(user)
      const correctDashboard = getDashboardRoute(primaryRole)

      console.log('RoleGuard: Access denied, redirecting to:', correctDashboard)

      if (redirectTo) {
        router.push(redirectTo)
      } else if (pathname !== correctDashboard) {
        router.push(correctDashboard)
      } else {
        // Already on user's dashboard, just deny access
        setIsAuthorized(false)
      }
    }

    setIsChecking(false)
  }, [isAuthenticated, user, allowedRoles, pathname, router, redirectTo])

  // Loading state
  if (isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Memeriksa izin akses...</h1>
          <p className="mt-2 text-muted-foreground">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (!isAuthorized) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
          <p className="mt-2 text-muted-foreground">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => router.push(getDashboardRoute(getPrimaryRole(user)))}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Access granted
  return <>{children}</>
}

// Helper component for common role combinations
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'super-admin']}>
      {children}
    </RoleGuard>
  )
}

export function DoctorOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['doctor', 'dokter']}>
      {children}
    </RoleGuard>
  )
}

export function NurseOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['nurse', 'perawat']}>
      {children}
    </RoleGuard>
  )
}

export function RegistrationOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['pendaftaran', 'registration']}>
      {children}
    </RoleGuard>
  )
}

export function PharmacistOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['apoteker', 'pharmacist']}>
      {children}
    </RoleGuard>
  )
}

export function CashierOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['kasir', 'cashier']}>
      {children}
    </RoleGuard>
  )
}

export function LabOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['laboratorium', 'laboratory']}>
      {children}
    </RoleGuard>
  )
}

export function RadiologyOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['radiologi', 'radiology']}>
      {children}
    </RoleGuard>
  )
}

export function ManagementOnly({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['manajemenrs', 'management']}>
      {children}
    </RoleGuard>
  )
}
