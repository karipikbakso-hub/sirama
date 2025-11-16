// Utility functions for role-specific operations

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for Indonesia
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Format date for Indonesia locale
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format time
export function formatTime(time: string): string {
  return time
}

// Calculate age from birth date
export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Get status color classes
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    emergency: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    normal: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return colors[status] || colors.normal
}

// Get priority color classes
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    emergency: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  return colors[priority] || colors.normal
}

// Generate queue number
export function generateQueueNumber(prefix: string, number: number): string {
  return `${prefix}${number.toString().padStart(3, '0')}`
}

// Calculate wait time in minutes
export function calculateWaitTime(startTime: string, endTime?: string): number {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diffMs = end.getTime() - start.getTime()
  return Math.floor(diffMs / (1000 * 60))
}

// Format wait time
export function formatWaitTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} jam ${remainingMinutes} menit`
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indonesian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[8-9][0-9]{7,11}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Check if date is today
export function isToday(date: string | Date): boolean {
  const today = new Date()
  const checkDate = new Date(date)
  return today.toDateString() === checkDate.toDateString()
}

// Check if date is tomorrow
export function isTomorrow(date: string | Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const checkDate = new Date(date)
  return tomorrow.toDateString() === checkDate.toDateString()
}

// Get relative time
export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`

  return formatDate(date)
}