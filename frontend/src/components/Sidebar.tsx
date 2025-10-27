'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  ListOrdered,
  Shield,
  Settings
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/pasien', label: 'Pasien', icon: <Users size={20} /> },
  { href: '/rekam-medis', label: 'Rekam Medis', icon: <FileText size={20} /> },
  { href: '/kasir', label: 'Kasir', icon: <CreditCard size={20} /> },
  { href: '/antrian', label: 'Antrian', icon: <ListOrdered size={20} /> },
  { href: '/audit', label: 'Audit', icon: <Shield size={20} /> },
  { href: '/settings', label: 'Settings', icon: <Settings size={20} /> }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-screen sticky top-0 border-r bg-white dark:bg-gray-900">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all
                ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <span className="shrink-0">{icon}</span>
              <span className="hidden md:inline truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
