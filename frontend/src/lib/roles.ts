// lib/roles.ts - SIRAMA Role Definitions (Kemenkes Standards)

// 🎯 7 MAIN ROLES (Current Implementation)
export type MainRole =
  | 'admin'           // 👨‍💼 Administrator/IT - System Management
  | 'pendaftaran'    // 📋 Registration - Patient Registration & Queue
  | 'dokter'         // 👨‍⚕️ Doctor - Medical Consultation
  | 'perawat'        // 👩‍⚕️ Nurse - Nursing Care
  | 'apoteker'       // 💊 Pharmacist - Pharmacy Management
  | 'kasir'          // 💰 Cashier - Billing & Payments
  | 'manajemenrs'    // 🏢 Management - Hospital Management

// 🔮 12 FULL ROLES (Future Implementation)
export type FullRole = MainRole
  | 'laboratorium'   // 🔬 Laboratory - Lab Testing
  | 'radiologi'      // 📹 Radiology - Imaging Services
  | 'rekammedis'    // 📄 Medical Records - Documentation
  | 'housekeeping'  // 🧹 Housekeeping - Facility Maintenance
  | 'security'      // 🔒 Security - Hospital Security

// Current implementation uses MainRole
export type Role = MainRole

// ✅ TypeScript type definitions for Kemenkes-compliant roles
