'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '../lib/apiAuth'
import { queryClient } from '../lib/queryClient'

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '')
  }
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export default function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = useCallback(async () => {
    if (pathname === '/login' || pathname === '/') {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await api.get('/api/user')
      const userData = res.data?.user || res.data
      const userRole = userData.role || userData.roles?.[0]?.name?.toLowerCase() || 'user'
      setUser({ ...userData, role: userRole })
    } catch (err: any) {
      setUser(null)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router, pathname])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    setError(null)
    setLoading(true)

    try {
      await api.get('/sanctum/csrf-cookie')
      const rawToken = getCookie('XSRF-TOKEN')
      if (!rawToken) throw new Error('CSRF token not found.')

      const xsrfToken = decodeURIComponent(rawToken)
      const res = await api.post('/login', { email, password }, {
        headers: { 'X-XSRF-TOKEN': xsrfToken },
      })

      const userData = res.data

      if (!userData) {
        throw new Error('User not found in response')
      }

      const userRole = userData.role || userData.roles?.[0]?.name?.toLowerCase() || 'user'
      setUser({ ...userData, role: userRole })
      router.push(`/dashboard/${userRole}`)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    setLoading(true)
    try {
      // Get fresh CSRF token for logout
      await api.get('/sanctum/csrf-cookie')
      const rawToken = getCookie('XSRF-TOKEN')
      if (!rawToken) throw new Error('CSRF token not found.')

      const xsrfToken = decodeURIComponent(rawToken)

      await api.post('/logout', {}, {
        headers: { 'X-XSRF-TOKEN': xsrfToken },
      })

      setUser(null)
      queryClient.clear() // Membersihkan cache react-query

      // Clear all possible session-related cookies
      deleteCookie('laravel-session')
      deleteCookie('XSRF-TOKEN')

      // Clear any other potential session cookies
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim()
        if (cookieName.includes('session') || cookieName.includes('auth')) {
          deleteCookie(cookieName)
        }
      })

      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed')
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, error, login, logout }
}
