'use client'

import { createContext, useContext, useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

// Global auth state to prevent provider remount issues
interface AuthState {
  user: any
  loading: boolean
  error: string | null
}

class AuthManager {
  private authState: AuthState = {
    user: null,
    loading: true,
    error: null
  }
  private listeners: Set<(state: AuthState) => void> = new Set()
  private hasFetched = false

  // Singleton: AuthManager persists across re-mounts
  constructor() {
    // If already has user, don't fetch again (persist login state)
    if (typeof window !== 'undefined' && window.localStorage.getItem('sirama-auth-persist')) {
      try {
        const persisted = JSON.parse(window.localStorage.getItem('sirama-auth-persist')!)
        if (persisted.user) {
          this.authState = persisted.authState
          this.hasFetched = persisted.hasFetched
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.authState))
  }

  getState(): AuthState {
    return { ...this.authState }
  }

  async fetchUser() {
    if (this.hasFetched) return

    this.hasFetched = true
    this.authState.loading = true
    this.notify()

    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

      const res = await api.get('/api/user', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache', // Important for Sanctum
        }
      })

      clearTimeout(timeoutId)

      const userData = res.data?.user || res.data
      const userRole = userData.role || userData.roles?.[0]?.name?.toLowerCase() || 'user'

      this.authState.user = { ...userData, role: userRole }
      this.authState.error = null

      // Persist auth state in sessionStorage for recovery
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sirama-auth-recovery', JSON.stringify({
          user: this.authState.user,
          timestamp: Date.now()
        }))
      }

    } catch (err: any) {
      console.warn('Auth fetchUser failed:', err.message)

      // Timeout or network error - set loading false after brief delay
      if (err.name === 'AbortError') {
        console.log('Auth fetch timed out, forcing loading=false')
      }

      this.authState.error = err.response?.data?.message || 'Authentication failed'
      this.authState.user = null

      // Don't redirect immediately - let layout handle on 401
    } finally {
      this.authState.loading = false
      this.notify()
    }
  }

  setUser(user: any) {
    this.authState.user = user
    this.authState.error = null
    this.notify()
  }

  setError(error: string | null) {
    this.authState.error = error
    this.notify()
  }

  setLoading(loading: boolean) {
    this.authState.loading = loading
    this.notify()
  }
}

// Singleton AuthManager instance
let authManagerInstance: AuthManager | null = null

function getAuthManager(): AuthManager {
  if (!authManagerInstance) {
    authManagerInstance = new AuthManager()
  }
  return authManagerInstance
}

const AuthContext = createContext<{
  user: any
  loading: boolean
  error: string | null
  logout: () => Promise<void>
} | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const authManager = getAuthManager()
  const [state, setState] = useState<AuthState>(authManager.getState())

  useEffect(() => {
    // Subscribe to auth manager changes
    const unsubscribe = authManager.subscribe(setState)

    // SKIP auto fetch when on login page
    const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login'
    if (isOnLoginPage) {
      console.log('On login page - skipping auto fetchUser')
      setState(prev => ({ ...prev, loading: false }))
      return unsubscribe
    }

    // Only fetch if we have a successful login indication
    const hasLoginSuccess = typeof window !== 'undefined' &&
                           sessionStorage.getItem('sirama-login-success')

    if (!hasLoginSuccess) {
      console.log('No login success flag - skipping fetchUser')
      setState(prev => ({ ...prev, loading: false }))
      return unsubscribe
    }

    // Force loading timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('AuthProvider: Forcing loading=false due to timeout')
      setState(prev => ({ ...prev, loading: false }))
    }, 10000)

    // Initialize auth
    authManager.fetchUser().finally(() => {
      // Clear success flag after fetch (prevent re-fetch on remount)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sirama-login-success')
      }
      clearTimeout(timeoutId)
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

  const logout = async () => {
    const authManagerInstance = getAuthManager()
    authManagerInstance.setError(null)
    authManagerInstance.setLoading(true)

    try {
      await api.get('/sanctum/csrf-cookie')
      const rawToken = getCookie('XSRF-TOKEN')
      if (!rawToken) throw new Error('CSRF token not found.')

      const xsrfToken = decodeURIComponent(rawToken)
      await api.post('/logout', {}, { headers: { 'X-XSRF-TOKEN': xsrfToken } })

      // Clear all auth state immediately
      authManagerInstance.setUser(null)
      queryClient.clear()

      // Clear all auth-related session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('sirama-login-success')
        sessionStorage.removeItem('sirama-auth-recovery')
        localStorage.removeItem('sirama-auth-persist')
      }

      // Clear all auth cookies
      const allCookies = document.cookie.split(';')
      allCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim()
        deleteCookie(cookieName)
      })

      // Full page redirect to clear ALL client state
      window.location.href = '/login'
    } catch (err: any) {
      console.error('Logout failed:', err)
      authManagerInstance.setError('Logout failed')
    } finally {
      authManagerInstance.setLoading(false)
    }
  }

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
