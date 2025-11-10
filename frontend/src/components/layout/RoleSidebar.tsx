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
    <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r border-slate-200/60 dark:border-slate-700/60 shadow-xl">
      {/* SIRAMA Logo/Brand - Enhanced */}
      <div className="relative p-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5"></div>

        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              SIRAMA
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Dashboard {roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Enhanced Design */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {navItems.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 italic text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <MdHome className="text-2xl text-slate-400" />
            </div>
            Menu belum tersedia.
          </div>
        ) : (
          <nav className="p-4 space-y-2">
            {navItems.map((navItem, index) => {
              // Check if this is a standalone menu item
              if ('href' in navItem) {
                const item = navItem as MenuItem
                // Check if current menu matches the module query parameter
                const currentModule = searchParams?.get('module')
                const menuModule = item.href?.split('/').pop()
                const isActive = currentModule === menuModule || (pathname === item.href && !currentModule)

                return (
                  <button
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
                // This is a category
                const category = navItem as MenuCategory
                const isExpanded = expandedCategories.has(category.label)
                const isHovered = hoveredCategory === category.label
                const categoryColor = getCategoryColor()

                return (
                  <div key={category.label} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category.label)}
                      onMouseEnter={() => setHoveredCategory(category.label)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`w-full group relative rounded-xl transition-all duration-300 ${
                        isExpanded
                          ? 'bg-slate-50 dark:bg-slate-800/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Elegant line indicator for expanded state */}
                      {isExpanded && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                      )}

                      {/* Subtle hover effect */}
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                      <div className="relative flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Category indicator */}
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isExpanded
                              ? 'bg-blue-500 scale-110'
                              : 'bg-slate-400 dark:bg-slate-500 group-hover:bg-slate-600 dark:group-hover:bg-slate-400'
                          }`}></div>

                          <span className={`font-semibold text-sm tracking-wide transition-colors duration-300 ${
                            isExpanded
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {category.label}
                          </span>
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
                  </div>
                )
              }
            })}
          </nav>
        )}
      </div>

      {/* Footer - Enhanced */}
      <div className="relative p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent dark:from-transparent dark:via-slate-800/50 dark:to-transparent"></div>
        <div className="relative text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            © 2025 SIRAMA System
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Healthcare Management Platform
          </p>
        </div>
      </div>
    </aside>
  )
}
