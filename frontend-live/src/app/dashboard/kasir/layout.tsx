'use client'

import SidebarKasir from '@/components/SidebarKasir'
import MobileNav from '@/components/MobileNav'
import { useState } from 'react'
import { MdPerson, MdSettings, MdLogout } from 'react-icons/md'

export default function KasirLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <SidebarKasir />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
              Dashboard Kasir
            </h1>

            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
              >
                <div className="bg-blue-600 text-white rounded-full p-2">
                  <MdPerson className="text-lg" />
                </div>
                <span className="text-sm font-medium">Kasir SIRAMA</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg text-sm z-50">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                    <MdPerson className="text-lg text-gray-500" />
                    View Profile
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                    <MdSettings className="text-lg text-gray-500" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => (location.href = '/login')}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600"
                  >
                    <MdLogout className="text-lg" />
                    Log out
                  </button>
                </div>
              )}
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