'use client'

import { usePathname } from 'next/navigation'
import { menuByRole, Role } from './menuByRole'

export default function MobileNav() {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const role = segments[2] as Role
  const navItems = menuByRole[role] ?? []

  const normalize = (url: string) => url.replace(/\/$/, '')

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-sm"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex overflow-x-auto gap-4 px-4 py-2">
        {navItems.map(({ label, icon: Icon, path }) => {
          const href = `/dashboard/${role}/${path}`
          const isActive = normalize(pathname) === normalize(href)

          return (
            <a
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs min-w-[60px] transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
              }`}
            >
              <Icon className="text-xl" />
              <span>{label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}