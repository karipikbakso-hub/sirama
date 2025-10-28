'use client'

import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()

  const items: [string, string, string][] = [
    ['🏥', 'Klinik', '/dashboard/klinik'],
    ['📋', 'Rawat', '/dashboard/rawat'],
    ['💊', 'Farmasi', '/dashboard/farmasi'],
    ['🧪', 'Lab', '/dashboard/lab'],
    ['💳', 'Kasir', '/dashboard/kasir'],
    ['👥', 'User', '/dashboard/user'],
    ['📊', 'Laporan', '/dashboard/laporan'],
    ['⚙️', 'Setting', '/dashboard/pengaturan'],
    ['🧾', 'Audit', '/dashboard/audit'],
    ['🧺', 'Laundry', '/dashboard/laundry'],
    ['🧑‍🍳', 'POS', '/dashboard/pos'],
    ['🏠', 'Property', '/dashboard/property'],
    ['🎓', 'eLearning', '/dashboard/elearning'],
  ]

  return (
    <nav
      className="md:hidden fixed left-0 right-0 bottom-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow z-50 overflow-x-auto flex gap-4 px-4 py-2 transition-colors duration-300"
      style={{ bottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map(([icon, label, href]) => (
        <a
          key={href}
          href={href}
          className={`flex flex-col items-center text-xs min-w-[60px] transition ${
            pathname === href
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
          }`}
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}