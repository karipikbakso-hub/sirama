import axios from 'axios'

const api = axios.create({
  baseURL: typeof window !== 'undefined' ? 'http://localhost:8000' : '',
  withCredentials: true,
})

export async function login(email: string, password: string) {
  // First get the CSRF cookie
  await api.get('/sanctum/csrf-cookie')

  // Then login using the web route
  const res = await api.post('/login', { email, password })

  // Get user data after login
  const userRes = await api.get('/api/user')
  const userData = userRes.data

  return {
    ...res.data,
    user: userData
  }
}
