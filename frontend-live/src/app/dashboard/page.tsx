'use client'

import { useSearchParams } from 'next/navigation'
import AdminDashboard from './admin'
// (tambahkan import dashboard lain kalau perlu)

export default function DashboardPage() {
  const params = useSearchParams()
  const role = params.get('role')

  switch (role) {
    case 'admin': return <AdminDashboard />
    // case 'dokter': return <DokterDashboard />
    // dst...
    default: return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Role tidak dikenali atau belum didukung.
      </div>
    )
  }
}