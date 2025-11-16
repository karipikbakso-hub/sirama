'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { MdLogout, MdSettings, MdDarkMode, MdLightMode, MdNotifications, MdSearch } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/apiAuth';
import { RoleLabelMap, Role } from '@/types/role';

export default function RoleHeader({ role }: { role: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout: logoutAuth } = useAuth();

  // ✅ Mount checker untuk hindari hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Gunakan RoleLabelMap untuk mendapatkan label yang sesuai
  const roleLabel = role ? RoleLabelMap[role as Role] || role : 'Pengguna';

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const logout = async () => {
    try {
      await logoutAuth();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Mobile menu button & breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open mobile menu"
          >
            <FaBars className="text-lg text-gray-600 dark:text-gray-400" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Dashboard</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium capitalize">{roleLabel}</span>
          </div>
        </div>

        {/* Right side - Theme toggle, user menu */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            suppressHydrationWarning
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'light' ? (
                <MdDarkMode className="text-xl text-gray-600 dark:text-gray-400" />
              ) : (
                <MdLightMode className="text-xl text-yellow-500" />
              )
            ) : (
              <MdDarkMode className="text-xl text-gray-600 dark:text-gray-400" />
            )}
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

            {/* Dropdown menu */}
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

                  <button
                    onClick={() => {
                      router.push('/dashboard/profile');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <MdSettings className="text-lg" />
                    Profile Settings
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <MdLogout className="text-lg" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
