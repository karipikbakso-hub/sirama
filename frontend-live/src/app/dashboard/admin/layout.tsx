'use client'

import '@/styles/globals.css'
import SidebarAdmin from '@/components/SidebarAdmin'
import MobileNav from '@/components/MobileNav'
import { ThemeProvider } from 'next-themes'
import { useTheme } from 'next-themes'
import { FiMoon, FiSun } from 'react-icons/fi'
import { FaUserCircle } from 'react-icons/fa'
import { useState, useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-satoshi antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen">
            <SidebarAdmin />
            <div className="flex-1 flex flex-col">
              <header className="sticky top-0 z-30 bg-card text-card-foreground border-b border-border px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <h1 className="text-xl font-semibold tracking-wide">Dashboard Admin</h1>
                  <button className="relative text-xl hover:scale-105 transition">🔔</button>
                </div>

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

              <main className="p-6 space-y-6">{children}</main>
            </div>
          </div>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  )
}