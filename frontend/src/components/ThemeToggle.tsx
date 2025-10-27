'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Laptop } from 'lucide-react'

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  const options = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'system', label: 'Auto', icon: <Laptop size={16} /> }
  ]

  return (
    <div className="flex items-center gap-2">
      {options.map(({ value, label, icon }) => {
        const isActive = resolvedTheme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-sm transition-all
              ${isActive ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
            `}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
