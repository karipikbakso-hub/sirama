import { useDashboardStats } from './hooks'
import StatCard from './components/StatCard'

export default function DashboardPage() {
  const { stats } = useDashboardStats()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>
    </div>
  )
}
