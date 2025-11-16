'use client'

import { ReactNode } from 'react'
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: ReactNode
  color?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'from-blue-500 to-blue-600',
  className = ''
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'positive':
        return <MdTrendingUp className="text-green-600 dark:text-green-400" />
      case 'negative':
        return <MdTrendingDown className="text-red-600 dark:text-red-400" />
      default:
        return <MdTrendingFlat className="text-gray-600 dark:text-gray-400" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </p>
          {change && (
            <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
              {getTrendIcon()}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
          <div className="text-white text-xl">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}