'use client'

import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ThemeProvider } from 'next-themes'
import { useAuthStore } from '@/store/auth'

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate)

  useEffect(() => {
    hydrate() // Safe hydration - only runs on client
  }, [hydrate])

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
