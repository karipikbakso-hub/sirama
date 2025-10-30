'use client'

import SidebarDokter from '@/components/SidebarDokter'
import MobileNav from '@/components/MobileNav'
import { useState, useEffect } from 'react'
import { MdPerson, MdSettings, MdLogout } from 'react-icons/md'
import { useTheme } from 'next-themes'
import { FiMoon, FiSun } from 'react-icons/fi'

export default function DokterLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        <SidebarDokter />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-card text-card-foreground border-b border-border px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-semibold tracking-wide">Dashboard Dokter</h1>

            <div className="flex items-center gap-4">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded bg-muted text-muted-foreground hover:ring-2 ring-blue-400"
                  title="Toggle Mode"
                >
                  {theme === 'dark' ? <FiSun /> : <FiMoon />}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-muted-foreground"
                >
                  <div className="bg-blue-600 text-white rounded-full p-2">
                    <MdPerson className="text-lg" />
                  </div>
                  <span className="text-sm font-medium">Dokter SIRAMA</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground border border-border rounded shadow-lg text-sm z-50">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-muted-foreground">
                      <MdPerson className="text-lg text-inherit" />
                      View Profile
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-muted-foreground">
                      <MdSettings className="text-lg text-inherit" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => (location.href = '/login')}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-red-600"
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
          <main className="p-6 space-y-6">{children}</main>
        </div>
      </div>
      <MobileNav />
    </>
  )
}