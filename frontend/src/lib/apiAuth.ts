// lib/apiAuth.ts
import axios from 'axios'

// Helper function to get CSRF token from cookies
const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

const api = axios.create({
  baseURL: typeof window !== 'undefined' ? 'http://localhost:8000/api' : '/api',
  withCredentials: true, // penting untuk cookie/session SPA
  headers: {
    'Cache-Control': 'public, max-age=300', // 5 minute cache untuk GET requests
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Add request interceptor to include CSRF token and auth token
api.interceptors.request.use((config) => {
  // Include auth token if available
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // For state-changing operations, include CSRF token
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCookieValue('XSRF-TOKEN')
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
    }
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// Helper function to get fresh CSRF token
export const getCsrfToken = async () => {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    // Small delay to ensure cookie is set
    await new Promise(resolve => setTimeout(resolve, 100))
  } catch (error) {
    console.warn('Failed to get CSRF token:', error)
    throw error
  }
}

export default api
