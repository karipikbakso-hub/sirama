'use client'

import { Suspense, lazy } from 'react'
import { menuByRole, MenuItem } from '@/lib/menuByRole'
import { capitalize } from '@/lib/utils'

// Lazy load 7 main role dashboards (Kemenkes Standards)
const AdminDashboard = lazy(() => import('@/app/dashboard/[role]/admin/page'))
const PendaftaranDashboard = lazy(() => import('@/app/dashboard/[role]/pendaftaran/page'))
const DokterDashboard = lazy(() => import('@/app/dashboard/[role]/dokter/page'))
const PerawatDashboard = lazy(() => import('@/app/dashboard/[role]/perawat/page'))
const ApotekerDashboard = lazy(() => import('@/app/dashboard/[role]/apoteker/page'))
const KasirDashboard = lazy(() => import('@/app/dashboard/[role]/kasir/page'))
const ManajemenRsDashboard = lazy(() => import('@/app/dashboard/[role]/manajemenrs/page'))

// Lazy load admin modules
const AdminUserPage = lazy(() => import('@/app/dashboard/[role]/admin/user/page'))
const AdminRolePage = lazy(() => import('@/app/dashboard/[role]/admin/role/page'))
const AdminAuditPage = lazy(() => import('@/app/dashboard/[role]/admin/audit/page'))
const AdminBackupPage = lazy(() => import('@/app/dashboard/[role]/admin/backup/page'))
const AdminSettingsPage = lazy(() => import('@/app/dashboard/[role]/admin/settings/page'))

// Lazy load pendaftaran modules
const RegistrasiPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/registrasi/page'))
const PasienPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/pasien/page'))
const AntrianPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/antrian/page'))
const SEPPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/sep/page'))
const KPIPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/kpi/page'))
const RiwayatPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/riwayat/page'))
const RegistrasiIGDPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/registrasi-igd/page'))
const AntrianManagementPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/antrian-management/page'))
const RujukanPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/rujukan/page'))
const MasterDataPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/master-data/page'))
const NotificationsPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/notifications/page'))
const MobileJKNPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/mobile-jkn/page'))
const AppointmentPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/appointment/page'))
const BPJSIntegrationPage = lazy(() => import('@/app/dashboard/[role]/pendaftaran/bpjs-integration/page'))

// Lazy load doctor modules
const EMRPage = lazy(() => import('@/app/dashboard/[role]/dokter/emr/page'))
const CPPTPage = lazy(() => import('@/app/dashboard/[role]/dokter/cppt/page'))
const DiagnosisPage = lazy(() => import('@/app/dashboard/[role]/dokter/diagnosis/page'))
const ResepPage = lazy(() => import('@/app/dashboard/[role]/dokter/resep/page'))
const OrderLabPage = lazy(() => import('@/app/dashboard/[role]/dokter/order-lab/page'))
const OrderRadPage = lazy(() => import('@/app/dashboard/[role]/dokter/order-rad/page'))

interface ModularDashboardProps {
  role: string
  module?: string
}

export default function ModularDashboard({ role, module }: ModularDashboardProps) {
  const renderDashboard = () => {
    // Handle module routing for admin
    if (role === 'admin' && module) {
      switch (module) {
        case 'user':
          return <AdminUserPage />
        case 'role':
          return <AdminRolePage />
        case 'audit':
          return <AdminAuditPage />
        case 'backup':
          return <AdminBackupPage />
        case 'settings':
          return <AdminSettingsPage />
        default:
          return <AdminDashboard />
      }
    }

    // Handle module routing for pendaftaran
    if (role === 'pendaftaran' && module) {
      switch (module) {
        case 'registrasi':
          return <RegistrasiPage />
        case 'pasien':
          return <PasienPage />
        case 'antrian':
          return <AntrianPage />
        case 'sep':
          return <SEPPage />
        case 'kpi':
          return <KPIPage />
        case 'riwayat':
          return <RiwayatPage />
        case 'registrasi-igd':
          return <RegistrasiIGDPage />
        case 'antrian-management':
          return <AntrianManagementPage />
        case 'rujukan':
          return <RujukanPage />
        case 'master-data':
          return <MasterDataPage />
        case 'notifications':
          return <NotificationsPage />
        case 'mobile-jkn':
          return <MobileJKNPage />
        case 'appointment':
          return <AppointmentPage />
        case 'bpjs-integration':
          return <BPJSIntegrationPage />
        default:
          return <PendaftaranDashboard />
      }
    }

    // Handle module routing for dokter
    if (role === 'dokter' && module) {
      switch (module) {
        case 'emr':
          return <EMRPage />
        case 'cppt':
          return <CPPTPage />
        case 'diagnosis':
          return <DiagnosisPage />
        case 'resep':
          return <ResepPage />
        case 'order-lab':
          return <OrderLabPage />
        case 'order-rad':
          return <OrderRadPage />
        default:
          return <DokterDashboard />
      }
    }

    switch (role) {
      case 'admin':
        return <AdminDashboard />
      case 'pendaftaran':
        return <PendaftaranDashboard />
      case 'dokter':
        return <DokterDashboard />
      case 'perawat':
        return <PerawatDashboard />
      case 'apoteker':
        return <ApotekerDashboard />
      case 'kasir':
        return <KasirDashboard />
      case 'manajemenrs':
        return <ManajemenRsDashboard />
      default:
        return <GenericDashboard role={role} />
    }
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    }>
      {renderDashboard()}
    </Suspense>
  )
}

// Fallback component for roles without specific dashboards
function GenericDashboard({ role }: { role: string }) {
  const menuItems = menuByRole[role] || []
  const flatMenuItems = menuItems.filter((item): item is MenuItem => 'icon' in item)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard {capitalize(role)}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Selamat datang — berikut ringkasan aktivitas Anda.
        </p>
      </div>

      {/* Card Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {flatMenuItems.slice(0, 4).map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <item.icon className="text-xl text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="font-medium text-gray-800 dark:text-white">–</p>
              </div>
            </div>
          </div>
        ))}
        {flatMenuItems.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            Tidak ada menu tersedia untuk role ini.
          </div>
        )}
      </div>

      <div className="mt-6 text-gray-500 dark:text-gray-400">
        <p>🛠️ Catatan: Dashboard ini masih dalam pengembangan. Konten akan disesuaikan berdasarkan role Anda.</p>
      </div>
    </div>
  )
}
