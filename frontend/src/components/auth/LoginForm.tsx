'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { getPrimaryRole, getDashboardRoute } from '@/lib/roleUtils'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, fetchUser, isLoading, error } = useAuthStore()
  const router = useRouter()

  // Show error message
  const errorMessage = error || null

  const handleLogin = async (formData: FormData) => {
    const email = (formData.get('email') as string)?.trim()
    const password = (formData.get('password') as string)?.trim()

    // Form validation
    if (!email) {
      alert('Email wajib diisi')
      return
    }
    if (!password) {
      alert('Kata sandi wajib diisi')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Format email tidak valid')
      return
    }

    try {
      // 1. Login first (get token + basic user data)
      await login(email, password)

      // 2. CRITICAL: Fetch full user data with roles & permissions
      await fetchUser()

      // 3. Get user data and determine dashboard route based on role
      const userData = useAuthStore.getState().user
      const primaryRole = getPrimaryRole(userData)
      const dashboardRoute = getDashboardRoute(primaryRole)

      console.log('Login redirect:', { userData, primaryRole, dashboardRoute })

      // 4. Set login success flag for AuthProvider (if needed)
      localStorage.setItem('sirama-login-success', 'true')

      // 5. Redirect to role-specific dashboard
      router.push(dashboardRoute)
    } catch (err: any) {
      console.error('Login error:', err)
      alert(err?.response?.data?.message || err?.message || 'Login gagal. Silakan coba lagi.')
    }
  }

  // Calculate button state based on form data
  const isFormValid = (email: string, password: string) => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    return trimmedEmail && trimmedPassword && /\S+@\S+\.\S+/.test(trimmedEmail)
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

          {/* Form - Server Action */}
          <form action={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-[#131a13] border border-green-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none placeholder:text-gray-500 text-sm transition duration-200"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full px-4 py-3 pr-12 bg-[#131a13] border border-green-800 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none placeholder:text-gray-500 text-sm transition duration-200"
                  placeholder="Masukkan kata sandi"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-700 rounded-full p-1 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-amber-400"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 0a10.547 10.547 0 01-7.894 0m7.894 0l3.65 3.65m-7.894 0L9.878 9.878" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-amber-400"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-700 via-amber-700 to-green-800 hover:from-green-800 hover:via-amber-800 hover:to-green-900 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-amber-800/40 transition duration-300 disabled:opacity-60 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
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
