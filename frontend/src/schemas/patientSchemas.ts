import { z } from 'zod'

// Patient registration validation schema
export const pasienBaruSchema = z.object({
  nik: z.string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya angka'),

  no_bpjs: z.string()
    .length(13, 'BPJS harus 13 digit')
    .regex(/^\d+$/, 'BPJS hanya angka')
    .optional()
    .or(z.literal('')),

  nama_lengkap: z.string()
    .min(3, 'Nama minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter'),

  tanggal_lahir: z.date()
    .refine((date) => date <= new Date(), {
      message: 'Tanggal lahir tidak boleh di masa depan'
    }),

  jenis_kelamin: z.enum(['L', 'P']),

  golongan_darah: z.enum(['A', 'B', 'AB', 'O']).optional(),

  rhesus: z.enum(['+', '-']).optional(),

  // Address fields
  alamat: z.string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),

  provinsi: z.string()
    .min(1, 'Provinsi wajib dipilih')
    .max(100),

  kota: z.string()
    .min(1, 'Kota/Kabupaten wajib dipilih')
    .max(100),

  kecamatan: z.string()
    .min(1, 'Kecamatan wajib dipilih')
    .max(100),

  kelurahan: z.string()
    .min(1, 'Kelurahan wajib dipilih')
    .max(100),

  rt: z.string()
    .max(3, 'RT maksimal 3 karakter')
    .optional()
    .or(z.literal('')),

  rw: z.string()
    .max(3, 'RW maksimal 3 karakter')
    .optional()
    .or(z.literal('')),

  kode_pos: z.string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit')
    .optional()
    .or(z.literal('')),

  // Contact fields
  telepon: z.string()
    .regex(/^08\d{8,12}$/, 'Format telepon: 08xxxxxxxxxx')
    .min(1, 'Telepon wajib diisi'),

  telepon_alternatif: z.string()
    .regex(/^08\d{8,12}$/, 'Format telepon alternatif: 08xxxxxxxxxx')
    .optional()
    .or(z.literal('')),

  email: z.string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),

  // Personal additional fields
  pekerjaan: z.string()
    .max(100, 'Pekerjaan maksimal 100 karakter')
    .optional()
    .or(z.literal('')),

  status_pernikahan: z.string()
    .max(50, 'Status pernikahan maksimal 50 karakter')
    .optional()
    .or(z.literal('')),

  agama: z.string()
    .max(50, 'Agama maksimal 50 karakter')
    .optional()
    .or(z.literal('')),

  // Emergency contact
  nama_penanggung_jawab: z.string()
    .min(3, 'Nama penanggung jawab minimal 3 karakter')
    .max(255, 'Nama penanggung jawab maksimal 255 karakter'),

  hubungan_penanggung_jawab: z.string()
    .max(50, 'Hubungan penanggung jawab maksimal 50 karakter')
    .optional()
    .or(z.literal('')),

  telepon_penanggung_jawab: z.string()
    .regex(/^[0-9+\-\s()]+$/, 'Format telepon tidak valid')
    .min(10, 'Telepon penanggung jawab minimal 10 karakter'),

  kontak_darurat: z.string()
    .min(3, 'Kontak darurat minimal 3 karakter')
    .max(255, 'Kontak darurat maksimal 255 karakter')
    .optional()
    .or(z.literal('')),

  // Insurance fields
  jenis_asuransi: z.enum(['BPJS', 'Asuransi Swasta', 'Perusahaan', 'Umum']),

  kelas_bpjs: z.enum(['1', '2', '3']).optional(),

  provider_asuransi: z.string()
    .max(255, 'Provider asuransi maksimal 255 karakter')
    .optional(),

  nomor_asuransi: z.string()
    .max(50, 'Nomor polis maksimal 50 karakter')
    .optional(),

  // Medical history fields
  alergi: z.array(z.enum(['Aspirin', 'Antibiotik', 'Penicillin', 'Sulfonamid', 'Udang/Lautan', 'Telur', 'Kacang', 'Susu'])),

  penyakit_kronis: z.array(z.enum(['Diabetes', 'Hipertensi', 'Penyakit Jantung', 'Penyakit Ginjal', 'Asma', 'Riwayat Stroke', 'Riwayat Kanker', 'Hepatitis'])),

  // Photo upload (optional)
  foto_pasien: z.any().optional()

}).refine((data) => {
  // Conditional validation: BPJS number required if BPJS type selected
  if (data.jenis_asuransi === 'BPJS') {
    return data.no_bpjs && data.no_bpjs.length === 13;
  }
  return true;
}, {
  message: 'Nomor BPJS wajib diisi untuk jenis asuransi BPJS',
  path: ['no_bpjs']
}).refine((data) => {
  // Conditional validation: BPJS class required if BPJS type selected
  if (data.jenis_asuransi === 'BPJS') {
    return !!data.kelas_bpjs;
  }
  return true;
}, {
  message: 'Kelas BPJS wajib dipilih untuk jenis asuransi BPJS',
  path: ['kelas_bpjs']
}).refine((data) => {
  // Conditional validation: Private insurance provider required for private insurance
  if (data.jenis_asuransi === 'Asuransi Swasta' || data.jenis_asuransi === 'Perusahaan') {
    return data.provider_asuransi && data.provider_asuransi.trim().length > 0;
  }
  return true;
}, {
  message: 'Provider asuransi wajib diisi',
  path: ['provider_asuransi']
}).refine((data) => {
  // Conditional validation: Policy number required for private insurance
  if (data.jenis_asuransi === 'Asuransi Swasta' || data.jenis_asuransi === 'Perusahaan') {
    return data.nomor_asuransi && data.nomor_asuransi.trim().length > 0;
  }
  return true;
}, {
  message: 'Nomor polis wajib diisi',
  path: ['nomor_asuransi']
})

// Type definitions for the schema
export type PasienBaruFormData = z.infer<typeof pasienBaruSchema>

// API response types
export interface PatientRegistrationResponse {
  success: boolean
  data?: {
    pasien: {
      id: number
      no_rm: string
      nama_lengkap: string
      nik: string
    }
    qr_code: string
    no_rm: string
  }
  message?: string
  errors?: Record<string, string[]>
}

export interface NIKCheckResponse {
  exists: boolean
  pasien?: {
    id: number
    no_rm: string
    nama_lengkap: string
  }
}

export interface BPJSValidationResponse {
  valid: boolean
  data?: {
    nama: string
    tgl_lahir: string
    no_kartu: string
  }
  message?: string
}

export interface RegionData {
  id: string
  nama: string
}

export interface SuccessModalData {
  pasien: {
    id: number
    no_rm: string
    nama_lengkap: string
    nik: string
  }
  qr_code_url: string
}

// Emergency IGD registration schema
export const emergencyRegistrationSchema = z.object({
  // Patient type (new or existing)
  patient_type: z.enum(['existing', 'new']),

  // For existing patient
  selected_patient_id: z.number().optional(),

  // For new patient (minimal fields)
  nama_lengkap: z.string().min(3, 'Nama minimal 3 karakter').optional(),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit').optional(),
  tanggal_lahir: z.date().optional(),
  jenis_kelamin: z.enum(['L', 'P']).optional(),
  telepon: z.string().regex(/^08\d{8,12}$/, 'Format: 08xxxxxxxxxx').optional(),

  // Emergency details
  triage_level: z.enum(['merah', 'kuning', 'hijau', 'hitam']),
  keluhan_utama: z.string().min(10, 'Keluhan minimal 10 karakter'),
  cara_masuk: z.enum(['datang_sendiri', 'ambulans_118', 'rujukan_puskesmas', 'rujukan_rs_lain']),
  penjamin: z.enum(['bpjs', 'umum', 'asuransi_swasta']),

  // Triage codes map
  triage_codes: z.enum(['merah', 'kuning', 'hijau', 'hitam'])
})

export type EmergencyRegistrationFormData = z.infer<typeof emergencyRegistrationSchema>

// Emergency queue response type
export interface EmergencyQueueResponse {
  success: boolean
  data: {
    queue_number: string
    priority: 'merah' | 'kuning' | 'hijau' | 'hitam'
    estimated_time: number
    patient: {
      id: number
      nama_lengkap: string
      no_rm: string
    }
    emergency_registration_id: number
  }
  message?: string
}

// Triage level definition
export interface TriageLevel {
  code: 'merah' | 'kuning' | 'hijau' | 'hitam'
  display: string
  emoji: string
  priority: number
  color: string
  bgColor: string
  description: string
  auto_priority: boolean
}

export const TRIAGE_LEVELS: TriageLevel[] = [
  {
    code: 'merah',
    display: 'Merah',
    emoji: '🔴',
    priority: 5,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Resusitasi - Darurat',
    auto_priority: true
  },
  {
    code: 'kuning',
    display: 'Kuning',
    emoji: '🟡',
    priority: 4,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Urgent - Segera',
    auto_priority: true
  },
  {
    code: 'hijau',
    display: 'Hijau',
    emoji: '🟢',
    priority: 3,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Non-urgent - Menunggu',
    auto_priority: false
  },
  {
    code: 'hitam',
    display: 'Hitam',
    emoji: '⚫',
    priority: 1,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'DOA - Meninggal',
    auto_priority: false
  }
]
