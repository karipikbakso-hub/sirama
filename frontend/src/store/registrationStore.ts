import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types
export interface PatientSearchResult {
  id: number
  no_rm: string
  nama_lengkap: string
  nik: string
  no_bpjs?: string
  jenis_asuransi?: string
  nomor_asuransi?: string
  tanggal_lahir: string
  jenis_kelamin: string
  telepon?: string
}

export interface DoctorOption {
  id: number
  name: string
  specialization: string
  schedule?: any
  quota_remaining?: number
  quota_total?: number
  quota_used?: number
}

export interface PoliOption {
  id: number
  nama_poli: string
  kode_poli: string
}

export interface RegistrationFormData {
  // Patient data (for new patient)
  nik?: string
  nama_lengkap?: string
  tanggal_lahir?: Date
  jenis_kelamin?: 'L' | 'P'
  golongan_darah?: string
  rhesus?: '+' | '-'
  alamat?: string
  provinsi?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  rt?: string
  rw?: string
  kode_pos?: string
  telepon?: string
  telepon_alternatif?: string
  email?: string
  pekerjaan?: string
  status_pernikahan?: string
  agama?: string
  nama_penanggung_jawab?: string
  hubungan_penanggung_jawab?: string
  telepon_penanggung_jawab?: string
  jenis_asuransi?: 'BPJS' | 'Asuransi Swasta' | 'Perusahaan' | 'Umum'
  kelas_bpjs?: '1' | '2' | '3'
  provider_asuransi?: string
  nomor_asuransi?: string
  alergi?: string[]
  penyakit_kronis?: string[]
  kontak_darurat?: string
  foto_pasien?: File

  // Visit registration data
  selected_patient_id?: number
  jenis_kunjungan?: 'Rawat Jalan' | 'IGD' | 'Rujukan'
  poli_id?: number
  dokter_id?: number
  keluhan_utama?: string
  jenis_bayar?: 'BPJS' | 'Umum' | 'Swasta'
}

export interface RegistrationState {
  // Current phase
  currentPhase: 'search' | 'new_patient' | 'visit_registration'

  // Search state
  searchQuery: string
  searchResults: PatientSearchResult[]
  isSearching: boolean
  selectedPatient: PatientSearchResult | null

  // Form data
  formData: RegistrationFormData

  // Options
  poliOptions: PoliOption[]
  doctorOptions: DoctorOption[]

  // UI state
  currentStep: number
  isSubmitting: boolean
  successModal: any

  // Actions
  setCurrentPhase: (phase: 'search' | 'new_patient' | 'visit_registration') => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: PatientSearchResult[]) => void
  setIsSearching: (searching: boolean) => void
  setSelectedPatient: (patient: PatientSearchResult | null) => void
  updateFormData: (data: Partial<RegistrationFormData>) => void
  setPoliOptions: (options: PoliOption[]) => void
  setDoctorOptions: (options: DoctorOption[]) => void
  setCurrentStep: (step: number) => void
  setIsSubmitting: (submitting: boolean) => void
  setSuccessModal: (modal: any) => void
  reset: () => void
}

const initialState = {
  currentPhase: 'search' as const,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  selectedPatient: null,
  formData: {},
  poliOptions: [],
  doctorOptions: [],
  currentStep: 1,
  isSubmitting: false,
  successModal: null,
}

export const useRegistrationStore = create<RegistrationState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentPhase: (phase) => set({ currentPhase: phase }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSearchResults: (results) => set({ searchResults: results }),

      setIsSearching: (searching) => set({ isSearching: searching }),

      setSelectedPatient: (patient) => set({ selectedPatient: patient }),

      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),

      setPoliOptions: (options) => set({ poliOptions: options }),

      setDoctorOptions: (options) => set({ doctorOptions: options }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

      setSuccessModal: (modal) => set({ successModal: modal }),

      reset: () => set(initialState),
    }),
    {
      name: 'registration-store',
    }
  )
)