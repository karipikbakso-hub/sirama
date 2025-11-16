// Role-specific dashboard hooks
export { useAdminDashboard, useUserManagement, useSystemMonitoring } from './useAdminDashboard'
export { usePendaftaranDashboard, usePatientSearch, useQueueManagement } from './usePendaftaranDashboard'
export { useDokterDashboard } from './useDokterDashboard'
export { usePerawatDashboard } from './usePerawatDashboard'
export { useApotekerDashboard } from './useApotekerDashboard'
export { useKasirDashboard } from './useKasirDashboard'
export { useManajemenRsDashboard } from './useManajemenRsDashboard'

// Re-export types
export type {
  SystemStats,
  UserActivity,
  SystemAlert,
  AdminDashboardData
} from './useAdminDashboard'

export type {
  PatientStats,
  QueueStats,
  DashboardStats,
  Activity,
  Alert
} from './usePendaftaranDashboard'

export type {
  DoctorStats,
  PatientQueue,
  TodaySchedule,
  DokterDashboardData
} from './useDokterDashboard'

export type {
  NursingStats,
  PatientVitalSigns
} from './usePerawatDashboard'

export type {
  PharmacyStats,
  PrescriptionQueue
} from './useApotekerDashboard'

export type {
  BillingStats,
  PendingPayment
} from './useKasirDashboard'

export type {
  HospitalStats,
  KPIIndicators,
  DepartmentPerformance
} from './useManajemenRsDashboard'