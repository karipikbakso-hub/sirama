// lib/auth/me.ts
import api from '../apiAuth'

export async function getUser() {
  const res = await api.get('/api/user')
  return res.data
}
