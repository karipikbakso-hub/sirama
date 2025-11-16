import axios from 'axios'
import toast from 'react-hot-toast'

// Helper function to get CSRF token from cookies
const getCookieValue = (name: string): string | null => {
  if (typeof window === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
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

// Request interceptor with CSRF token and bearer token
api.interceptors.request.use(async (config) => {
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
