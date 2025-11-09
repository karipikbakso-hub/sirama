'use client'

import useAuth from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // ✅ Jangan redirect saat masih loading
    if (!user) router.push('/login')
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        Memuat sesi Anda...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 text-sm text-red-600 text-center">
        Silakan login untuk melihat dashboard sesuai role Anda.
      </div>
    )
  }

  return <>{children}</>
}