'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { memo, useEffect, useState, useCallback, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { menuByRole, MenuItem, MenuCategory } from '@/lib/menuByRole'
import { RoleLabelMap, Role } from '@/types/role'
import { Home, LogOut, Settings, Bell, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

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
              <div
                className={`w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${
                  theme === 'dark' ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <span className="text-slate-700">🌙</span>
                ) : (
                  <span className="text-yellow-500">☀️</span>
                )}
              </div>
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
  const [currentModule, setCurrentModule] = useState<string>('')

  // Update current module from URL search params - harus di atas kondisional return
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const module = urlParams.get('module') || ''
      setCurrentModule(module)
    }
  }, [pathname])

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

  // Component disabled - using RoleSidebar + RoleHeader in [role] layout instead
  return null
}

export default memo(PersistentSidebar)
