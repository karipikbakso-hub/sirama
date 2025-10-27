'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { handleLogin, loading, error } = useAuth()
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await handleLogin({ username, password })
    if (res.success && res.role) {
      localStorage.setItem('role', res.role)
      localStorage.setItem('token', res.token || '')
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 w-80 mx-auto">
      <h1 className="text-xl font-bold text-center">Login SIRAMA</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? 'Memproses...' : 'Login'}
      </button>
    </form>
  )
}
