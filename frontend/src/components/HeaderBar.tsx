'use client'

import { useRouter } from 'next/navigation'

export default function HeaderBar() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 md:px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
      <div className="flex items-center gap-4">
        {/* Optional: Search or Notification */}
        <button className="hidden md:block text-gray-500 hover:text-blue-600">🔔</button>
        <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">Admin</span>
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-blue-600 hover:underline"
        >
          Keluar
        </button>
      </div>
    </header>
  )
}