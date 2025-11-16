'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium">{label}</label>}
    <input
      ref={ref}
      {...props}
      className="w-full border px-3 py-2 rounded text-sm bg-white dark:bg-gray-800"
    />
  </div>
))

Input.displayName = 'Input'
