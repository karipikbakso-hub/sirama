import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from '@/lib/toast'
import type { SuccessResponse, ErrorResponse } from '@/lib/apiTypes'

export function useFetch<T>(
  endpoint: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    params?: Record<string, any>
  }
) {
  const { enabled = true, refetchInterval, params } = options || {}

  return useQuery<T>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const response = await api.get<SuccessResponse<T>>(endpoint, params ? { params } : {})
      return response.data.data // Extract data from SuccessResponse wrapper
    },
    enabled,
    refetchInterval,
  })
}

export function useMutate<T>(
  method: 'post' | 'put' | 'delete',
  endpoint: string,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
    invalidateQueries?: string[]
    successMessage?: string
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      let response
      if (method === 'post') {
        response = await api.post<SuccessResponse<T>>(endpoint, data)
      } else if (method === 'put') {
        response = await api.put<SuccessResponse<T>>(endpoint, data)
      } else if (method === 'delete') {
        response = await api.delete<SuccessResponse<T>>(endpoint, data)
      }
      return response!.data.data // Extract data from SuccessResponse wrapper
    },
    onSuccess: (data) => {
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] })
        })
      }
      options?.onSuccess?.(data)
    },
    onError: (error: any) => {
      // Handle ErrorResponse format
      const errorResponse: ErrorResponse | undefined = error.response?.data
      if (errorResponse) {
        const message = errorResponse.message
        const errors = errorResponse.errors

        if (errors) {
          // Show validation errors
          Object.values(errors).flat().forEach(err => toast.error(err))
        } else {
          toast.error(message)
        }
      } else {
        toast.error('Operation failed')
      }

      options?.onError?.(error)
    },
  })
}

// Specialized hooks for common operations
export function useGet<T>(endpoint: string, options?: Parameters<typeof useFetch<T>>[1]) {
  return useFetch<T>(endpoint, options)
}

export function usePost<T>(endpoint: string, options?: Parameters<typeof useMutate<T>>[2]) {
  return useMutate<T>('post', endpoint, options)
}

export function usePut<T>(endpoint: string, options?: Parameters<typeof useMutate<T>>[2]) {
  return useMutate<T>('put', endpoint, options)
}

export function useDelete<T>(endpoint: string, options?: Parameters<typeof useMutate<T>>[2]) {
  return useMutate<T>('delete', endpoint, options)
}
