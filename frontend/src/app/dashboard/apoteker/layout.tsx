'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import {
  MdEditDocument,
  MdLocalPharmacy,
  MdInventory,
  MdOutbound,
  MdHistory,
  MdBarChart,
  MdPerson,
  MdSettings,
  MdLogout,
  MdDarkMode,
  MdLightMode,
} from 'react-icons/md'
import MobileNav from '@/components/MobileNav'

export default function ApotekerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const items = [
    { label: 'Entry Resep', icon: MdEditDocument, href: '/dashboard/apoteker/resep' },
    { label: 'Penyerahan Obat', icon: MdLocalPharmacy, href: '/dashboard/apoteker/penyerahan' },
    { label: 'Stok Gudang', icon: MdInventory, href: '/dashboard/apoteker/stok' },
    { label: 'Permintaan Obat', icon: MdOutbound, href: '/dashboard/apoteker/permintaan' },
    { label: 'Riwayat Resep', icon: MdHistory, href: '/dashboard/apoteker/riwayat-resep' },
    { label: 'Obat Terpopuler', icon: MdBarChart, href: '/dashboard/apoteker/obat-terpopuler' },
  ]

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border px-6 py-8 space-y-6 text-sm">
          <Link href="/dashboard/apoteker" className="text-center text-4xl font-bold tracking-wide select-none">
            SIRAMA
          </Link>

          <div>
            <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">Modul Apoteker</div>
            <nav className="mt-1 space-y-1">
              {items.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-300 ease-in-out ${
                      isActive
                        ? 'bg-accent text-primary border border-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span className="text-sm">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-card border-b px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-semibold tracking-wide">Dashboard Apoteker</h1>

            <div className="flex items-center gap-4">
              {/* Toggle Dark Mode */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded hover:bg-muted text-muted-foreground"
              >
                {theme === 'dark' ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-muted-foreground"
                >
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <MdPerson className="text-lg" />
                  </div>
                  <span className="text-sm font-medium">Apoteker SIRAMA</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded shadow-lg text-sm z-50">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left">
                      <MdPerson className="text-lg text-muted-foreground" />
                      View Profile
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left">
                      <MdSettings className="text-lg text-muted-foreground" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => (location.href = '/login')}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-destructive"
                    >
                      <MdLogout className="text-lg" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="layout-container py-6 space-y-6">{children}</main>
        </div>
      </div>

      <MobileNav />
    </>
  )
}