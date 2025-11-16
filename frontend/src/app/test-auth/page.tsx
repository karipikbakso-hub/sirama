'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function TestAuthPage() {
  const { user, isAuthenticated, login, logout, fetchUser } = useAuth()
  const [email, setEmail] = useState('testauth@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await login(email, password)
      await fetchUser()
      alert('Login success!')
    } catch (error: any) {
      alert('Login failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    alert('Logged out!')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Testing Page</h1>

      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded">
            <p className="font-bold">✓ Authenticated</p>
            <pre className="text-sm mt-2">{JSON.stringify(user, null, 2)}</pre>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </div>
      )}
    </div>
  )
}
