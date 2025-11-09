'use client'

import useAuth from '@/hooks/useAuth'

export default function RoleDashboardClient({ role }: { role: string }) {
  const { user, loading } = useAuth()

  if (!role) {
    return (
      <p className="text-center text-red-600 text-sm py-8">
        ⚠️ Role tidak ditemukan di URL. Silakan login ulang.
      </p>
    )
  }

  if (loading) {
    return (
      <p className="text-center text-sm text-gray-500 py-8">
        Memuat sesi Anda...
      </p>
    )
  }

  if (!user) {
    return (
      <p className="text-center text-red-600 text-sm py-8">
        Silakan login untuk melihat dashboard sesuai role Anda.
      </p>
    )
  }

  const userRole = user.roles?.[0]?.toLowerCase() || ''
  const isAllowed = userRole === role

  if (!isAllowed) {
    return (
      <p className="text-center text-red-600 text-sm py-8">
        ⚠️ Anda tidak memiliki akses ke role <strong>{role}</strong>. Login ulang atau hubungi admin.
      </p>
    )
  }

  return (
    <div className="text-sm text-gray-700 text-center py-8">
      Ini dashboard utama untuk role: <strong className="text-blue-700">{role}</strong>
    </div>
  )
}