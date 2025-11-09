// 🏥 Role Pendaftaran - SIRAMA
// Export semua components, hooks, services, dan types dari role pendaftaran

// Components
export { default as PatientForm } from './components/PatientForm';
export { default as QueueDisplay } from './components/QueueDisplay';
export { default as SepGenerator } from './components/SepGenerator';

// Hooks
export { usePatient } from './hooks/usePatient';
export { useQueue } from './hooks/useQueue';
export { useSep } from './hooks/useSep';
export { useAntrol } from './hooks/useAntrol';
export { useReferral } from './hooks/useReferral';
export { useAppointment } from './hooks/useAppointment';

// Services
export { patientService } from './services/patientService';
export { queueService } from './services/queueService';
export { sepService } from './services/sepService';
export { antrolService } from './services/antrolService';
export { referralService } from './services/referralService';
export { appointmentService } from './services/appointmentService';

// Types
export type { Patient } from './types/patient';
export type { Queue } from './types/queue';
export type { Sep } from './types/sep';
export type { AntrolQueue } from './types/antrol';
export type { Referral } from './types/referral';
export type { Appointment } from './types/appointment';

// Utils
export { validatePatientData } from './utils/validation';
export { formatPatientName } from './utils/formatting';

// Pages (for dynamic imports)
export { default as HomePage } from './pages/home';
export { default as RegistrasiPage } from './pages/registrasi';
export { default as PasienPage } from './pages/pasien';
export { default as RiwayatPage } from './pages/riwayat';
export { default as AntrianPage } from './pages/antrian';
export { default as AntrianManagementPage } from './pages/antrian-management';
export { default as SepPage } from './pages/sep';
export { default as AntrolPage } from './pages/antrol';
export { default as RujukanPage } from './pages/rujukan';
export { default as AppointmentPage } from './pages/appointment';
export { default as RegistrasiIgdPage } from './pages/registrasi-igd';
export { default as MasterDataPage } from './pages/master-data';
export { default as KpiPage } from './pages/kpi';
export { default as BpjsIntegrationPage } from './pages/bpjs-integration';
export { default as NotificationsPage } from './pages/notifications';
