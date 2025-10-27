interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="card p-4 bg-white dark:bg-gray-900 rounded shadow flex items-center gap-4">
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  )
}
