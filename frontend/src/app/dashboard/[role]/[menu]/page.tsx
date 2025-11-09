'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Define component map type
type ComponentMap = Record<string, Record<string, ComponentType<any>>>

// Dynamic imports for all role components
const components: ComponentMap = {
  // Doctor components
  dokter: {
    emr: dynamic(() => import('@/components/dashboard/dokter/emr/page')),
    cppt: dynamic(() => import('@/components/dashboard/dokter/cppt/page')),
    diagnosis: dynamic(() => import('@/components/dashboard/dokter/diagnosis/page')),
  },

  // Registration components
  pendaftaran: {
    registrasi: dynamic(() => import('@/components/dashboard/pendaftaran/registrasi/page')),
    pasien: dynamic(() => import('@/components/dashboard/pendaftaran/pasien/page')),
    antrian: dynamic(() => import('@/components/dashboard/pendaftaran/antrian/page')),
    'antrian-management': dynamic(() => import('@/components/dashboard/pendaftaran/antrian-management/page')),
    riwayat: dynamic(() => import('@/components/dashboard/pendaftaran/riwayat/page')),
    'registrasi-igd': dynamic(() => import('@/components/dashboard/pendaftaran/registrasi-igd/page')),
    rujukan: dynamic(() => import('@/components/dashboard/pendaftaran/rujukan/page')),
    appointment: dynamic(() => import('@/components/dashboard/pendaftaran/appointment/page')),
    sep: dynamic(() => import('@/components/dashboard/pendaftaran/sep/page')),
    'bpjs-integration': dynamic(() => import('@/components/dashboard/pendaftaran/bpjs-integration/page')),
    'master-data': dynamic(() => import('@/components/dashboard/pendaftaran/master-data/page')),
    notifications: dynamic(() => import('@/components/dashboard/pendaftaran/notifications/page')),
  },

  // Other roles can be added here
  admin: {},
  perawat: {},
  apoteker: {},
  kasir: {},
  manajemenrs: {},
}

export default function DynamicMenuPage() {
  const params = useParams()
  const role = params?.role as string
  const menu = params?.menu as string

  if (!role || !menu) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Parameter Tidak Valid
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Role atau menu tidak ditemukan dalam URL.
          </p>
        </div>
      </div>
    )
  }

  // Get the component for this role and menu
  const roleComponents = components[role]
  const Component = roleComponents?.[menu]

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Menu "{menu}" untuk role "{role}" belum diimplementasikan.
          </p>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Path: /dashboard/{role}/{menu}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <Component />
}
