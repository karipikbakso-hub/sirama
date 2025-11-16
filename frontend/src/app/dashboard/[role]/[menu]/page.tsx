'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Define component map type
type ComponentMap = Record<string, Record<string, ComponentType<any>>>

// Dynamic imports for all role components
const components: ComponentMap = {
  // Doctor components - menggunakan file yang sudah ada di [role]/[menu]
  dokter: {
    emr: dynamic(() => import('../dokter/emr/page')),
    cppt: dynamic(() => import('../dokter/cppt/page')),
    diagnosis: dynamic(() => import('../dokter/diagnosis/page')),
    resep: dynamic(() => import('../dokter/resep/page')),
    'order-lab': dynamic(() => import('../dokter/order-lab/page')),
    'order-rad': dynamic(() => import('../dokter/order-rad/page')),
  },

  // Registration components - menggunakan file yang sudah ada di [role]/[menu]
  pendaftaran: {
    registrasi: dynamic(() => import('../pendaftaran/registrasi/page')),
    pasien: dynamic(() => import('../pendaftaran/pasien/page')),
    antrian: dynamic(() => import('../pendaftaran/antrian/page')),
    'antrian-management': dynamic(() => import('../pendaftaran/antrian-management/page')),
    riwayat: dynamic(() => import('../pendaftaran/riwayat/page')),
    'registrasi-igd': dynamic(() => import('../pendaftaran/registrasi-igd/page')),
    rujukan: dynamic(() => import('../pendaftaran/rujukan/page')),
    appointment: dynamic(() => import('../pendaftaran/appointment/page')),
    sep: dynamic(() => import('../pendaftaran/sep/page')),
    'bpjs-integration': dynamic(() => import('../pendaftaran/bpjs-integration/page')),
    'master-data': dynamic(() => import('../pendaftaran/master-data/page')),
    notifications: dynamic(() => import('../pendaftaran/notifications/page')),
  },

  // Admin components - menggunakan file yang sudah ada di [role]/[menu]
  admin: {
    user: dynamic(() => import('../admin/user/page')),
    role: dynamic(() => import('../admin/role/page')),
    audit: dynamic(() => import('../admin/audit/page')),
    backup: dynamic(() => import('../admin/backup/page')),
    settings: dynamic(() => import('../admin/settings/page')),
  },
  perawat: {
    ttv: dynamic(() => import('../perawat/ttv/page')),
    cppt: dynamic(() => import('../perawat/cppt/page')),
    emr: dynamic(() => import('../perawat/emr/page')),
    triase: dynamic(() => import('../perawat/triase/page')),
    'antrian-poli': dynamic(() => import('../perawat/antrian-poli/page')),
    'distribusi-obat': dynamic(() => import('../perawat/distribusi-obat/page')),
  },
  apoteker: {
    'order-resep': dynamic(() => import('../apoteker/order-resep/page')),
    'validasi-resep': dynamic(() => import('../apoteker/validasi-resep/page')),
    dispensing: dynamic(() => import('../apoteker/dispensing/page')),
    stok: dynamic(() => import('../apoteker/stok/page')),
    'mutasi-stok': dynamic(() => import('../apoteker/mutasi-stok/page')),
    penyerahan: dynamic(() => import('../apoteker/penyerahan/page')),
    permintaan: dynamic(() => import('../apoteker/permintaan/page')),
    resep: dynamic(() => import('../apoteker/resep/page')),
    'riwayat-resep': dynamic(() => import('../apoteker/riwayat-resep/page')),
    'obat-terpopuler': dynamic(() => import('../apoteker/obat-terpopuler/page')),
  },
  kasir: {
    billing: dynamic(() => import('../kasir/billing/page')),
    pembayaran: dynamic(() => import('../kasir/pembayaran/page')),
    kwitansi: dynamic(() => import('../kasir/kwitansi/page')),
    deposit: dynamic(() => import('../kasir/deposit/page')),
    tagihan: dynamic(() => import('../kasir/tagihan/page')),
    rekonsiliasi: dynamic(() => import('../kasir/rekonsiliasi/page')),
  },
  manajemenrs: {
    'kpi-bor': dynamic(() => import('../manajemenrs/kpi-bor/page')),
    'kpi-los': dynamic(() => import('../manajemenrs/kpi-los/page')),
    'analisis-bor': dynamic(() => import('../manajemenrs/analisis-bor/page')),
    'analisis-los': dynamic(() => import('../manajemenrs/analisis-los/page')),
    pendapatan: dynamic(() => import('../manajemenrs/pendapatan/page')),
    kepuasan: dynamic(() => import('../manajemenrs/kepuasan/page')),
    'indikator-kualitas': dynamic(() => import('../manajemenrs/indikator-kualitas/page')),
    kinerja: dynamic(() => import('../manajemenrs/kinerja/page')),
    sdm: dynamic(() => import('../manajemenrs/sdm/page')),
    laporan: dynamic(() => import('../manajemenrs/laporan/page')),
    'hasil-survey': dynamic(() => import('../manajemenrs/hasil-survey/page')),
  },
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
