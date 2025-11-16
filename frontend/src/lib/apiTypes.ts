// API Response Types from Master Context
export interface SuccessResponse<T> {
  success: true
  message?: string
  data: T
  meta?: {
    timestamp: string
    pagination?: {
      current_page: number
      per_page: number
      total: number
      last_page: number
    }
  }
}

export interface ErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
  meta: {
    timestamp: string
    error_code?: string
  }
}

// Core Data Models from Master Context

// Patient (Complete structure)
export interface Patient {
  id: string
  medicalRecordNumber: string // Format: MR-YYYYMMDD-XXXX
  nik: string // 16 digit NIK (unique)
  bpjsNumber?: string // 13 digit BPJS number
  // Demographics
  fullName: string
  dateOfBirth: string // ISO 8601: YYYY-MM-DD
  gender: 'L' | 'P' // L=Laki-laki, P=Perempuan
  bloodType?: 'A' | 'B' | 'AB' | 'O'
  rhesus?: '+' | '-'
  // Contact
  address: string
  province: string
  city: string
  district: string
  subDistrict: string
  postalCode: string
  phone: string
  email?: string
  emergencyContact: string
  emergencyPhone: string
  // Insurance
  insuranceType: 'bpjs' | 'private' | 'company' | 'cash'
  bpjsClass?: '1' | '2' | '3'
  insuranceProvider?: string
  insuranceNumber?: string
  // Medical Info
  allergies?: string[]
  chronicDiseases?: string[]
  // System
  createdAt: string
  updatedAt: string
  createdBy: string
  isActive: boolean
}

// Registration (Kunjungan)
export interface Registration {
  id: string
  registrationNumber: string // Format: REG-YYYYMMDD-XXXX
  registrationDate: string // ISO 8601
  // Patient Reference
  patientId: string
  patient?: Patient // Populated in queries
  // Visit Details
  visitType: 'rawat_jalan' | 'igd' | 'rawat_inap'
  visitCategory: 'baru' | 'lama'
  departmentId: string
  doctorId: string
  // Clinical
  complaints: string // Keluhan utama
  vitalSigns?: VitalSigns
  triaseLevel?: 'merah' | 'kuning' | 'hijau' | 'hitam' // For IGD only
  // BPJS
  sepNumber?: string
  rujukanNumber?: string
  // Queue
  queueNumber?: string
  queueStatus: 'waiting' | 'called' | 'in_progress' | 'completed' | 'cancelled'
  // Payment
  paymentMethod: 'bpjs' | 'cash' | 'insurance' | 'company'
  guarantorLetter?: string // For insurance/company
  // System
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Vital Signs (Used by Perawat)
export interface VitalSigns {
  id: string
  registrationId: string
  bloodPressureSystolic: number // mmHg
  bloodPressureDiastolic: number // mmHg
  heartRate: number // bpm
  respiratoryRate: number // per minute
  temperature: number // Celsius
  oxygenSaturation: number // %
  height?: number // cm
  weight?: number // kg
  bmi?: number // Calculated
  measuredAt: string
  measuredBy: string
}

// CPPT (Catatan Perkembangan Pasien Terintegrasi)
export interface CPPT {
  id: string
  registrationId: string
  patientId: string
  // SOAP Format
  subjective: string // S: Keluhan subjektif pasien
  objective: string // O: Pemeriksaan objektif (TTV, physical exam)
  assessment: string // A: Diagnosis/assessment
  plan: string // P: Rencana tindakan
  // Metadata
  cpptType: 'doctor' | 'nurse'
  createdAt: string
  createdBy: string // User ID
  verifiedBy?: string // For validation
  verifiedAt?: string
}

// Diagnosis (ICD-10)
export interface Diagnosis {
  id: string
  registrationId: string
  icd10Code: string // e.g., "A09" for Diarrhoea
  icd10Description: string
  diagnosisType: 'primary' | 'secondary'
  createdAt: string
  createdBy: string
}

// Prescription (Resep)
export interface Prescription {
  id: string
  prescriptionNumber: string // Format: RX-YYYYMMDD-XXXX
  registrationId: string
  patientId: string
  doctorId: string
  prescriptionDate: string
  items: PrescriptionItem[]
  status: 'pending' | 'validated' | 'dispensed' | 'cancelled'
  validatedBy?: string // Pharmacist ID
  validatedAt?: string
  dispensedBy?: string // Pharmacist ID
  dispensedAt?: string
  notes?: string
  createdAt: string
}

export interface PrescriptionItem {
  id: string
  prescriptionId: string
  drugId: string
  drugName: string
  quantity: number
  unit: string // 'tablet', 'kapsul', 'ml', etc.
  // Signa (Aturan pakai)
  dosage: string // e.g., "500mg"
  frequency: string // e.g., "3x sehari"
  duration: number // days
  instructions: string // e.g., "Sesudah makan"
  // Interaction Check
  hasInteraction: boolean
  interactionWarning?: string
}

// Lab Order
export interface LabOrder {
  id: string
  orderNumber: string // Format: LAB-YYYYMMDD-XXXX
  registrationId: string
  patientId: string
  doctorId: string
  orderDate: string
  tests: LabTest[]
  clinicalIndication: string // Mandatory
  status: 'pending' | 'received' | 'in_progress' | 'completed' | 'cancelled'
  receivedBy?: string // Lab technician
  receivedAt?: string
  completedAt?: string
  createdAt: string
  createdBy: string
}

export interface LabTest {
  id: string
  orderNumber: string
  testCode: string
  testName: string
  specimen: string // 'darah', 'urin', etc.
  result?: string
  unit?: string
  normalRange?: string
  flag?: 'normal' | 'low' | 'high' | 'critical'
  resultEnteredBy?: string
  resultEnteredAt?: string
  validatedBy?: string // Senior technician/pathologist
  validatedAt?: string
}

// Radiology Order
export interface RadiologyOrder {
  id: string
  orderNumber: string // Format: RAD-YYYYMMDD-XXXX
  registrationId: string
  patientId: string
  doctorId: string
  orderDate: string
  examinations: RadiologyExam[]
  clinicalIndication: string // Mandatory
  status: 'pending' | 'received' | 'in_progress' | 'completed' | 'cancelled'
  receivedBy?: string // Radiology technician
  receivedAt?: string
  completedAt?: string
  createdAt: string
  createdBy: string
}

export interface RadiologyExam {
  id: string
  orderNumber: string
  examCode: string
  examName: string // 'Rontgen Thorax', 'CT Scan', etc.
  // Results
  findings?: string // Hasil pemeriksaan
  impression?: string // Kesan radiologi
  dicomImages?: string[] // URLs to DICOM files
  performedBy?: string // Radiographer
  performedAt?: string
  validatedBy?: string // Radiologist (doctor)
  validatedAt?: string
}

// Billing
export interface Billing {
  id: string
  billNumber: string // Format: BILL-YYYYMMDD-XXXX
  registrationId: string
  patientId: string
  billDate: string
  items: BillingItem[]
  subtotal: number
  discountAmount: number
  discountPercentage: number
  taxAmount: number
  totalAmount: number
  status: 'draft' | 'finalized' | 'paid' | 'cancelled'
  finalizedAt?: string
  createdAt: string
  createdBy: string
}

export interface BillingItem {
  id: string
  billNumber: string
  serviceType: 'consultation' | 'procedure' | 'medication' | 'lab' | 'radiology' | 'room' | 'other'
  serviceName: string
  serviceCode: string
  quantity: number
  unitPrice: number
  totalPrice: number
  // BPJS
  isCoveredByInsurance: boolean
  insuranceAmount?: number
  patientAmount?: number
}

// Payment
export interface Payment {
  id: string
  paymentNumber: string // Format: PAY-YYYYMMDD-XXXX
  billNumber: string
  paymentDate: string
  paymentMethod: 'cash' | 'debit' | 'credit' | 'transfer' | 'deposit' | 'insurance'
  amount: number
  receivedAmount: number
  changeAmount: number
  // For non-cash
  cardNumber?: string
  bankName?: string
  transactionReference?: string
  // Deposit
  depositId?: string
  receiptNumber: string
  printedAt?: string
  createdAt: string
  createdBy: string
}

// User (System)
export interface User {
  id: string
  username: string
  email: string
  fullName: string
  // Role & Permissions
  roles: Role[]
  permissions: string[]
  // Profile
  nip?: string // Employee ID
  licenseNumber?: string // For doctors (SIP), nurses (STR)
  specialization?: string // For doctors
  departmentId?: string
  // Status
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: 'admin' | 'pendaftaran' | 'dokter' | 'perawat' | 'apoteker' | 'kasir' | 'laboratorium' | 'radiologi' | 'manajemen'
  displayName: string
  permissions: string[]
}

// Audit Log
export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string // 'create', 'update', 'delete', 'view'
  resourceType: string // 'patient', 'registration', 'prescription', etc.
  resourceId: string
  changes?: Record<string, any> // Old vs new values
  ipAddress: string
  userAgent: string
  timestamp: string
}
