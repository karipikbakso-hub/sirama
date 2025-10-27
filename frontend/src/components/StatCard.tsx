interface StatCardProps {
  title: string
  value: string | number
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="card p-4 bg-white rounded shadow">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
