'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'
import {
  MdDescription,
  MdNoteAlt,
  MdPsychology,
  MdHistory,
  MdScience,
} from 'react-icons/md'

export default function SidebarDokter() {
  const pathname = usePathname()

  const items = [
    { label: 'Rekam Medis', icon: MdDescription, href: '/dashboard/dokter/medis' },
    { label: 'Resume Medis', icon: MdNoteAlt, href: '/dashboard/dokter/resume' },
    { label: 'MCU & Pemeriksaan', icon: MdPsychology, href: '/dashboard/dokter/mcu' },
    { label: 'Riwayat Pasien', icon: MdHistory, href: '/dashboard/dokter/riwayat' },
    { label: 'Order Lab/Rad', icon: MdScience, href: '/dashboard/dokter/order' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-background text-foreground border-r border-border px-6 py-8 space-y-6 text-sm transition-colors duration-300">
      <Link
        href="/dashboard/dokter"
        className="text-center text-4xl font-bold tracking-wide text-foreground select-none"
      >
        SIRAMA
      </Link>

      <SidebarGroup title="Modul Dokter" items={items} pathname={pathname} />
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
      <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </div>

      <nav className="mt-1 space-y-1">
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
    </div>
  )
})