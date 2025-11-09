'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MdPeople,
  MdSecurity,
  MdHistory,
  MdBackup,
  MdTrendingUp,
  MdTrendingDown,
  MdShowChart,
  MdAccountBalance,
  MdPersonAdd,
  MdSettings,
  MdNotifications,
  MdBarChart
} from 'react-icons/md'
import { menuByRole } from '@/lib/menuByRole'

// Import all admin modules
import AdminUserPage from './user/page'
import AdminRolePage from './role/page'
import AdminRelasiPage from './relasi/page'
import AdminAuditPage from './audit/page'
import AdminBackupPage from './backup/page'

const adminModules = {
  'user': AdminUserPage,
  'role': AdminRolePage,
  'relasi': AdminRelasiPage,
  'audit': AdminAuditPage,
  'backup': AdminBackupPage,
}

export default function AdminDashboard() {
  return <AdminDashboardHome />
}

// Modern Dashboard Home Component (inspired by NextAdmin)
function AdminDashboardHome() {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: MdPeople,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Sessions',
      value: '1,429',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: MdShowChart,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: MdAccountBalance,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Audit Logs',
      value: '15,632',
      change: '-3.2%',
      changeType: 'negative' as const,
      icon: MdHistory,
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const recentActivities = [
    { user: 'Admin User', action: 'Created new role', time: '2 minutes ago', type: 'create' },
    { user: 'System', action: 'Backup completed', time: '15 minutes ago', type: 'system' },
    { user: 'Dr. Smith', action: 'Updated patient record', time: '1 hour ago', type: 'update' },
    { user: 'Nurse Johnson', action: 'Logged medication', time: '2 hours ago', type: 'medical' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <MdNotifications className="text-lg" />
            Notifications
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <MdBarChart className="text-lg" />
            View Reports
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <MdTrendingUp className="text-lg" />
                  ) : (
                    <MdTrendingDown className="text-lg" />
                  )}
                  <span>{stat.change} from last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Performance</h3>
              <select
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                aria-label="Time period selection"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <MdBarChart className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Chart visualization would appear here</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'create' ? 'bg-green-100 dark:bg-green-900' :
                  activity.type === 'system' ? 'bg-blue-100 dark:bg-blue-900' :
                  activity.type === 'update' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  'bg-purple-100 dark:bg-purple-900'
                }`}>
                  {activity.type === 'create' && <MdPersonAdd className="text-green-600 dark:text-green-400 text-sm" />}
                  {activity.type === 'system' && <MdSettings className="text-blue-600 dark:text-blue-400 text-sm" />}
                  {activity.type === 'update' && <MdHistory className="text-yellow-600 dark:text-yellow-400 text-sm" />}
                  {activity.type === 'medical' && <MdAccountBalance className="text-purple-600 dark:text-purple-400 text-sm" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.user}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menuByRole.admin?.slice(0, 4).map((item, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon className="text-white text-xl" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
