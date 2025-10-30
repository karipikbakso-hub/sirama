'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import {
  MdMonitorHeart,
  MdFavorite,
  MdMeetingRoom,
  MdPerson,
  MdSettings,
  MdLogout,
  MdDarkMode,
  MdLightMode,
} from 'react-icons/md'
import MobileNav from '@/components/MobileNav'

export default function PerawatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const items = [
    { label: 'Monitoring Pasien', icon: MdMonitorHeart, href: '/dashboard/perawat/monitoring' },
    { label: 'Tanda Vital', icon: MdFavorite, href: '/dashboard/perawat/vital' },
    { label: 'Status Kamar', icon: MdMeetingRoom, href: '/dashboard/perawat/kamar' },
  ]

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border px-6 py-8 space-y-6 text-sm">
          <Link href="/dashboard/perawat" className="text-center text-4xl font-bold tracking-wide select-none">
            SIRAMA
          </Link>

          <div>
            <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">Modul Perawat</div>
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
                    <Icon className="text-lg text-inherit" />
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
            <h1 className="text-xl font-semibold tracking-wide">Dashboard Perawat</h1>

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
                  <span className="text-sm font-medium">Perawat SIRAMA</span>
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