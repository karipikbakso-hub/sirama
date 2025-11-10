import { useQuery } from '@tanstack/react-query'
import apiAuth from '@/lib/apiAuth'

// Types for EMR data
export interface Patient {
  id: number
  nama: string
  mrn: string
  umur: number
  jenis_kelamin: 'L' | 'P'
  bpjs_number?: string
  nik?: string
  alamat?: string
  no_telepon?: string
  email?: string
  golongan_darah?: string
  tanggal_lahir?: string
}

export interface VitalSigns {
  blood_pressure: string
  heart_rate: string
  temperature: string
  respiratory_rate: string
  oxygen_saturation: string
  recorded_at: string
}

export interface PatientHistory {
  id: number
  tanggal_kunjungan: string
  diagnosis: string
  treatment: string
  notes?: string
}

export interface EMRData {
  patient: Patient
  vital_signs: VitalSigns
  medical_history: PatientHistory[]
  current_medications: Prescription[]
}

export interface Prescription {
  id: number
  id_pasien: number
  id_dokter: number
  tanggal_resep: string
  diagnosa: string
  status: 'aktif' | 'selesai' | 'dibatalkan'
  catatan?: string
  dokter?: {
    id: number
    nama: string
  }
  pembuat?: {
    id: number
    name: string
  }
}

export interface CPPTEntry {
  id: number
  id_pasien: number
  id_dokter: number
  tanggal_waktu: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  instruksi?: string
  evaluasi?: string
  jenis_profesi: string
  dokter?: {
    id: number
    nama: string
  }
  pembuat?: {
    id: number
    name: string
  }
}

export interface LabOrder {
  id: number
  id_pasien: number
  id_dokter: number
  id_laboratorium: number
  tanggal_pesanan: string
  urgensi: 'rutin' | 'cito' | 'stat'
  status_pesanan: string
  diagnosa_klinis: string
  catatan?: string
  dokter?: {
    id: number
    nama: string
  }
  pembuat?: {
    id: number
    name: string
  }
}

export interface RadiologyOrder {
  id: number
  id_pasien: number
  id_dokter: number
  id_radiologi: number
  tanggal_pesanan: string
  urgensi: 'rutin' | 'cito' | 'stat'
  status_pesanan: string
  diagnosa_klinis: string
  catatan?: string
  dokter?: {
    id: number
    nama: string
  }
  pembuat?: {
    id: number
    name: string
  }
}

export interface ICD10Diagnosis {
  id: number
  code: string
  description: string
  chapter?: string
}

// API hooks for EMR data
export const usePatientEmr = (patientId: number) => {
  return useQuery({
    queryKey: ['emr', 'patient', patientId],
    queryFn: async (): Promise<EMRData> => {
      const response = await apiAuth.get(`/doctor/emr/${patientId}`)
      return response.data.data
    },
    enabled: !!patientId,
  })
}

export const useCpptEntries = (patientId: number, page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ['emr', 'cppt', patientId, page, perPage],
    queryFn: async () => {
      const response = await apiAuth.get(`/doctor/cppt/${patientId}`, {
        params: { page, per_page: perPage }
      })
      return response.data.data
    },
    enabled: !!patientId,
  })
}

export const usePrescriptions = (patientId: number, page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ['emr', 'prescriptions', patientId, page, perPage],
    queryFn: async () => {
      const response = await apiAuth.get(`/doctor/prescriptions/${patientId}`, {
        params: { page, per_page: perPage }
      })
      return response.data.data
    },
    enabled: !!patientId,
  })
}

export const useLabOrders = (patientId: number, page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ['emr', 'lab-orders', patientId, page, perPage],
    queryFn: async () => {
      const response = await apiAuth.get(`/doctor/lab-orders/${patientId}`, {
        params: { page, per_page: perPage }
      })
      return response.data.data
    },
    enabled: !!patientId,
  })
}

export const useRadiologyOrders = (patientId: number, page = 1, perPage = 10) => {
  return useQuery({
    queryKey: ['emr', 'radiology-orders', patientId, page, perPage],
    queryFn: async () => {
      const response = await apiAuth.get(`/doctor/radiology-orders/${patientId}`, {
        params: { page, per_page: perPage }
      })
      return response.data.data
    },
    enabled: !!patientId,
  })
}

export const useIcd10Diagnoses = (search?: string, page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['emr', 'diagnoses', search, page, perPage],
    queryFn: async () => {
      const response = await apiAuth.get('/doctor/diagnoses', {
        params: { search, page, per_page: perPage }
      })
      return response.data.data
    },
  })
}
