'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { memo, useState, useEffect } from 'react'
import { menuByRole, MenuItemType } from '@/lib/menuByRole'
import { RoleLabelMap, Role } from '@/types/role'
import { MdExpandMore, MdChevronRight, MdHome } from 'react-icons/md'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function RoleSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = menuByRole[role] ?? []
  const roleLabel = RoleLabelMap[role as Role] || role
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedCollapsible, setExpandedCollapsible] = useState<Record<string, boolean>>({})

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-expanded-collapsible')
    if (saved) {
      try {
        setExpandedCollapsible(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load collapsed menu state')
      }
    }
  }, [])

  // Toggle collapsible menu state
  const toggleCollapsible = (menuTitle: string) => {
    const newState = {
      ...expandedCollapsible,
      [menuTitle]: !expandedCollapsible[menuTitle]
    }
    setExpandedCollapsible(newState)
    localStorage.setItem('sidebar-expanded-collapsible', JSON.stringify(newState))
  }

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

  // Check if menu item is active based on pathname
  const isMenuActive = (href: string) => {
    return pathname === href
  }

  // Handle menu clicks - use direct path routing
  const handleMenuClick = (href: string) => {
    router.push(href, { scroll: false })
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
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <MdHome className="text-3xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">Menu belum tersedia</p>
          </div>
        ) : (
          <nav className="p-4 space-y-1">
            {navItems.map((navItem, index) => {
              // Handle Separator
              if ('type' in navItem && navItem.type === 'separator') {
                return (
                  <div key={`separator-${index}`} className="px-3 py-2 mt-4">
                    <p className="text-xs font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
                      {navItem.title}
                    </p>
                  </div>
                )
              }

              // Handle Collapsible Menu
              if ('collapsible' in navItem && navItem.collapsible) {
                const isExpanded = expandedCollapsible[navItem.title] ?? navItem.defaultOpen ?? false

                return (
                  <div key={navItem.title} className="space-y-1">
                    {/* Parent button */}
                    <button
                      onClick={() => toggleCollapsible(navItem.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {navItem.icon && <navItem.icon className="h-5 w-5" />}
                        <span className="text-sm font-medium">{navItem.title}</span>
                        {navItem.badge && (
                          <Badge variant={navItem.badge.variant} className="text-xs">
                            {navItem.badge.text}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Children - with smooth collapse animation */}
                    <div
                      className={cn(
                        "ml-6 space-y-1 overflow-hidden transition-all duration-200",
                        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      {navItem.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href || '#'}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                            pathname === child.href && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                          )}
                        >
                          {child.icon && <child.icon className="h-4 w-4" />}
                          <span>{child.label}</span>
                          {child.badge && (
                            <Badge variant={child.badge.variant} className="text-xs">
                              {child.badge.text}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              // Handle Regular Menu Item
              if ('href' in navItem) {
                const isActive = isMenuActive(navItem.href)

                return (
                  <Link
                    key={navItem.href}
                    href={navItem.href}
                    className={cn(
                      "flex items-center group gap-3 px-3 py-2 rounded-lg transition-colors",
                      "text-slate-700 dark:text-slate-300",
                      "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                      isActive && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"></div>
                    )}

                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <navItem.icon className="h-5 w-5" />
                    </div>

                    {/* Label */}
                    <span className="text-sm font-medium">{navItem.label}</span>

                    {/* Badge */}
                    {navItem.badge && (
                      <Badge variant={navItem.badge.variant} className="text-xs ml-auto">
                        {navItem.badge.text}
                      </Badge>
                    )}

                    {/* Hover arrow */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <MdChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                )
              }

              // Handle legacy Category (for backward compatibility)
              if ('items' in navItem) {
                const category = navItem
                const isExpanded = expandedCategories.has(category.label)

                return (
                  <div key={category.label} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category.label)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wide hover:text-foreground dark:hover:text-slate-300 transition-colors"
                    >
                      {category.label}
                      <MdExpandMore
                        className={cn(
                          "h-4 w-4 transition-transform duration-300",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    <div className={cn(
                      "ml-2 space-y-1 overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      {category.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                            pathname === item.href && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              return null
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
