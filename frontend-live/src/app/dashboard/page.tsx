import { Suspense } from 'react'
import DashboardRouter from './DashboardRouter'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Memuat dashboard...</div>}>
      <DashboardRouter />
    </Suspense>
  )
}