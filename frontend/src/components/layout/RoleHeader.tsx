'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaUserCircle } from 'react-icons/fa';
import { MdLogout, MdSettings, MdDarkMode, MdLightMode } from 'react-icons/md';
import useAuth from '@/hooks/useAuth';
import api from '@/lib/apiAuth';
import { RoleLabelMap, Role } from '@/types/role';

export default function RoleHeader({ role }: { role: string }) {
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
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200/60 dark:border-slate-700/60 shadow-lg">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5"></div>

      <div className="relative px-6 py-4 flex items-center justify-between">
        {/* SIRAMA Logo/Brand - Matching Sidebar Design */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              SIRAMA
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Dashboard {roleLabel}
            </p>
          </div>
          {/* Mobile: Just SIRAMA logo */}
          <div className="md:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              SIRAMA
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* ✅ Theme toggle — enhanced design matching sidebar */}
          <button
            onClick={toggleTheme}
            className="relative w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-full transition-all duration-300 hover:bg-slate-300 dark:hover:bg-slate-600 p-1 overflow-hidden shadow-md"
            suppressHydrationWarning
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${
              mounted && theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
            }`}>
              {mounted ? (
                theme === 'light' ? (
                  <MdDarkMode className="text-sm text-slate-600" />
                ) : (
                  <MdLightMode className="text-sm text-yellow-400" />
                )
              ) : (
                <MdDarkMode className="text-sm text-slate-600" />
              )}
            </div>
          </button>

          {/* User dropdown - Enhanced design */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200 group"
          >
            <div className="relative">
              <FaUserCircle className="text-2xl text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:inline group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              {roleLabel}
            </span>
          </button>

          {/* Dropdown menu - Enhanced design */}
          {dropdownOpen && (
            <div className="absolute right-0 top-14 w-56 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-xl shadow-xl z-50 backdrop-blur-sm">
              <div className="p-2">
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  <MdSettings className="text-lg text-slate-500" />
                  Account Settings
                </a>
                <div className="border-t border-slate-200/60 dark:border-slate-700/60 my-1"></div>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                >
                  <MdLogout className="text-lg text-red-500" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
