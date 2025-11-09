'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ReactNode } from 'react'
import { useAuthContext } from '@/hooks/AuthContext'
import DashboardFallback from '@/components/dash/DashboardFallback'

export default function RoleGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const params = useParams()
  const routeRole = typeof params?.role === 'string' ? params.role.toLowerCase() : ''

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    const userRole = user.role

    if (userRole !== routeRole) {
      router.replace(`/dashboard/${userRole}`)
    }
  }, [user, loading, routeRole, router])

  if (loading || !user || user.role !== routeRole) {
    return <DashboardFallback />
  }

  return <>{children}</>
}