'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, memo } from 'react'

import {
  FaUsers, FaChartBar, FaCog, FaFileAlt,
  FaClinicMedical, FaProcedures, FaPills, FaVial, FaCashRegister,
  FaTshirt, FaUtensils, FaHome, FaGraduationCap
} from 'react-icons/fa'

export default function SidebarAdmin() {
  const pathname = usePathname()
  const [modulTambahanOpen, setModulTambahanOpen] = useState(false)

  const modulTambahanLinks = [
    '/dashboard/admin/laundry',
    '/dashboard/admin/pos',
    '/dashboard/admin/property',
    '/dashboard/admin/elearning',
  ]

  useEffect(() => {
    if (modulTambahanLinks.includes(pathname)) {
      setModulTambahanOpen(true)
    }
  }, [pathname])

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-background text-foreground border-r border-border px-6 py-8 space-y-6 text-sm transition-colors duration-300">
      <Link
        href="/dashboard/admin"
        className="text-center text-4xl font-bold tracking-wide text-foreground select-none"
      >
        SIRAMA
      </Link>

      <SidebarGroup
        title="Manajemen Sistem"
        items={[
          { label: 'Pengguna & Role', icon: FaUsers, href: '/dashboard/admin/user' },
          { label: 'Laporan & Statistik', icon: FaChartBar, href: '/dashboard/admin/laporan' },
          { label: 'Pengaturan Sistem', icon: FaCog, href: '/dashboard/admin/pengaturan' },
          { label: 'Audit Trail', icon: FaFileAlt, href: '/dashboard/admin/audit' },
        ]}
        pathname={pathname}
        defaultOpen={true}
      />

      <SidebarGroup
        title="Modul Inti"
        items={[
          { label: 'Klinik', icon: FaClinicMedical, href: '/dashboard/admin/klinik' },
          { label: 'Rawat Inap', icon: FaProcedures, href: '/dashboard/admin/rawat' },
          { label: 'Farmasi', icon: FaPills, href: '/dashboard/admin/farmasi' },
          { label: 'Laboratorium', icon: FaVial, href: '/dashboard/admin/lab' },
          { label: 'Kasir', icon: FaCashRegister, href: '/dashboard/admin/kasir' },
        ]}
        pathname={pathname}
        defaultOpen={true}
      />

      <SidebarGroup
        title="Modul Tambahan"
        items={[
          { label: 'Laundry', icon: FaTshirt, href: '/dashboard/admin/laundry' },
          { label: 'POS', icon: FaUtensils, href: '/dashboard/admin/pos' },
          { label: 'Property', icon: FaHome, href: '/dashboard/admin/property' },
          { label: 'eLearning', icon: FaGraduationCap, href: '/dashboard/admin/elearning' },
        ]}
        pathname={pathname}
        defaultOpen={modulTambahanOpen}
        toggleable
        onToggle={() => setModulTambahanOpen(!modulTambahanOpen)}
      />
    </aside>
  )
}

const SidebarGroup = memo(function SidebarGroup({
  title,
  items,
  pathname,
  defaultOpen = true,
  toggleable = false,
  onToggle,
}: {
  title: string
  items: Array<{ label: string; icon: React.ElementType; href: string }>
  pathname: string
  defaultOpen?: boolean
  toggleable?: boolean
  onToggle?: () => void
}) {
  return (
    <div>
      <button
        onClick={toggleable ? onToggle : undefined}
        className="flex items-center justify-between w-full px-3 py-2 rounded text-muted-foreground hover:bg-muted transition"
      >
        <span className="text-xs uppercase tracking-wider">{title}</span>
        {toggleable && (
          <span className="text-xl">{defaultOpen ? '▾' : '▸'}</span>
        )}
      </button>

      {defaultOpen && (
        <nav className={`mt-2 space-y-1 ${toggleable ? 'pl-3 border-l border-border' : ''}`}>
          {items.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-300 ease-in-out ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="text-lg text-inherit" />
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
})