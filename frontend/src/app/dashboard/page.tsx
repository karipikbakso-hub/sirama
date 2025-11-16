'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getPrimaryRole, getDashboardRoute } from '@/lib/roleUtils'


export default function DashboardFallback() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard fallback:', { user, isLoading })
    if (!isLoading && user) {
      const primaryRole = getPrimaryRole(user)
      const dashboardRoute = getDashboardRoute(primaryRole)

      console.log('Dashboard redirect logic:', { primaryRole, dashboardRoute })

      if (dashboardRoute !== '/dashboard') {
        router.replace(dashboardRoute)
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="mt-20 text-center">
      <h1 className="text-2xl font-bold text-[#1a4c6e]">Mengalihkan ke dashboard Anda…</h1>
      <p className="mt-2 text-muted-foreground">Mohon tunggu sebentar</p>
    </div>
  )
}
