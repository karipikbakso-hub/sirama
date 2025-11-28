import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'

// Helper function to get CSRF token from cookies
const getCookieValue = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

// Helper function to extract role from API URL
const extractRoleFromApiUrl = (url: string): string | null => {
  // Pattern: /api/{role}/* or /api/dashboard/{role}/*
  const patterns = [
    /^\/api\/(\w+)\//,
    /^\/api\/dashboard\/(\w+)\//,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  return null
}

// Helper function to check if user has access to API role
const hasApiAccess = (userRole: string, requestedRole: string): boolean => {
  // Admin can access all roles
  if (userRole === 'admin') return true

  // Allow access to master data APIs for all roles
  const masterDataRoles = ['wilayah', 'polis', 'doctors', 'queue', 'pendaftaran']
  if (masterDataRoles.includes(requestedRole)) return true

  // Allow pendaftaran role to access registrations API
  if (userRole === 'pendaftaran' && requestedRole === 'registrations') return true

  // User can only access their own role
  return userRole === requestedRole
}

// Axios instance untuk session-based authentication dengan Sanctum
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true, // PENTING untuk Sanctum session
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
})

// Request interceptor with CSRF token, bearer token, and role validation
api.interceptors.request.use(async (config) => {
  // 🔐 ROLE VALIDATION - Prevent API calls to wrong role
  if (config.url?.startsWith('/api/') && !config.url?.includes('/auth/')) {
    try {
      const requestedRole = extractRoleFromApiUrl(config.url)
      
      if (requestedRole) {
        // Get current user from auth store
        const { user } = useAuthStore.getState()
        const userRole = (user?.role as string) || 'user'
        
        console.log('🔐 API Role validation:', {
          url: config.url,
          requestedRole,
          userRole,
          hasAccess: hasApiAccess(userRole, requestedRole)
        })
        
        if (!hasApiAccess(userRole, requestedRole)) {
          console.log(`🚫 Blocking API call: User role '${userRole}' trying to access '${requestedRole}' API`)
          
          // Create a custom error that won't make it to the server
          const roleError = new Error(`ROLE_MISMATCH: User role '${userRole}' cannot access '${requestedRole}' API`)
          roleError.name = 'RoleMismatchError'
          throw roleError
        }
      }
    } catch (error) {
      if ((error as any).name === 'RoleMismatchError') {
        throw error
      }
      console.error('Role validation error:', error)
      // Continue with request if role validation fails
    }
  }

  // Untuk POST/PUT/PATCH/DELETE, ambil CSRF token
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    try {
      // Get CSRF cookie
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Extract XSRF-TOKEN from cookies
      const cookies = document.cookie.split('; ');
      const xsrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='));

      if (xsrfCookie) {
        const token = xsrfCookie.split('=')[1];
        // IMPORTANT: Use exact header name Laravel expects
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
      }
    } catch (error) {
      console.error('CSRF cookie fetch failed:', error);
    }
  }

  // Attach bearer token if exists
  const authToken = localStorage.getItem('token');
  if (authToken) {
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }

  // DEBUG: Log headers before request
  console.log('Request URL:', config.url);
  console.log('Request Headers:', config.headers);

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle 401 but not for login endpoint
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jangan redirect jika error dari login endpoint sendiri
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('401 error detected, redirecting to login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      toast.error('Sesi berakhir, silakan login kembali')
    }
    return Promise.reject(error)
  }
)

export default api
