import { LoginPayload, AuthResponse } from './types'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  // Simulasi login, ganti dengan fetch Laravel nanti
  const { username, password } = payload
  if (username === 'admin' && password === 'admin123') {
    return {
      success: true,
      role: 'admin',
      token: 'token-admin',
    }
  }
  if (username === 'kasir' && password === 'kasir123') {
    return {
      success: true,
      role: 'kasir',
      token: 'token-kasir',
    }
  }
  return {
    success: false,
    message: 'Username atau password salah',
  }
}
