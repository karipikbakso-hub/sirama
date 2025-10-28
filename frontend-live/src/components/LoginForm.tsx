'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Dokter', value: 'dokter' },
  { label: 'Kasir', value: 'kasir' },
  { label: 'Laboratorium', value: 'labrad' },
  { label: 'Rawat Inap', value: 'rawatinap' },
  { label: 'Apoteker', value: 'apoteker' },
  { label: 'Pendaftaran', value: 'pendaftaran' },
  { label: 'Manajemen', value: 'manajemen' },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = () => {
    if (!selectedRole) return
    router.push(`/dashboard?role=${selectedRole}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 transition-colors duration-500">
      <div className={clsx(
        'w-full max-w-xl p-8 rounded-2xl shadow-xl border transition-all duration-700',
        'bg-gray-50 border-gray-200',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Masuk ke SIRAMA
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Pilih peran untuk melihat alur sistem sesuai role pengguna
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {roles.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedRole(value)}
              className={clsx(
                'px-4 py-2 rounded-lg border text-sm font-medium transition shadow-sm',
                selectedRole === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selectedRole}
          className={clsx(
            'w-full py-2 px-4 font-semibold rounded-lg shadow-sm transition',
            selectedRole
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          )}
        >
          Masuk sebagai {selectedRole ?? '...'}
        </button>
      </div>
    </main>
  )
}