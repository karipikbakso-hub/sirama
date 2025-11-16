'use client'

import { useState, useRef, useEffect } from 'react'
import { MdKeyboardArrowDown, MdSearch, MdCheck } from 'react-icons/md'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  disabled = false,
  className = "",
  required = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get selected option label
  const selectedOption = options.find(option => option.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const option = filteredOptions[highlightedIndex]
          if (!option.disabled) {
            handleSelect(option.value)
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
    }
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0)
      } else {
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-left
          border border-gray-300 dark:border-gray-600 rounded-lg
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          hover:border-gray-400 dark:hover:border-gray-500 transition-colors
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? '' : 'text-gray-500 dark:text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <MdKeyboardArrowDown
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="
          absolute z-50 w-full mt-1 bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg
          max-h-60 overflow-auto
        ">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Cari..."
                className="
                  w-full pl-9 pr-3 py-2 text-sm
                  bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                  rounded-md text-gray-900 dark:text-white placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                "
              />
            </div>
          </div>

          {/* Options */}
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Tidak ada opsi yang ditemukan
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-left text-sm
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${index === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                    ${option.value === value ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}
                  `}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <MdCheck className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ''}
          onChange={() => {}}
          required
          className="sr-only"
          aria-hidden="true"
        />
      )}
    </div>
  )
}