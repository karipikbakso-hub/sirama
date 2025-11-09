'use client'

import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  variant?: 'default' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md'
}

export function Button({
  children,
  loading,
  variant = 'default',
  size = 'md',
  ...props
}: Props) {
  const base = 'rounded px-3 py-1 text-sm font-medium transition'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  }
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
  }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}