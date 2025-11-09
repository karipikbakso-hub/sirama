import React from 'react'
import RoleLayout from '@/components/dash/DashboardShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleLayout role="lab">{children}</RoleLayout>
}
