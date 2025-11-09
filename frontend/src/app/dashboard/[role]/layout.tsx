// app/dashboard/[role]/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import RoleHeader from '@/components/layout/RoleHeader'
import RoleSidebar from '@/components/layout/RoleSidebar'
import * as React from 'react'

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ role: string }>
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const resolvedParams = React.use(params)
  const requestedRole = resolvedParams.role

  useEffect(() => {
    if (loading) return

    // 🔐 Belum login → ke /login
    if (!user) {
      router.push('/login')
      return
    }

    // 🔐 Role tidak sesuai → redirect ke role yang benar
    const userRole = user.role || (user.roles?.[0]?.name?.toLowerCase() || 'user')
    if (userRole !== requestedRole) {
      router.push(`/dashboard/${userRole}`)
    }
  }, [user, loading, requestedRole, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent" />
          <p className="mt-2 text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

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