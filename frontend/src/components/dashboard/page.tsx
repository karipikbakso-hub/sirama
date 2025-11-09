'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

export default function DashboardFallback() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const role = user.roles?.[0]?.name?.toLowerCase()
      if (role) router.replace(`/dashboard/${role}`)
    }
  }, [user, loading, router])

  return (
    <div className="mt-20 text-center">
      <h1 className="text-2xl font-bold text-[#1a4c6e]">Mengalihkan ke dashboard Anda…</h1>
      <p className="mt-2 text-muted-foreground">Mohon tunggu sebentar</p>
    </div>
  )
}