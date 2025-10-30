'use client'
import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    if (isDark) {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    setIsDark(!isDark)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white dark:bg-gray-900">
        <h1 className="text-xl font-bold">🏥 SIRAMA Dashboard</h1>
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:ring-2 ring-blue-400"
        >
          {isDark ? '🌞 Terang' : '🌙 Gelap'}
        </button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}