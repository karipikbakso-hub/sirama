import { useState, useEffect, useCallback } from 'react'
import { useFetch } from './useApi'
import { Patient } from '@/types/role/pendaftaran'

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function usePatientSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions berdasarkan task spec: GET /api/pendaftaran/pasien/search?q={query}
  const { data: response, isLoading, error } = useFetch<any>(
    '/api/pendaftaran/pasien/search',
    {
      params: { q: debouncedQuery },
      enabled: debouncedQuery.length >= 2,
    }
  )

  // Extract data from response, handling both direct array and {data: [...]}
  const suggestions = Array.isArray(response)
    ? response
    : (response?.data || response?.data || [])

  // Debug logging
  console.log('Search debug:', {
    query,
    debouncedQuery,
    isLoading,
    error,
    response,
    suggestions: suggestions?.length || 0
  })

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    rawResponse: response
  }
}
