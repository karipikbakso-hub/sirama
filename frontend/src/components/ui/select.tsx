'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, Props>(({ label, children, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium">{label}</label>}
    <select
      ref={ref}
      {...props}
      className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
    >
      {children}
    </select>
  </div>
))

Select.displayName = 'Select'
