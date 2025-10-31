'use client'

import { usePathname } from 'next/navigation'

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()

  const menuGroups = getMenuByRole(role)

  return (
    <aside className="h-screen w-20 md:w-64 bg-white border-r px-2 md:px-6 py-6 overflow-y-auto sticky top-0 z-40 flex flex-col space-y-6 text-sm">
      <div className="text-center text-2xl font-bold text-gray-800 mb-4">SIRAMA</div>

      {menuGroups.map((group) => (
        <div key={group.title}>
          <p className="text-[10px] uppercase text-gray-400 mb-3 tracking-wider hidden md:block">
            {group.title}
          </p>
          <nav className="space-y-2">
            {group.items.map(([icon, label, href]) => {
              const active = pathname === href
              return (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-2 py-2 rounded transition ${
                    active
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="hidden md:inline">{label}</span>
                </a>
              )
            })}
          </nav>
        </div>
      ))}
    </aside>
  )
}

function getMenuByRole(role: string): { title: string; items: [string, string, string][] }[] {
  const shared: Record<string, [string, string, string][]> = {
    'Modul Inti': [
      ['🏥', 'Klinik', '/dashboard/klinik'],
      ['📋', 'Rawat', '/dashboard/rawat'],
      ['💊', 'Farmasi', '/dashboard/farmasi'],
      ['🧪', 'Lab', '/dashboard/lab'],
      ['💳', 'Kasir', '/dashboard/kasir'],
    ],
    'Manajemen Sistem': [
      ['👥', 'User', '/dashboard/user'],
      ['📊', 'Laporan', '/dashboard/laporan'],
      ['⚙️', 'Setting', '/dashboard/pengaturan'],
      ['🧾', 'Audit', '/dashboard/audit'],
    ],
    'Modul Tambahan': [
      ['🧺', 'Laundry', '/dashboard/laundry'],
      ['🧑', 'POS', '/dashboard/pos'],
      ['🏠', 'Property', '/dashboard/property'],
      ['🎓', 'eLearning', '/dashboard/elearning'],
    ],
  }

  const roleMap: Record<string, string[]> = {
    admin: ['Modul Inti', 'Manajemen Sistem', 'Modul Tambahan'],
    dokter: ['Modul Inti'],
    kasir: ['Modul Inti'],
    apoteker: ['Modul Inti'],
    laboran: ['Modul Inti'],
    pasien: ['Modul Tambahan'],
    manajemen: ['Manajemen Sistem'],
    teknisi: ['Modul Tambahan'],
  }

  const allowed = roleMap[role] || []

  return allowed
    .filter((group) => shared[group])
    .map((group) => ({
      title: group,
      items: shared[group],
    }))
}