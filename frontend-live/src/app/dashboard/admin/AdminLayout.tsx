'use client'

import { useState, useEffect } from 'react'
import SidebarAdmin from '@/components/SidebarAdmin'
import MobileNav from '@/components/MobileNav'
import { FaUserCircle } from 'react-icons/fa'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // prevent hydration mismatch

  return (
    <>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white transition">
                Dashboard Admin
              </h1>

              {/* Notifikasi */}
              <button
                className="relative text-xl hover:scale-105 transition"
                title="Notifikasi"
              >
                🔔
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>
            </div>

            {/* Avatar + Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm text-gray-800 dark:text-white hover:scale-105 transition"
              >
                <FaUserCircle className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                <span className="font-medium">Tika</span>
                <span className="text-xs">▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border rounded shadow text-sm z-50 transition-all duration-300 ease-in-out">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <div className="font-semibold">Kartika Fajar</div>
                    <div className="text-xs text-gray-500">admin@sirama.com</div>
                  </div>
                  <a href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Edit profile</a>
                  <a href="/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Account settings</a>
                  <button
                    onClick={() => location.href = '/login'}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
    </>
  )
}