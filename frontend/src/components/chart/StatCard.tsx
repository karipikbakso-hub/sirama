import React from 'react'

export default function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
      <div className="text-4xl">{icon}</div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{label}</p>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
    </div>
  )
}