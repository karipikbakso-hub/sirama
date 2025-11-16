// src/components/layout/DashboardShell.tsx
'use client'

import { ReactNode } from 'react'
import RoleSidebar from '../layout/RoleSidebar'
import RoleHeader from '../layout/RoleHeader'
import MobileNav from '../menu/MobileNav'
import { ThemeProvider } from 'next-themes'

export default function DashboardShell({
  children,
  role,
}: {
  children: ReactNode
  role: string
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <RoleSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <RoleHeader role={role} />
          <main className="flex-1 p-6 md:p-10 space-y-6">{children}</main>
          <MobileNav />
        </div>
      </div>
    </ThemeProvider>
  )
}
