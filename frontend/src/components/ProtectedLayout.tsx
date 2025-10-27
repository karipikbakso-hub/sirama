'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedLayout({ children, allowedRoles = [] }: ProtectedLayoutProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    // Belum login
    if (!token || !role) {
      router.push('/login')
      return
    }

    // Role tidak diizinkan
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      router.push('/login')
      return
    }

    setAuthorized(true)
  }, [router, allowedRoles])

  if (!authorized) return null
  return <>{children}</>
}
