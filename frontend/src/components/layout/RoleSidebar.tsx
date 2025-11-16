'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { menuByRole, MenuItem, MenuCategory } from '@/lib/menuByRole'
import { RoleLabelMap, Role } from '@/types/role'
import { MdHome, MdExpandMore, MdExpandLess, MdChevronRight } from 'react-icons/md'
import { useState } from 'react'

export default function RoleSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const navItems = menuByRole[role] ?? []
  const roleLabel = RoleLabelMap[role as Role] || role
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Pendaftaran Pasien']))
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Toggle category expansion
  const toggleCategory = (categoryLabel: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryLabel)) {
      newExpanded.delete(categoryLabel)
    } else {
      newExpanded.add(categoryLabel)
    }
    setExpandedCategories(newExpanded)
  }

  // Modular navigation for all roles - use query parameters for content switching
  const handleMenuClick = (href: string) => {
    const moduleName = href?.split('/').pop() || 'dashboard';
    const currentParams = searchParams ? new URLSearchParams(searchParams) : new URLSearchParams();
    currentParams.set('module', moduleName);
    router.replace(`/dashboard/${role}?${currentParams.toString()}`, { scroll: false });
  }

  // Check if menu has mixed structure (standalone items + categories)
  const hasMixedStructure = navItems.length > 0 && navItems.some(item => 'items' in item)

  // Get consistent SIRAMA brand color for all categories
  const getCategoryColor = () => {
    return 'from-blue-600 via-blue-700 to-indigo-800'
  }

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
                // Check if current menu matches the module query parameter
                const currentModule = searchParams?.get('module')
                const menuModule = item.href?.split('/').pop()
                const isActive = currentModule === menuModule || (pathname === item.href && !currentModule)

                return (
                  <Link
                    key={item.href}
                    onClick={() => handleMenuClick(item.href)}
                    className={`w-full group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-200 ${
                      isActive
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                    )}

                    {/* Icon */}
                    <div className={`relative flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}>
                      <item.icon className="text-lg" />
                    </div>

                    {/* Label */}
                    <span className={`font-medium transition-all duration-200 ${
                      isActive ? 'text-slate-800 dark:text-slate-200' : ''
                    }`}>
                      {item.label}
                    </span>

                    {/* Hover arrow */}
                    <div className={`ml-auto transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 opacity-100'
                        : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}>
                      <MdChevronRight className="text-sm" />
                    </div>
                  </button>
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

                        <div className={`transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          <MdExpandMore className="text-lg" />
                        </div>
                      </div>
                    </button>

                    {/* Submenu with smooth animation */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="ml-6 mt-2 space-y-1">
                        {category.items.map((item, itemIndex) => {
                          // Check if current menu matches the module query parameter for category items too
                          const currentModule = searchParams?.get('module')
                          const menuModule = item.href?.split('/').pop()
                          const isActive = currentModule === menuModule || (pathname === item.href && !currentModule)

                          return (
                            <button
                              key={item.href}
                              onClick={() => handleMenuClick(item.href)}
                              className={`w-full group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-all duration-200 ${
                                isActive
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                              }`}
                            >
                              {/* Icon with hover effect */}
                              <div className={`relative flex-shrink-0 transition-all duration-200 ${
                                isActive
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                              }`}>
                                <item.icon className="text-base" />
                              </div>

                              {/* Label */}
                              <span className={`font-medium transition-all duration-200 ${
                                isActive ? 'text-slate-800 dark:text-slate-200' : ''
                              }`}>
                                {item.label}
                              </span>

                              {/* Hover arrow */}
                              <div className={`ml-auto transition-all duration-200 ${
                                isActive
                                  ? 'text-blue-600 dark:text-blue-400 opacity-100'
                                  : 'text-slate-400 opacity-0 group-hover:opacity-100'
                              }`}>
                                <MdChevronRight className="text-sm" />
                              </div>
                            </button>
                          )
                        })}
                      </div>
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
