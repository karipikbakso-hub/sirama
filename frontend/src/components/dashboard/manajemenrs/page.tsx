'use client'

import { menuByRole, MenuItem } from '@/lib/menuByRole'

export default function ManajemenRsDashboard() {
  return <ManajemenRsDashboardHome />
}

// Home/Dashboard component
function ManajemenRsDashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard Manajemen RS
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Welcome to Manajemen RS Panel
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Select a menu item from the sidebar to manage hospital performance and operations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuByRole.manajemenrs?.filter((item): item is MenuItem => 'icon' in item).map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="text-2xl text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-gray-800 dark:text-white">{item.label}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage {item.label.toLowerCase()} metrics
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
