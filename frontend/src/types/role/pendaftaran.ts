// Pendaftaran role types and constants

export interface Patient {
  id: number
  nik: string
  name: string
  birthDate: string
  gender: 'L' | 'P'
  phone: string
  email?: string
  address: string
  bpjsNumber?: string
  registrationDate: string
  status: 'active' | 'inactive'
}

export interface Registration {
  id: number
  registrationNumber: string
  patientId: number
  patient: Patient
  doctorId: number
  doctorName: string
  registrationType: 'umum' | 'bpjs' | 'emergency'
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled'
  queueNumber: number
  estimatedTime?: string
  createdAt: string
  updatedAt: string
}

export interface QueueItem {
  id: number
  registrationId: number
  queueNumber: number
  patientName: string
  doctorName: string
  status: 'waiting' | 'called' | 'in_progress' | 'completed'
  estimatedTime: string
  priority: 'normal' | 'urgent' | 'emergency'
}

export interface Appointment {
  id: number
  patientId: number
  patientName: string
  doctorId: number
  doctorName: string
  appointmentDate: string
  appointmentTime: string
  type: 'consultation' | 'follow_up' | 'check_up'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  createdAt: string
}

// Constants
export const REGISTRATION_TYPES = [
  { value: 'umum', label: 'Umum' },
  { value: 'bpjs', label: 'BPJS' },
  { value: 'emergency', label: 'Emergency' }
] as const

export const QUEUE_STATUS = [
  { value: 'waiting', label: 'Menunggu' },
  { value: 'called', label: 'Dipanggil' },
  { value: 'in_progress', label: 'Sedang Dilayani' },
  { value: 'completed', label: 'Selesai' }
] as const

export const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Konsultasi' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'check_up', label: 'Medical Check Up' }
] as const

export const APPOINTMENT_STATUS = [
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'no_show', label: 'Tidak Hadir' }
] as const

export const GENDER_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' }
] as const

export const PRIORITY_LEVELS = [
  { value: 'normal', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
] as const