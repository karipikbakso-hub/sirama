'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/hooks/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, error, loading, user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.role}`)
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  if (user) {
    return (
      <div className="w-full max-w-md text-center py-6">
        <p className="text-gray-400 text-sm animate-pulse">Mengalihkan ke dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f0a] via-[#111a11] to-[#1a1f1a] text-gray-100 px-4 overflow-hidden">
      {/* efek animasi latar */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,100,0,0.15),transparent_60%)]"></div>

      <div className="w-full max-w-md relative group">
        {/* efek cahaya luar */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-700 via-amber-600 to-green-800 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-700"></div>

        {/* Card utama */}
        <div className="relative bg-[#0f1510]/90 backdrop-blur-xl border border-green-900/40 rounded-2xl shadow-2xl p-8 transition duration-500">
          {/* Header Logo / Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-700 via-amber-600 to-green-800 flex items-center justify-center shadow-2xl shadow-green-900/60 border-4 border-amber-400/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-amber-200"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 0l3 3m-3-3l-3 3m15.364 6.364l-3-3m3 3l-3 3m-12-3l3-3m3 3l3-3" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold tracking-wider bg-gradient-to-r from-amber-400 via-green-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg mb-2">
              SIRAMA
            </h2>
            <p className="text-sm text-gray-400 tracking-wide px-4">
              Sistem Informasi Rumah Sakit Adaptif Modular
            </p>
            <div className="mt-3 px-3 py-1 bg-green-900/20 border border-green-700/30 rounded-full">
              <p className="text-xs text-green-300 font-medium">Hospital Information System</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg animate-pulse">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#131a13] border border-green-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none placeholder:text-gray-500 text-sm transition duration-200"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Kata Sandi</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-[#131a13] border border-green-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none placeholder:text-gray-500 text-sm transition duration-200"
                  placeholder="Masukkan kata sandi"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-amber-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 via-amber-700 to-green-800 hover:from-green-800 hover:via-amber-800 hover:to-green-900 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-amber-800/40 transition duration-300 disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk ke Sistem'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>© 2025 SIRAMA — All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  )
}
