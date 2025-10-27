'use client'

import ThemeToggle from './ThemeToggle'
import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[var(--sirama-primary)] text-white shadow-sm">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Logo & Title */}
        <Link href="/" className="flex items-center gap-3">
          <div className="text-lg font-bold tracking-wide">SIRAMA</div>
          <div className="text-sm opacity-80 hidden sm:inline">Demo Fase 1</div>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* Tambahkan notifikasi, user menu, dll di sini */}
        </div>
      </div>
    </header>
  )
}
