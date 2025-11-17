'use client'

import { useAuthStore } from '@/store/auth'
import { useRouter, usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isHydrated, isLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Wait until hydration is complete before checking auth
    if (!isHydrated) return

    // Only redirect if we're sure authentication is complete
    if (!isAuthenticated && !hasRedirected) {
      console.log('ProtectedLayout: User not authenticated, redirecting to login')
      setHasRedirected(true)
      router.push('/login')
    }
  }, [isAuthenticated, isHydrated, hasRedirected, router])

  if (isLoading) {
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
