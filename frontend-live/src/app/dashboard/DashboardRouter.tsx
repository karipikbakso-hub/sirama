'use client'

import { useSearchParams } from 'next/navigation'
import AdminDashboard from './admin'
// import DokterDashboard from './dokter'
// import PerawatDashboard from './perawat'

export default function DashboardRouter() {
  const params = useSearchParams()
  const role = params.get('role')

  switch (role) {
    case 'admin': return <AdminDashboard />
    // case 'dokter': return <DokterDashboard />
    // case 'perawat': return <PerawatDashboard />
    default: return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Role tidak dikenali atau belum didukung.
      </div>
    )
  }
}