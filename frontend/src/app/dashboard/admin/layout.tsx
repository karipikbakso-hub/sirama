'use client'

import '@/styles/globals.css'
import { ThemeProvider } from 'next-themes'
import { useTheme } from 'next-themes'
import { FiMoon, FiSun } from 'react-icons/fi'
import { FaUserCircle } from 'react-icons/fa'
import {
  FaUsers, FaChartBar, FaCog, FaFileAlt,
  FaClinicMedical, FaProcedures, FaPills, FaVial, FaCashRegister,
  FaTshirt, FaUtensils, FaHome, FaGraduationCap
} from 'react-icons/fa'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, memo } from 'react'
import MobileNav from '@/components/MobileNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const [modulTambahanOpen, setModulTambahanOpen] = useState(false)
  const modulTambahanLinks = [
    '/dashboard/admin/laundry',
    '/dashboard/admin/pos',
    '/dashboard/admin/property',
    '/dashboard/admin/elearning',
  ]

  useEffect(() => {
    setMounted(true)
    if (modulTambahanLinks.includes(pathname)) {
      setModulTambahanOpen(true)
    }
  }, [pathname])

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-satoshi antialiased bg-background text-foreground transition-colors duration-300 overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen bg-background text-foreground border-r border-border px-6 pt-6 pb-8 space-y-6 text-sm transition-colors duration-300">
              {/* Logo + garis bawah */}
              <div className="border-b border-border pb-4">
                <div className="flex justify-center items-center h-10">
                  <Link
                    href="/dashboard/admin"
                    className="text-2xl font-medium tracking-tight text-primary font-[ui-rounded,sans-serif] select-none"
                  >
                    SIRAMA
                  </Link>
                </div>
              </div>

              {/* Menu Sidebar */}
              <SidebarGroup
                title="Manajemen Sistem"
                items={[
                  { label: 'Pengguna & Role', icon: FaUsers, href: '/dashboard/admin/user' },
                  { label: 'Laporan & Statistik', icon: FaChartBar, href: '/dashboard/admin/laporan' },
                  { label: 'Pengaturan Sistem', icon: FaCog, href: '/dashboard/admin/pengaturan' },
                  { label: 'Audit Trail', icon: FaFileAlt, href: '/dashboard/admin/audit' },
                ]}
                pathname={pathname}
                defaultOpen
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
                defaultOpen
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

            {/* Konten utama */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="h-20 px-6 flex items-center justify-between bg-background border-b border-border z-30">
                <div className="md:hidden">
                <Link
                    href="/dashboard/admin"
                    className="text-xl font-semibold tracking-tight text-primary font-[ui-rounded,sans-serif] select-none"
                >
                    SIRAMA
                </Link>
                </div>
                <h1 className="text-xl font-medium tracking-wide text-muted-foreground hidden md:block">
                  Dashboard Admin
                </h1>

                <div className="flex items-center gap-4 relative">
                  {mounted && (
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="p-2 rounded bg-muted text-muted-foreground hover:ring-2 ring-blue-400 transition"
                    >
                      {theme === 'dark' ? <FiSun /> : <FiMoon />}
                    </button>
                  )}

                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:scale-105 transition"
                  >
                    <FaUserCircle className="w-6 h-6 text-inherit" />
                    <span className="font-medium">Tika</span>
                    <span className="text-xs">▾</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-popover text-popover-foreground border border-border rounded shadow text-sm z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-border">
                        <div className="font-semibold">Kartika Fajar</div>
                        <div className="text-xs text-muted-foreground">admin@sirama.com</div>
                      </div>
                      <a href="/profile" className="block px-4 py-2 hover:bg-muted">Edit profile</a>
                      <a href="/settings" className="block px-4 py-2 hover:bg-muted">Account settings</a>
                      <button
                        onClick={() => (location.href = '/login')}
                        className="w-full text-left px-4 py-2 hover:bg-muted"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Konten scrollable */}
              <main className="layout-main bg-muted">
                <div className="layout-container space-y-6 pt-0">
                  {children}
                </div>
              </main>
            </div>
          </div>

          {/* Footer nav mobile */}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
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