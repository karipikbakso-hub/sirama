🏥 SIRAMA - MASTER CONTEXT DOCUMENT
Universal Reference for AI Agents & Developers
Version: 1.0
Last Updated: 2025-11-16
Project: Hospital Information System (SIMRS)
Tech Stack: Laravel 12 (Backend) + Next.js 16 (Frontend)

PURPOSE: This document provides complete system context for AI agents (Claude, ChatGPT, AIDev, etc.) and human developers. Read this FIRST before generating any code.


📋 TABLE OF CONTENTS

System Overview
Architecture & Tech Stack
User Roles & Permissions
Data Models (TypeScript)
API Contracts
Business Rules & Workflows
Component Architecture
Code Standards & Conventions
Integration Points
Security & Compliance


1. SYSTEM OVERVIEW
What is SIRAMA?
Complete Hospital Information System for Indonesian hospitals with 9 user roles managing ~100 features across registration, clinical documentation, pharmacy, laboratory, radiology, billing, and management reporting.
Key Characteristics

Users: 9 distinct roles (Admin, Pendaftaran, Dokter, Perawat, Apoteker, Kasir, Lab, Radiologi, Manajemen)
Scale: ~100 pages, 120+ API endpoints
Complexity: High (medical workflows, integrations, real-time features)
Regulations: Indonesian healthcare compliance (Kemenkes, BPJS, SATUSEHAT)
Devices: Mobile-first (375px+), tablet, desktop

Critical Success Factors

Patient Safety: Zero tolerance for data errors
Performance: <2s page load, <500ms API response
Mobile-First: 60% staff use mobile devices
Integration: BPJS & SATUSEHAT must work flawlessly
Audit Trail: Every action logged for compliance


2. ARCHITECTURE & TECH STACK
Frontend Stack
Framework:     Next.js 16 (App Router, React 19)
Language:      TypeScript (strict mode)
Styling:       Tailwind CSS + CSS Variables (no hardcoded colors)
UI Library:    shadcn/ui (pre-installed)
State:         Zustand (global), React Query (server state)
Forms:         React Hook Form + Zod validation
HTTP Client:   Axios with interceptors
Charts:        Chart.js
Icons:         Lucide React
Backend Stack
Framework:     Laravel 12
Language:      PHP 8.3
Database:      MySQL/PostgreSQL
Auth:          Laravel Sanctum (SPA token-based)
Permissions:   Spatie Laravel Permission
Queue:         Redis + Laravel Horizon
Cache:         Redis
Storage:       Local/S3 for files (DICOM, documents)
Infrastructure
Server:        VPS/Cloud (to be determined)
Web Server:    Nginx
Process:       PHP-FPM
Queue Worker:  Supervisor
Database:      MySQL 8.0+
Cache/Queue:   Redis 7+
SSL:           Let's Encrypt
Monitoring:    Sentry (errors), Uptime (availability)
Development Environment
Frontend:  Node 20+, npm/pnpm
Backend:   PHP 8.3, Composer 2+
Database:  Docker or local MySQL
Tools:     Git, VS Code, Postman/Insomnia

3. USER ROLES & PERMISSIONS
Role Hierarchy
ADMIN (Super User)
├── Full system access
├── User & role management
├── System configuration
└── Integration settings

PENDAFTARAN (Registration Staff)
├── Patient registration
├── Queue management
├── BPJS SEP generation
├── Appointment scheduling
└── Read-only: Patient medical records

DOKTER (Doctor)
├── Electronic Medical Records (EMR)
├── CPPT (Clinical notes)
├── Diagnosis (ICD-10)
├── E-prescription
├── Lab/Radiology orders
└── Read: Patient history, lab/radiology results

PERAWAT (Nurse)
├── Vital signs input
├── Nursing CPPT
├── Triase (Emergency)
├── Medication administration
└── Read: Doctor's orders, patient records

APOTEKER (Pharmacist)
├── Prescription validation
├── Drug interaction checking
├── Dispensing
├── Stock management
└── Read: Patient allergies, diagnoses

KASIR (Cashier)
├── Billing management
├── Payment processing
├── Receipt printing
├── Deposit management
└── Read: Service records, patient data

LABORATORIUM (Lab Technician)
├── Lab order management
├── Result input
├── Result validation
├── Report generation
└── Read: Clinical indication, patient data

RADIOLOGI (Radiology Technician)
├── Radiology order management
├── Result input & DICOM upload
├── Result validation (by radiologist)
├── Report generation
└── Read: Clinical indication, patient data

MANAJEMEN (Management/Director)
├── Dashboard & KPIs
├── Reports & analytics
├── Quality indicators
└── Read-only: All data (aggregated)
Permission Matrix
FeatureAdminPendaftaranDokterPerawatApotekerKasirLabRadiologiManajemenPatient Registration✅✅❌❌❌❌❌❌👁️EMR Write✅❌✅✅❌❌❌❌👁️Prescription Write✅❌✅❌❌❌❌❌👁️Prescription Validate✅❌❌❌✅❌❌❌👁️Billing✅❌❌❌❌✅❌❌👁️Lab Results✅❌👁️👁️❌❌✅❌👁️System Config✅❌❌❌❌❌❌❌❌
Legend: ✅ Full Access | 👁️ Read Only | ❌ No Access

4. DATA MODELS (TypeScript)
Core Patient Data
typescript// Shared across ALL modules - NEVER modify structure without updating all consumers
interface Patient {
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
interface Registration {
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
interface VitalSigns {
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
interface CPPT {
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
interface Diagnosis {
  id: string
  registrationId: string
  
  icd10Code: string // e.g., "A09" for Diarrhoea
  icd10Description: string
  diagnosisType: 'primary' | 'secondary'
  
  createdAt: string
  createdBy: string
}

// Prescription (Resep)
interface Prescription {
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

interface PrescriptionItem {
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
interface LabOrder {
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

interface LabTest {
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
interface RadiologyOrder {
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

interface RadiologyExam {
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
interface Billing {
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

interface BillingItem {
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
interface Payment {
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
interface User {
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

interface Role {
  id: string
  name: 'admin' | 'pendaftaran' | 'dokter' | 'perawat' | 'apoteker' | 'kasir' | 'laboratorium' | 'radiologi' | 'manajemen'
  displayName: string
  permissions: string[]
}

// Audit Log
interface AuditLog {
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

5. API CONTRACTS
Authentication Endpoints
typescript// POST /api/login
Request: {
  email: string
  password: string
}
Response: {
  success: true
  data: {
    token: string
    user: User
  }
  meta: { timestamp: string }
}

// POST /api/logout
Headers: { Authorization: "Bearer {token}" }
Response: {
  success: true
  message: "Logged out successfully"
}

// GET /api/me
Headers: { Authorization: "Bearer {token}" }
Response: {
  success: true
  data: User
}
Standard API Response Format
typescript// Success Response
interface SuccessResponse<T> {
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

// Error Response
interface ErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]> // Validation errors
  meta: {
    timestamp: string
    error_code?: string
  }
}
CRUD Pattern (Example: Patients)
typescript// GET /api/patients - List with pagination
Query Params: {
  page?: number
  per_page?: number
  search?: string // Search by name, MRN, NIK
  filter?: {
    gender?: 'L' | 'P'
    insurance_type?: string
    is_active?: boolean
  }
  sort?: string // e.g., "name:asc", "created_at:desc"
}
Response: SuccessResponse<Patient[]>

// GET /api/patients/{id} - Single record
Response: SuccessResponse<Patient>

// POST /api/patients - Create
Request: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>
Response: SuccessResponse<Patient>

// PUT /api/patients/{id} - Update
Request: Partial<Patient>
Response: SuccessResponse<Patient>

// DELETE /api/patients/{id} - Soft delete
Response: SuccessResponse<{ id: string, deleted: true }>
Role-Specific Endpoints
ADMIN
GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
POST   /api/admin/users/{id}/reset-password
GET    /api/admin/roles
POST   /api/admin/roles
GET    /api/admin/settings
PUT    /api/admin/settings
GET    /api/admin/audit-logs
POST   /api/admin/backup
GET    /api/admin/system-logs
PENDAFTARAN
GET    /api/pendaftaran/dashboard
GET    /api/pendaftaran/patients
POST   /api/pendaftaran/patients
PUT    /api/pendaftaran/patients/{id}
POST   /api/pendaftaran/registrations
GET    /api/pendaftaran/registrations
GET    /api/pendaftaran/queue
PUT    /api/pendaftaran/queue/{id}
GET    /api/pendaftaran/appointments
POST   /api/pendaftaran/appointments
POST   /api/pendaftaran/bpjs/check-participant
POST   /api/pendaftaran/bpjs/create-sep
GET    /api/pendaftaran/bpjs/sep/{sepNumber}
POST   /api/pendaftaran/satusehat/sync
DOKTER
GET    /api/dokter/dashboard
GET    /api/dokter/patients/today
GET    /api/dokter/registrations/{id}/emr
POST   /api/dokter/cppt
POST   /api/dokter/diagnoses
POST   /api/dokter/prescriptions
POST   /api/dokter/lab-orders
POST   /api/dokter/radiology-orders
GET    /api/dokter/patients/{id}/history
PERAWAT
GET    /api/perawat/dashboard
GET    /api/perawat/patients
POST   /api/perawat/vital-signs
POST   /api/perawat/cppt
GET    /api/perawat/registrations/{id}/emr
POST   /api/perawat/triase
GET    /api/perawat/queue
POST   /api/perawat/medication-administration
APOTEKER
GET    /api/apoteker/dashboard
GET    /api/apoteker/prescriptions/pending
PUT    /api/apoteker/prescriptions/{id}/validate
POST   /api/apoteker/dispensing
GET    /api/apoteker/drugs
PUT    /api/apoteker/drugs/{id}/stock
POST   /api/apoteker/stock-mutations
KASIR
GET    /api/kasir/dashboard
GET    /api/kasir/billings
PUT    /api/kasir/billings/{id}
POST   /api/kasir/payments
POST   /api/kasir/receipts/{id}/print
GET    /api/kasir/deposits
POST   /api/kasir/deposits
GET    /api/kasir/reconciliation/daily
LABORATORIUM
GET    /api/lab/dashboard
GET    /api/lab/orders
PUT    /api/lab/orders/{id}/receive
POST   /api/lab/results
PUT    /api/lab/results/{id}/validate
POST   /api/lab/lis/upload
GET    /api/lab/reports
RADIOLOGI
GET    /api/radiologi/dashboard
GET    /api/radiologi/orders
PUT    /api/radiologi/orders/{id}/receive
POST   /api/radiologi/results
POST   /api/radiologi/dicom/upload
PUT    /api/radiologi/results/{id}/validate
GET    /api/radiologi/reports
MANAJEMEN
GET    /api/manajemen/dashboard
GET    /api/manajemen/analytics/bor
GET    /api/manajemen/analytics/los
GET    /api/manajemen/analytics/revenue
GET    /api/manajemen/surveys/patient-satisfaction
GET    /api/manajemen/kpi
GET    /api/manajemen/reports/operational

6. BUSINESS RULES & WORKFLOWS
Patient Registration Workflow
1. Check Patient Existence
   ├─ Search by NIK (16 digits)
   ├─ If exists → Use existing patient
   └─ If not exists → Create new patient
   
2. Validate Patient Data
   ├─ NIK: Must be unique, 16 digits
   ├─ Name: Required, min 3 characters
   ├─ DOB: Required, must be in the past
   ├─ Gender: Required (L/P)
   ├─ Address: Required
   └─ Phone: Required, valid format
   
3. BPJS Validation (if applicable)
   ├─ Check participant eligibility via BPJS API
   ├─ Verify active status
   ├─ Get participant class (1/2/3)
   └─ Validate referral letter (if required)
   
4. Create Registration
   ├─ Generate registration number (REG-YYYYMMDD-XXXX)
   ├─ Assign queue number
   ├─ Set initial status: 'waiting'
   └─ If BPJS → Create SEP
   
5. Generate SEP (for BPJS patients)
   ├─ Required fields:
   │  ├─ BPJS number
   │  ├─ Referral number
   │  ├─ Diagnosis code (ICD-10)
   │  ├─ Poly/department
   │  └─ Doctor
   ├─ Call BPJS API
   └─ Store SEP number in registration
Queue Management Rules
Priority Order:
1. Emergency (Triase Merah) - Immediate
2. Urgent (Triase Kuning) - Within 30 min
3. Elderly (>60 years) - Priority over regular
4. Appointment - By scheduled time
5. Walk-in - FIFO (First In First Out)

Queue Status Flow:
waiting → called → in_progress → completed
                ↓
             skipped (re-queue to end)
             
Actions:
- Call Next: Move first 'waiting' to 'called'
- Skip: Move 'called' back to 'waiting' (end of queue)
- Complete: Mark as 'completed', bill patient
Clinical Documentation (SOAP)
Required Format:
S (Subjective): Patient's complaints in their own words
O (Objective): Physical examination findings, vital signs, lab results
A (Assessment): Diagnosis/working diagnosis (ICD-10 code required)
P (Plan): Treatment plan, medications, orders

Validation Rules:
- All 4 components (SOAP) must be filled
- At least 1 diagnosis (ICD-10) required
- If prescription → Must have assessment justifying it
- If lab/radiology order → Clinical indication required
Prescription Rules
Drug Interaction Checking:
1. Check patient allergies
2. Check drug-drug interactions
3. Check duplicate therapy
4. Check contraindications based on diagnosis
5. Alert pharmacist if any issues found

Controlled Substances:
- Narkotika/Psikotropika require special prescription
- Doctor must have special license (SIP Khusus)
- Maximum 7 days supply
- Strict documentation required

Validation by Pharmacist:
- Verify dosage (by age, weight, kidney/liver function)
- Check route of administration
- Confirm duration
- Approve or reject with reason
Billing Rules
Auto-Billing Triggers:
1. Consultation: When doctor completes CPPT
2. Procedures: When performed (manually added)
3. Medications: When dispensed by pharmacy
4. Lab: When results validated
5. Radiology: When report validated
6. Room charges: Daily (for inpatients)

BPJS Claim:
- Use INA-CBG tariffs (based on diagnosis groups)
- Patient co-pay: Class 3 = 0%, Class 2 = 25%, Class 1 = 100%
- Submit claim to BPJS within 7 days

Cash/Insurance:
- Use hospital's own tariff
- Insurance claims: Generate claim form, submit to provider
- Cash: Immediate payment
Data Integrity Rules
Referential Integrity:
- Registration requires valid Patient ID
- CPPT requires valid Registration ID
- Prescription requires valid Registration + Doctor
- Lab/Radiology order requires valid Registration + Doctor
- Billing requires valid Registration
- Payment requires valid Billing

Immutability:
- Once validated/finalized, cannot be edited (only new version)
- Lab results: Once validated by senior tech, locked
- Radiology: Once validated by radiologist, locked
- Billing: Once paid, locked (only refund possible)
- Payment: Cannot be deleted, only void with reason

Audit