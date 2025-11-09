import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
})

export async function login(email: string, password: string) {
  // First get the CSRF cookie
  await api.get('/sanctum/csrf-cookie')

  // Then login using the web route
  const res = await api.post('/login', { email, password })
  return res.data
}
