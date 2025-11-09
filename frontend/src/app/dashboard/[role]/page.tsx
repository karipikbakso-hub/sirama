// app/dashboard/[role]/page.tsx
import ModularDashboard from '@/components/dash/ModularDashboard'

interface PageProps {
  params: Promise<{ role: string }>
  searchParams: Promise<{ module?: string }>
}

export default async function DashboardPage({ params, searchParams }: PageProps) {
  const { role } = await params
  const { module } = await searchParams

  return <ModularDashboard role={role} module={module} />
}
