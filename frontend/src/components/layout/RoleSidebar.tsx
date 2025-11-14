'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { memo } from 'react'
import { menuByRole, MenuItem, MenuCategory } from '@/lib/menuByRole'
import { RoleLabelMap, Role } from '@/types/role'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'

function RoleSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const navItems = menuByRole[role as Role] ?? []
  const roleLabel = RoleLabelMap[role as Role] || role

  // Get current module from pathname
  const currentModule = (() => {
    const pathSegments = pathname?.split('/').filter(Boolean) || []
    // For paths like /dashboard/admin/users, the module is 'users'
    if (pathSegments.length >= 3) {
      return pathSegments[2] // role is at index 1, module at index 2
    }
    return undefined
  })()

  return (
    <aside className="fixed left-0 top-0 h-screen hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">SIRAMA</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {navItems.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <Home className="text-3xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">Menu belum tersedia</p>
          </div>
        ) : (
          <nav className="p-4 space-y-1">
            {navItems.map((navItem: MenuItem | MenuCategory) => {
              // Standalone menu item
              if ('href' in navItem) {
                const item = navItem as MenuItem
                const menuModule = item.href?.split('/').pop()
                const isActive = currentModule === menuModule

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-r-2 border-blue-500"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <item.icon className="text-lg flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              } else {
                // Category with submenu - always expanded
                const category = navItem as MenuCategory

                return (
                  <div key={category.label}>
                    {/* Category Header */}
                    <div className="px-3 py-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        {category.label}
                      </h3>
                    </div>

                    {/* Category Items */}
                    <div className="space-y-1 mb-4">
                      {category.items.map((item) => {
                        const menuModule = item.href?.split('/').pop()
                        const isActive = currentModule === menuModule

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ml-2",
                              isActive
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-r-2 border-blue-500"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                          >
                            <item.icon className="text-base flex-shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Floating Separator */}
                    <div className="mx-2 mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-600 to-transparent shadow-sm"></div>
                  </div>
                )
              }
            })}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">© 2025 SIRAMA</p>
        </div>
      </div>
    </aside>
  )
}

export default memo(RoleSidebar, (prevProps, nextProps) => {
  return prevProps.role === nextProps.role
})
