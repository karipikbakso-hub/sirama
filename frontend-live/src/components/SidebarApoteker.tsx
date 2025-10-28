'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'
import {
  MdEditDocument,
  MdLocalPharmacy,
  MdInventory,
  MdOutbound,
  MdHistory,
  MdBarChart,
} from 'react-icons/md'

export default function SidebarApoteker() {
  const pathname = usePathname()

  const items = [
    { label: 'Entry Resep', icon: MdEditDocument, href: '/dashboard/apoteker/resep' },
    { label: 'Penyerahan Obat', icon: MdLocalPharmacy, href: '/dashboard/apoteker/penyerahan' },
    { label: 'Stok Gudang', icon: MdInventory, href: '/dashboard/apoteker/stok' },
    { label: 'Permintaan Obat', icon: MdOutbound, href: '/dashboard/apoteker/permintaan' },
    { label: 'Riwayat Resep', icon: MdHistory, href: '/dashboard/apoteker/riwayat-resep' },
    { label: 'Obat Terpopuler', icon: MdBarChart, href: '/dashboard/apoteker/obat-terpopuler' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-700 px-6 py-8 space-y-6 text-sm">
      <Link
        href="/dashboard/apoteker"
        className="text-center text-4xl font-bold tracking-wide text-gray-800 dark:text-white select-none"
      >
        SIRAMA
      </Link>

      <SidebarGroup title="Modul Apoteker" items={items} pathname={pathname} />
    </aside>
  )
}

const SidebarGroup = memo(function SidebarGroup({
  title,
  items,
  pathname,
}: {
  title: string
  items: Array<{ label: string; icon: React.ElementType; href: string }>
  pathname: string
}) {
  return (
    <div>
      <div className="px-3 py-2 text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
        {title}
      </div>

      <nav className="mt-1 space-y-1">
        {items.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-300 ease-in-out ${
              pathname === href
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="text-lg" />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
})