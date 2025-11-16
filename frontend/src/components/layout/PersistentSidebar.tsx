'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { memo, useEffect, useState, useCallback, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { menuByRole, MenuItem, MenuCategory } from '@/lib/menuByRole'
import { RoleLabelMap, Role } from '@/types/role'
import { Home, LogOut, Settings, Bell, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
import useAuth from '@/hooks/useAuth'
import { motion } from 'framer-motion'
>>>>>>> dfa4c3eddbdba9f341d4c0b43f872ac5703588b2

// Global state for sidebar persistence
let globalRole: string | null = null
let globalSetRole: ((role: string) => void) | null = null

export const getGlobalRole = () => globalRole
export const setGlobalRole = (role: string) => {
  globalRole = role
  if (globalSetRole) globalSetRole(role)
}

// Persistent Header Component
const PersistentHeader = memo(function PersistentHeader({ role, roleLabel }: { role: string; roleLabel: string }) {
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout: logoutAuth } = useAuth();

  // ✅ Mount checker untuk hindari hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized theme toggle handler
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Memoized logout handler
  const logout = useCallback(async () => {
    try {
      console.log('🔐 Logging out user...');
      await logoutAuth();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    } finally {
      setDropdownOpen(false);
    }
  }, [logoutAuth]);

  return (
    <>
      {/* Fixed header overlay */}
      <header className="fixed top-0 left-64 right-0 z-30 w-auto bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Main Header */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium capitalize">{roleLabel}</span>
          </div>

          {/* Center - Health metrics */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Dashboard aktif</span>
            </div>
          </div>

          {/* Right side - Notifications, Theme toggle, user menu */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Modern theme toggle slider */}
            <button
              onClick={toggleTheme}
              className="relative w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
<<<<<<< HEAD
              <div
                className={`w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${
                  theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
                }`}
=======
              <motion.div
                className="w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center"
                animate={{ x: theme === 'dark' ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
>>>>>>> dfa4c3eddbdba9f341d4c0b43f872ac5703588b2
              >
                {theme === 'dark' ? (
                  <span className="text-slate-700">🌙</span>
                ) : (
                  <span className="text-yellow-500">☀️</span>
                )}
<<<<<<< HEAD
              </div>
=======
              </motion.div>
>>>>>>> dfa4c3eddbdba9f341d4c0b43f872ac5703588b2
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {roleLabel.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {roleLabel}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {roleLabel}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@sirama.com'}
                      </p>
                    </div>

                    <button className="flex items-center gap-3 px-3 py-2 w-full text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" onClick={logout}>
                      <LogOut className="text-lg" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </>
  );
});

function PersistentSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [role, setRoleState] = useState<string>('')
<<<<<<< HEAD
  const [currentModule, setCurrentModule] = useState<string>('')

  // Update current module from URL search params - harus di atas kondisional return
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const module = urlParams.get('module') || ''
      setCurrentModule(module)
    }
  }, [pathname])
=======
>>>>>>> dfa4c3eddbdba9f341d4c0b43f872ac5703588b2

  // Setup global state
  useEffect(() => {
    globalSetRole = setRoleState
    if (!globalRole && user) {
      const userRole = user.role || (user.roles?.[0]?.name?.toLowerCase() || 'user')
      setGlobalRole(userRole)
    }
  }, [user])

  // Update role from pathname if we're in dashboard
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/')) {
      const pathSegments = pathname.split('/').filter(Boolean)
      if (pathSegments.length >= 2) {
        const roleFromPath = pathSegments[1] // role is at index 1
        if (globalRole !== roleFromPath) {
          setGlobalRole(roleFromPath)
        }
      }
    }
  }, [pathname])

  // Update local state when global role changes
  useEffect(() => {
    if (globalRole) {
      setRoleState(globalRole)
    }
  }, [])

<<<<<<< HEAD
  // Component disabled - using RoleSidebar + RoleHeader in [role] layout instead
  return null
=======
  // Don't render anything if not in dashboard
  if (!pathname?.startsWith('/dashboard/') || !role) {
    return null
  }

  const navItems = menuByRole[role as Role] ?? []
  const roleLabel = RoleLabelMap[role as Role] || role

  // Get current module from pathname
  const currentModule = (() => {
    const pathSegments = pathname?.split('/').filter(Boolean) || []
    if (pathSegments.length >= 3) {
      return pathSegments[2] // role is at index 1, module at index 2
    }
    return undefined
  })()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-40">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">SIRAMA</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel}</p>
            </div>
          </div>

          {/* Elegant separator under logo */}
          <div className="mt-6 px-3">
            <div className="h-px bg-gradient-to-r from-slate-300 dark:from-slate-600 via-slate-300 dark:via-slate-600 to-transparent opacity-80"></div>
            <div className="h-px bg-gradient-to-r from-slate-200 dark:from-slate-700 via-slate-200 dark:via-slate-700 to-transparent opacity-60 mt-1"></div>
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
                  const category = navItem as MenuCategory

                  return (
                    <div key={category.label}>
                      <div className="px-3 py-2 mb-2">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          {category.label}
                        </h3>
                      </div>

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

      {/* Header - juga persistent */}
      <PersistentHeader role={role} roleLabel={roleLabel} />
    </div>
  )
>>>>>>> dfa4c3eddbdba9f341d4c0b43f872ac5703588b2
}

export default memo(PersistentSidebar)
