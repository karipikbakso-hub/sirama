import { create } from 'zustand'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  name: string
  email: string
  role?: string
  roles?: string[]
  permissions?: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  hydrate: () => void  // ← NEW: Safe hydration method
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false, // ← FIXED: Don't access localStorage in SSR
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // Get CSRF token first (absolute URL tanpa prefix)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'
      await api.get(`${baseUrl}/sanctum/csrf-cookie`)

      const response = await api.post('/auth/login', { email, password })
      const { data } = response.data
      const { user, token } = data

      // Normalize user data structure
      const normalizedUser = {
        ...user,
        roles: user.roles || (user.role ? [user.role] : []),
        permissions: user.permissions || []
      }

      // Simpan token di localStorage dan cookies
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      document.cookie = `token=${token}; path=/; max-age=86400` // 1 hari

      set({ user: normalizedUser, token, isLoading: false, isAuthenticated: true })
      toast.success('Login berhasil!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal'
      set({ error: message, isLoading: false })
      toast.error(message)
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear storage meski error
      localStorage.removeItem('token')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      set({ user: null, token: null, isLoading: false, isAuthenticated: false })
      toast.success('Logout berhasil!')
    }
  },

  hydrate: () => {
    // Safe localStorage access - only on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const userString = localStorage.getItem('user')

      if (token) {
        try {
          const user = userString ? JSON.parse(userString) : null
          set({
            token,
            user,
            isAuthenticated: true
          })
        } catch (error) {
          // Invalid stored user data, clear it
          localStorage.removeItem('user')
          set({
            token,
            user: null,
            isAuthenticated: true
          })
        }
      }
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/api/user')
      const userData = response.data

      const normalizedUser = {
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        role: userData.roles?.[0] || 'user',  // ← FIX: Extract first role as string
        roles: userData.roles || [],           // ← Roles array
        permissions: userData.permissions || []
      }

      localStorage.setItem('user', JSON.stringify(normalizedUser)) // ← Update localStorage too

      set({ user: normalizedUser, token, isLoading: false, isAuthenticated: true })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengambil data user'
      set({ error: message, isLoading: false })
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null, isAuthenticated: false })
      }
      throw error
    }
  },
}))
