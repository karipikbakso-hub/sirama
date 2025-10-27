import { DashboardStat } from '../types'

export default function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <div className={`p-4 rounded shadow text-white ${stat.color}`}>
      <div className="text-2xl">{stat.icon}</div>
      <div className="text-sm mt-1">{stat.label}</div>
      <div className="text-2xl font-bold">{stat.value}</div>
    </div>
  )
}
