// lib/auth/logout.ts
import api from '../apiAuth'

export async function logout() {
  await api.post('/api/logout')
}
