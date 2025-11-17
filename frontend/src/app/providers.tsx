'use client'

import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from 'next-themes'
import { useAuthStore } from '@/store/auth'
import { Loader2, Heart } from 'lucide-react'

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const { hydrate, isHydrated } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only run on client-side
    if (typeof window === 'undefined') {
      setIsInitializing(false)
      return
    }

    // Run hydration
    hydrate()

    // Mark initialization as complete after a brief delay
    // This allows the store to update from hydrate()
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 100) // Small buffer for hydration

    return () => clearTimeout(timer)
  }, [hydrate])

  // On server or first client render, show minimal content or defer hydration
  if (!mounted) {
    return null
  }

  // Show loading while hydrating
  if (isInitializing || !isHydrated) {
    return (
      <div
        className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50"
        suppressHydrationWarning={true}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Heart className="h-8 w-8 text-red-500 animate-pulse" />
            <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
              SIRAMA
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading hospital system...</span>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator>
          {children}
        </AuthHydrator>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
