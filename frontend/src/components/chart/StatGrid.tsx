'use client'

export default function StatGrid({
  stats,
}: {
  stats: [string, string, string][]
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map(([label, value, color]) => (
        <div key={label} className="bg-white dark:bg-gray-800 rounded shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold dark:text-white ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
