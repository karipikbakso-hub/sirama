'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiAuth'

export interface Patient {
  id: number
  name: string
  mrn: string
  birth_date: string
  gender: string
  phone?: string
  address?: string
}

export interface Examination {
  id: number
  patient_id: number
  registration_id?: number
  doctor_id: number
  examination_date: string
  chief_complaint: string
  present_illness: string
  past_medical_history?: string
  family_history?: string
  social_history?: string
  allergies?: string
  vital_signs: {
    blood_pressure?: string
    heart_rate?: number
    temperature?: number
    respiratory_rate?: number
    oxygen_saturation?: number
    weight?: number
    height?: number
    bmi?: number
  }
  physical_examination: {
    general?: string
    head_neck?: string
    cardiovascular?: string
    respiratory?: string
    gastrointestinal?: string
    genitourinary?: string
    musculoskeletal?: string
    neurological?: string
    psychiatric?: string
  }
  diagnosis?: string
  icd10_code?: string
  treatment_plan?: string
  prescriptions?: string
  follow_up_instructions?: string
  status: 'draft' | 'completed' | 'reviewed'
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: {
    id: number
    name: string
  }
}

export interface TodayPatient {
  id: number
  patient_id: number
  patient_name: string
  mrn: string
  appointment_time: string
  chief_complaint: string
  status: 'waiting' | 'in_progress' | 'completed'
  priority: 'normal' | 'urgent' | 'emergency'
}

// Hook for today's patients
export function useTodayPatients() {
  return useQuery({
    queryKey: ['today-patients'],
    queryFn: async (): Promise<TodayPatient[]> => {
      try {
        const response = await api.get('/api/doctor/today-patients')
        return response.data.success ? response.data.data : []
      } catch (error) {
        console.error('Error fetching today patients:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for examinations by registration
export function useExaminationByRegistration(registrationId: number | null) {
  return useQuery({
    queryKey: ['examination', registrationId],
    queryFn: async (): Promise<Examination | null> => {
      if (!registrationId) return null

      try {
        const response = await api.get(`/api/examinations/registration/${registrationId}`)
        return response.data.success ? response.data.data : null
      } catch (error) {
        console.error('Error fetching examination:', error)
        return null
      }
    },
    enabled: !!registrationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook for all examinations with pagination
export function useExaminations(page = 1, perPage = 10, search = '') {
  return useQuery({
    queryKey: ['examinations', page, perPage, search],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: perPage.toString(),
        })

        if (search) {
          params.append('search', search)
        }

        const response = await api.get(`/api/examinations?${params}`)
        return response.data.success ? response.data.data : { data: [], meta: {} }
      } catch (error) {
        console.error('Error fetching examinations:', error)
        return { data: [], meta: {} }
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook for creating/updating examinations
export function useExaminationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id?: number; data: Partial<Examination> }) => {
      if (id) {
        const response = await api.put(`/api/examinations/${id}`, data)
        return response.data
      } else {
        const response = await api.post('/api/examinations', data)
        return response.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinations'] })
      queryClient.invalidateQueries({ queryKey: ['examination'] })
      queryClient.invalidateQueries({ queryKey: ['today-patients'] })
    },
  })
}

// Hook for patient search
export function usePatientSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['patient-search', searchTerm],
    queryFn: async (): Promise<Patient[]> => {
      if (!searchTerm || searchTerm.length < 2) return []

      try {
        const response = await api.get(`/api/patients-search?q=${encodeURIComponent(searchTerm)}`)
        return response.data.success ? response.data.data : []
      } catch (error) {
        console.error('Error searching patients:', error)
        return []
      }
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook for examination statistics
export function useExaminationStats() {
  return useQuery({
    queryKey: ['examination-stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/examinations/statistics')
        return response.data.success ? response.data.data : {}
      } catch (error) {
        console.error('Error fetching examination stats:', error)
        return {}
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Custom hook for EMR examination management
export function useEmrExamination() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedExamination, setSelectedExamination] = useState<Examination | null>(null)

  const { data: todayPatients, isLoading: loadingTodayPatients } = useTodayPatients()
  const { data: examination, isLoading: loadingExamination } = useExaminationByRegistration(
    selectedExamination?.registration_id || null
  )
  const examinationMutation = useExaminationMutation()

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const selectExamination = (exam: Examination) => {
    setSelectedExamination(exam)
  }

  const saveExamination = async (data: Partial<Examination>) => {
    try {
      await examinationMutation.mutateAsync({
        id: selectedExamination?.id,
        data: {
          ...data,
          patient_id: selectedPatient?.id,
          status: 'completed'
        }
      })
      return true
    } catch (error) {
      console.error('Error saving examination:', error)
      return false
    }
  }

  const resetSelection = () => {
    setSelectedPatient(null)
    setSelectedExamination(null)
  }

  return {
    // State
    selectedPatient,
    selectedExamination,

    // Data
    todayPatients: todayPatients || [],
    currentExamination: examination,

    // Loading states
    loadingTodayPatients,
    loadingExamination,
    savingExamination: examinationMutation.isPending,

    // Actions
    selectPatient,
    selectExamination,
    saveExamination,
    resetSelection,
  }
}

export default useEmrExamination