import { useState } from 'react'
import { login } from './api'
import { LoginPayload, AuthResponse } from './types'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (payload: LoginPayload): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    const res = await login(payload)
    setLoading(false)
    if (!res.success) setError(res.message || 'Login gagal')
    return res
  }

  return { handleLogin, loading, error }
}
