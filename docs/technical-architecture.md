# 🏗️ **SIRAMA - Technical Architecture**

Dokumen ini menjelaskan arsitektur teknis, spesifikasi sistem, dan panduan implementasi SIRAMA.

## 📋 **System Overview**

SIRAMA adalah Sistem Informasi Manajemen Rumah Sakit yang comprehensive untuk rumah sakit tipe C dengan fokus pada:

- **24 Modul Dasar SIMRS** sesuai standar Kemenkes RI
- **Integrasi BPJS Kesehatan** penuh
- **Compliance SIRS/RL1-RL6** otomatis
- **User Experience** yang intuitif
- **Scalability** dan maintainability tinggi

## 🏛️ **Architecture Pattern**

### **Frontend Architecture**
```
Next.js 14 (App Router)
├── Pages (File-based routing)
├── Components (Reusable UI)
├── Hooks (Custom logic)
├── Lib (Utilities & configs)
└── Types (TypeScript definitions)
```

### **Backend Architecture**
```
Laravel 11 (API-first)
├── Controllers (API endpoints)
├── Models (Data entities)
├── Migrations (Database schema)
├── Seeders (Initial data)
└── Middleware (Auth & validation)
```

### **Database Design**
```
MySQL 8.0
├── Users & Roles (RBAC)
├── Patients (Demographics)
├── Medical Records (EMR)
├── Billing & Payments
├── Inventory & Supplies
└── Reports & Analytics
```

## 🔧 **Technology Stack**

### **Frontend Stack**
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 14.x | React framework with SSR |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| State Mgmt | React Query | 5.x | Server state management |
| UI Library | Radix UI | Latest | Accessible components |
| Icons | React Icons | Latest | Icon library |
| Forms | React Hook Form | Latest | Form management |

### **Backend Stack**
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Laravel | 11.x | PHP web framework |
| Language | PHP | 8.2+ | Server-side scripting |
| Database | MySQL | 8.0+ | Relational database |
| Auth | Laravel Sanctum | Latest | API authentication |
| Validation | Laravel Validation | Built-in | Data validation |
| API | Laravel API Resource | Built-in | RESTful APIs |

### **Infrastructure**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Container | Docker | Application containerization |
| Web Server | Nginx | Reverse proxy & static files |
| Process Mgr | PM2 | Node.js process management |
| Database | MySQL 8.0 | Primary data store |
| Cache | Redis | Session & data caching |
| Backup | Automated scripts | Data backup & recovery |

## 📁 **Project Structure**

```
sirama/
├── backend/                          # Laravel API Backend
│   ├── app/
│   │   ├── Http/Controllers/         # API Controllers
│   │   ├── Models/                  # Eloquent Models
│   │   ├── Providers/               # Service Providers
│   │   └── Http/Middleware/         # Custom Middleware
│   ├── database/
│   │   ├── migrations/              # Database Migrations
│   │   ├── seeders/                 # Data Seeders
│   │   └── factories/               # Model Factories
│   ├── routes/
│   │   ├── api.php                  # API Routes
│   │   └── web.php                  # Web Routes
│   └── config/                      # Configuration Files
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                     # App Router Pages
│   │   │   ├── (auth)/              # Authentication Routes
│   │   │   ├── dashboard/           # Dashboard Routes
│   │   │   └── api/                 # API Routes
│   │   ├── components/              # Reusable Components
│   │   │   ├── ui/                  # Base UI Components
│   │   │   ├── dashboard/           # Dashboard Components
│   │   │   ├── table/               # Table Components
│   │   │   └── modal/               # Modal Components
│   │   ├── lib/                     # Utilities & Configs
│   │   │   ├── api/                 # API Client
│   │   │   ├── auth/                # Authentication
│   │   │   ├── roles.ts             # Role Definitions
│   │   │   └── menuByRole.ts        # Menu Configuration
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── types/                   # TypeScript Types
│   │   └── styles/                  # Global Styles
│   └── public/                      # Static Assets
│
├── docs/                            # Documentation
│   ├── README.md                    # Project Overview
│   ├── roles-workflow.md            # Role Definitions
│   ├── technical-architecture.md    # This file
│   ├── api-documentation.md         # API Docs
│   ├── database-schema.md           # Database Schema
│   └── deployment-guide.md          # Deployment Guide
│
├── docker/                          # Docker Configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
└── scripts/                         # Utility Scripts
    ├── backup.sh                    # Database Backup
    ├── deploy.sh                    # Deployment Script
    └── setup.sh                     # Initial Setup
```

## 📋 **File Structure by Role & Menu**

Dokumentasi ini merinci file-file yang digunakan untuk setiap menu berdasarkan role pengguna. Berguna untuk developer dalam memahami struktur kode dan melakukan maintenance.

### **🎯 Role: Pendaftaran**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Home** | `frontend/src/components/dashboard/pendaftaran/page.tsx` | Dashboard overview pendaftaran dengan statistik real-time | `apiAuth.ts`, `menuByRole.ts` |
| **Registrasi** | `frontend/src/components/dashboard/pendaftaran/registrasi/page.tsx` | Halaman registrasi pasien dengan form dan tabel | `apiAuth.ts`, `FaUserPlus`, `FaSearch` |
| **Data Pasien** | `frontend/src/components/dashboard/pendaftaran/pasien/page.tsx` | CRUD data pasien dengan pagination dan search | `apiAuth.ts`, `FaUsers`, `FaPlus`, `FaEdit`, `FaTrash`, `FaPrint` |
| **Antrian** | `frontend/src/components/dashboard/pendaftaran/antrian/page.tsx` | Manajemen antrian pasien dengan status real-time | `apiAuth.ts`, `FaListAlt`, `FaClock`, `FaCheckCircle` |
| **SEP** | `frontend/src/components/dashboard/pendaftaran/sep/page.tsx` | Manajemen Surat Eligibilitas Peserta BPJS | `apiAuth.ts`, `FaShieldAlt`, `FaPlus`, `FaEdit`, `FaEye`, `FaTrash` |

### **👨‍⚕️ Role: Dokter**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/dokter/page.tsx` | Dashboard utama dokter | `apiAuth.ts`, `MdDashboard` |
| **EMR** | `frontend/src/components/dashboard/dokter/emr/page.tsx` | Electronic Medical Record | `apiAuth.ts`, `MdLocalHospital` |
| **CPPT** | `frontend/src/components/dashboard/dokter/cppt/page.tsx` | Care Plan Progress Tracking | `apiAuth.ts`, `MdNoteAlt` |
| **Diagnosis** | `frontend/src/components/dashboard/dokter/diagnosis/page.tsx` | Input dan management diagnosis | `apiAuth.ts`, `MdAssignment` |
| **Resep** | `frontend/src/components/dashboard/dokter/resep/page.tsx` | Penulisan resep obat | `apiAuth.ts`, `MdLocalPharmacy` |
| **Order Lab** | `frontend/src/components/dashboard/dokter/order-lab/page.tsx` | Pemesanan pemeriksaan lab | `apiAuth.ts`, `MdScience` |
| **Order Radiologi** | `frontend/src/components/dashboard/dokter/order-rad/page.tsx` | Pemesanan pemeriksaan radiologi | `apiAuth.ts`, `MdCameraAlt` |

### **👩‍⚕️ Role: Perawat Poli**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/perawatpoli/page.tsx` | Dashboard perawat poli | `apiAuth.ts`, `MdDashboard` |
| **TTV** | `frontend/src/components/dashboard/perawatpoli/ttv/page.tsx` | Tanda-tanda vital pasien | `apiAuth.ts`, `MdFavorite` |
| **CPPT** | `frontend/src/components/dashboard/perawatpoli/cppt/page.tsx` | Care Plan Progress Tracking | `apiAuth.ts`, `MdNoteAlt` |
| **EMR** | `frontend/src/components/dashboard/perawatpoli/emr/page.tsx` | Electronic Medical Record | `apiAuth.ts`, `MdLocalHospital` |
| **Antrian Poli** | `frontend/src/components/dashboard/perawatpoli/antrian-poli/page.tsx` | Manajemen antrian poli | `apiAuth.ts`, `MdListAlt` |

### **🏥 Role: Perawat IGD**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/perawatigd/page.tsx` | Dashboard perawat IGD | `apiAuth.ts`, `MdDashboard` |
| **Triase** | `frontend/src/components/dashboard/perawatigd/triase/page.tsx` | Triase pasien darurat | `apiAuth.ts`, `MdListAlt` |
| **TTV** | `frontend/src/components/dashboard/perawatigd/ttv/page.tsx` | Tanda-tanda vital | `apiAuth.ts`, `MdFavorite` |
| **CPPT** | `frontend/src/components/dashboard/perawatigd/cppt/page.tsx` | Care Plan Progress Tracking | `apiAuth.ts`, `MdNoteAlt` |
| **EMR** | `frontend/src/components/dashboard/perawatigd/emr/page.tsx` | Electronic Medical Record | `apiAuth.ts`, `MdLocalHospital` |
| **Antrian Poli** | `frontend/src/components/dashboard/perawatigd/antrian-poli/page.tsx` | Antrian poli dari IGD | `apiAuth.ts`, `MdListAlt` |

### **💰 Role: Kasir**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/kasir/page.tsx` | Dashboard kasir | `apiAuth.ts`, `MdDashboard` |
| **Billing** | `frontend/src/components/dashboard/kasir/billing/page.tsx` | Pembuatan billing pasien | `apiAuth.ts`, `MdPayment` |
| **Pembayaran** | `frontend/src/components/dashboard/kasir/pembayaran/page.tsx` | Proses pembayaran | `apiAuth.ts`, `MdAttachMoney` |
| **Kwitansi** | `frontend/src/components/dashboard/kasir/kwitansi/page.tsx` | Cetak kwitansi | `apiAuth.ts`, `MdReceiptLong` |
| **Deposit** | `frontend/src/components/dashboard/kasir/deposit/page.tsx` | Manajemen deposit pasien | `apiAuth.ts`, `MdDashboard` |

### **📊 Role: Manajemen RS**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/manajemenrs/page.tsx` | Dashboard manajemen | `apiAuth.ts`, `MdDashboard` |
| **KPI BOR** | `frontend/src/components/dashboard/manajemenrs/kpi-bor/page.tsx` | Bed Occupancy Rate | `apiAuth.ts`, `MdBarChart` |
| **KPI LOS** | `frontend/src/components/dashboard/manajemenrs/kpi-los/page.tsx` | Length of Stay | `apiAuth.ts`, `MdBarChart` |
| **Pendapatan Global** | `frontend/src/components/dashboard/manajemenrs/pendapatan/page.tsx` | Laporan pendapatan | `apiAuth.ts`, `MdAttachMoney` |
| **Indeks Kepuasan** | `frontend/src/components/dashboard/manajemenrs/kepuasan/page.tsx` | Survey kepuasan pasien | `apiAuth.ts`, `MdGroups` |

### **🔧 Role: Admin**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/admin/page.tsx` | Dashboard admin | `apiAuth.ts`, `MdDashboard` |
| **User** | `frontend/src/components/dashboard/admin/user/page.tsx` | Manajemen user | `apiAuth.ts`, `MdPerson` |
| **Role** | `frontend/src/components/dashboard/admin/role/page.tsx` | Konfigurasi role | `apiAuth.ts`, `MdGroupWork` |
| **Relasi Role** | `frontend/src/components/dashboard/admin/relasi/page.tsx` | Relasi role-user | `apiAuth.ts`, `MdGroup` |
| **Audit Log** | `frontend/src/components/dashboard/admin/audit/page.tsx` | Log aktivitas sistem | `apiAuth.ts`, `MdReceiptLong` |
| **Backup Audit** | `frontend/src/components/dashboard/admin/backup/page.tsx` | Backup data audit | `apiAuth.ts`, `MdBackup` |

### **🧬 Role: Analis Lab**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/analislab/page.tsx` | Dashboard analis lab | `apiAuth.ts`, `MdDashboard` |
| **Order Lab** | `frontend/src/components/dashboard/analislab/order-lab/page.tsx` | Penerimaan order lab | `apiAuth.ts`, `MdScience` |
| **Hasil Lab** | `frontend/src/components/dashboard/analislab/hasil-lab/page.tsx` | Input hasil pemeriksaan | `apiAuth.ts`, `MdUploadFile` |
| **Validasi Lab** | `frontend/src/components/dashboard/analislab/validasi-lab/page.tsx` | Validasi hasil lab | `apiAuth.ts`, `MdAssignment` |

### **💊 Role: Apoteker**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/apoteker/page.tsx` | Dashboard apoteker | `apiAuth.ts`, `MdDashboard` |
| **Order Resep** | `frontend/src/components/dashboard/apoteker/order-resep/page.tsx` | Penerimaan resep | `apiAuth.ts`, `MdAssignment` |
| **Validasi Resep** | `frontend/src/components/dashboard/apoteker/validasi-resep/page.tsx` | Validasi resep | `apiAuth.ts`, `MdAssignment` |
| **Dispensing** | `frontend/src/components/dashboard/apoteker/dispensing/page.tsx` | Penyerahan obat | `apiAuth.ts`, `MdLocalPharmacy` |
| **Stok Obat** | `frontend/src/components/dashboard/apoteker/stok/page.tsx` | Monitoring stok obat | `apiAuth.ts`, `MdStorage` |
| **Mutasi Stok** | `frontend/src/components/dashboard/apoteker/mutasi-stok/page.tsx` | Mutasi stok obat | `apiAuth.ts`, `MdAssignment` |

### **📷 Role: Radiografer**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/radiografer/page.tsx` | Dashboard radiografer | `apiAuth.ts`, `MdDashboard` |
| **Order Radiologi** | `frontend/src/components/dashboard/radiografer/order-rad/page.tsx` | Penerimaan order radiologi | `apiAuth.ts`, `MdCameraAlt` |
| **Hasil Radiologi** | `frontend/src/components/dashboard/radiografer/hasil-rad/page.tsx` | Upload hasil radiologi | `apiAuth.ts`, `MdUploadFile` |
| **Validasi Radiologi** | `frontend/src/components/dashboard/radiografer/validasi-rad/page.tsx` | Validasi hasil radiologi | `apiAuth.ts`, `MdAssignment` |

### **🍽️ Role: Gizi**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/gizi/page.tsx` | Dashboard gizi | `apiAuth.ts`, `MdDashboard` |
| **Asesmen Gizi** | `frontend/src/components/dashboard/gizi/asesmen/page.tsx` | Asesmen status gizi | `apiAuth.ts`, `MdFastfood` |
| **Order Diet** | `frontend/src/components/dashboard/gizi/order-diet/page.tsx` | Pemesanan diet | `apiAuth.ts`, `MdAssignment` |
| **Distribusi Diet** | `frontend/src/components/dashboard/gizi/distribusi/page.tsx` | Distribusi makanan | `apiAuth.ts`, `MdLocalPharmacy` |

### **📋 Role: Rekam Medis**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/rekammedis/page.tsx` | Dashboard rekam medis | `apiAuth.ts`, `MdDashboard` |
| **Verifikasi RM** | `frontend/src/components/dashboard/rekammedis/verifikasi/page.tsx` | Verifikasi rekam medis | `apiAuth.ts`, `MdAssignment` |
| **Koding ICD** | `frontend/src/components/dashboard/rekammedis/koding/page.tsx` | Koding diagnosis ICD | `apiAuth.ts`, `MdAssignment` |
| **Grouping INA-CBG** | `frontend/src/components/dashboard/rekammedis/grouping/page.tsx` | Grouping klaim | `apiAuth.ts`, `MdGroupWork` |
| **Berkas Klaim** | `frontend/src/components/dashboard/rekammedis/klaim/page.tsx` | Manajemen berkas klaim | `apiAuth.ts`, `MdFileCopy` |

### **🏢 Role: Kepala Unit**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/kepalaunit/page.tsx` | Dashboard kepala unit | `apiAuth.ts`, `MdDashboard` |
| **KPI BOR** | `frontend/src/components/dashboard/kepalaunit/kpi-bor/page.tsx` | Bed Occupancy Rate | `apiAuth.ts`, `MdBarChart` |
| **KPI LOS** | `frontend/src/components/dashboard/kepalaunit/kpi-los/page.tsx` | Length of Stay | `apiAuth.ts`, `MdBarChart` |
| **KPI TOI** | `frontend/src/components/dashboard/kepalaunit/kpi-toi/page.tsx` | Turn Over Interval | `apiAuth.ts`, `MdBarChart` |

### **👥 Role: SDM**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/sdm/page.tsx` | Dashboard SDM | `apiAuth.ts`, `MdDashboard` |
| **Data Pegawai** | `frontend/src/components/dashboard/sdm/pegawai/page.tsx` | Manajemen data pegawai | `apiAuth.ts`, `MdPeople` |
| **Absensi** | `frontend/src/components/dashboard/sdm/absensi/page.tsx` | Monitoring absensi | `apiAuth.ts`, `MdAssignment` |
| **Presensi** | `frontend/src/components/dashboard/sdm/presensi/page.tsx` | Sistem presensi | `apiAuth.ts`, `MdAssignment` |
| **Gaji** | `frontend/src/components/dashboard/sdm/gaji/page.tsx` | Penggajian pegawai | `apiAuth.ts`, `MdAttachMoney` |

### **💼 Role: Keuangan**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/keuangan/page.tsx` | Dashboard keuangan | `apiAuth.ts`, `MdDashboard` |
| **Jurnal** | `frontend/src/components/dashboard/keuangan/jurnal/page.tsx` | Input jurnal keuangan | `apiAuth.ts`, `MdReceiptLong` |
| **Piutang** | `frontend/src/components/dashboard/keuangan/piutang/page.tsx` | Manajemen piutang | `apiAuth.ts`, `MdAttachMoney` |
| **Hutang** | `frontend/src/components/dashboard/keuangan/hutang/page.tsx` | Manajemen hutang | `apiAuth.ts`, `MdAttachMoney` |
| **Bank** | `frontend/src/components/dashboard/keuangan/bank/page.tsx` | Rekonsiliasi bank | `apiAuth.ts`, `MdPayment` |

### **📦 Role: Logistik Medis**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/logmedis/page.tsx` | Dashboard logistik medis | `apiAuth.ts`, `MdDashboard` |
| **Stok Medis** | `frontend/src/components/dashboard/logmedis/stok/page.tsx` | Monitoring stok alat medis | `apiAuth.ts`, `MdStorage` |
| **Mutasi Stok** | `frontend/src/components/dashboard/logmedis/mutasi/page.tsx` | Mutasi stok alat medis | `apiAuth.ts`, `MdAssignment` |
| **Opname** | `frontend/src/components/dashboard/logmedis/opname/page.tsx` | Stock opname | `apiAuth.ts`, `MdAssignment` |
| **Master Obat** | `frontend/src/components/dashboard/logmedis/obat/page.tsx` | Master data obat | `apiAuth.ts`, `MdLocalPharmacy` |
| **Satuan** | `frontend/src/components/dashboard/logmedis/satuan/page.tsx` | Konfigurasi satuan | `apiAuth.ts`, `MdCategory` |

### **🏢 Role: Logistik Umum**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/logumum/page.tsx` | Dashboard logistik umum | `apiAuth.ts`, `MdDashboard` |
| **Aset** | `frontend/src/components/dashboard/logumum/aset/page.tsx` | Manajemen aset | `apiAuth.ts`, `MdBusiness` |
| **PO** | `frontend/src/components/dashboard/logumum/po/page.tsx` | Purchase Order | `apiAuth.ts`, `MdAssignment` |
| **Barang Nonmedis** | `frontend/src/components/dashboard/logumum/barang/page.tsx` | Stok barang nonmedis | `apiAuth.ts`, `MdStorage` |
| **Kategori Aset** | `frontend/src/components/dashboard/logumum/kategori/page.tsx` | Kategori aset | `apiAuth.ts`, `MdCategory` |

### **🏪 Role: Supplier**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/supplier/page.tsx` | Dashboard supplier | `apiAuth.ts`, `MdDashboard` |
| **Data Supplier** | `frontend/src/components/dashboard/supplier/data/page.tsx` | Master data supplier | `apiAuth.ts`, `MdBusiness` |
| **PO Supplier** | `frontend/src/components/dashboard/supplier/po/page.tsx` | Purchase Order supplier | `apiAuth.ts`, `MdAssignment` |

### **🤝 Role: Penjamin**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/penjamin/page.tsx` | Dashboard penjamin | `apiAuth.ts`, `MdDashboard` |
| **Master Penjamin** | `frontend/src/components/dashboard/penjamin/master/page.tsx` | Master data penjamin | `apiAuth.ts`, `MdPeople` |
| **Relasi Pasien** | `frontend/src/components/dashboard/penjamin/relasi/page.tsx` | Relasi pasien-penjamin | `apiAuth.ts`, `MdGroup` |

### **🛡️ Role: BPJS**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/bpjs/page.tsx` | Dashboard BPJS | `apiAuth.ts`, `MdDashboard` |
| **SEP** | `frontend/src/components/dashboard/bpjs/sep/page.tsx` | Manajemen SEP BPJS | `apiAuth.ts`, `MdShield` |
| **Klaim BPJS** | `frontend/src/components/dashboard/bpjs/klaim/page.tsx` | Klaim BPJS | `apiAuth.ts`, `MdReceiptLong` |
| **Antrol** | `frontend/src/components/dashboard/bpjs/antrol/page.tsx` | Antrean Mobile JKN | `apiAuth.ts`, `MdListAlt` |

### **🔗 Role: Satu Sehat**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/satusehat/page.tsx` | Dashboard Satu Sehat | `apiAuth.ts`, `MdDashboard` |
| **EMR** | `frontend/src/components/dashboard/satusehat/emr/page.tsx` | EMR Satu Sehat | `apiAuth.ts`, `MdLocalHospital` |
| **CPPT** | `frontend/src/components/dashboard/satusehat/cppt/page.tsx` | CPPT Satu Sehat | `apiAuth.ts`, `MdNoteAlt` |
| **Diagnosis** | `frontend/src/components/dashboard/satusehat/diagnosis/page.tsx` | Diagnosis Satu Sehat | `apiAuth.ts`, `MdAssignment` |
| **FHIR Push** | `frontend/src/components/dashboard/satusehat/fhir/page.tsx` | Push data FHIR | `apiAuth.ts`, `MdCloudUpload` |

### **📋 Role: Audit**

| Menu | File Path | Deskripsi | Dependencies |
|------|-----------|-----------|--------------|
| **Dashboard** | `frontend/src/components/dashboard/audit/page.tsx` | Dashboard audit | `apiAuth.ts`, `MdDashboard` |
| **Audit Log** | `frontend/src/components/dashboard/audit/log/page.tsx` | Log aktivitas sistem | `apiAuth.ts`, `MdReceiptLong` |
| **Error Log** | `frontend/src/components/dashboard/audit/error/page.tsx` | Log error sistem | `apiAuth.ts`, `MdError` |
| **UAT Log** | `frontend/src/components/dashboard/audit/uat/page.tsx` | Log testing UAT | `apiAuth.ts`, `MdAssignment` |
| **Backup Audit** | `frontend/src/components/dashboard/audit/backup/page.tsx` | Backup data audit | `apiAuth.ts`, `MdBackup` |

### **🔧 File Dependencies & Utilities**

| File | Purpose | Used By |
|------|---------|---------|
| `frontend/src/lib/menuByRole.ts` | Konfigurasi menu berdasarkan role | Semua dashboard components |
| `frontend/src/lib/apiAuth.ts` | API client dengan authentication | Semua dashboard components |
| `frontend/src/lib/roles.ts` | Definisi role dan permissions | Auth components, guards |
| `frontend/src/lib/useRoles.ts` | Custom hook untuk role management | Role-based components |
| `frontend/src/hooks/useAuth.ts` | Authentication hook | Protected components |
| `frontend/src/hooks/useDashboard.ts` | Dashboard data hook | Dashboard components |
| `frontend/src/components/ui/modal.tsx` | Modal component | Form components |
| `frontend/src/components/ui/button.tsx` | Button component | Semua UI components |
| `frontend/src/components/ui/input.tsx` | Input component | Form components |
| `frontend/src/components/ui/select.tsx` | Select component | Form components |
| `frontend/src/components/RoleGuard.tsx` | Route protection | App router |
| `frontend/src/components/layout/RoleSidebar.tsx` | Sidebar navigation | Dashboard layouts |
| `frontend/src/components/layout/RoleHeader.tsx` | Header component | Dashboard layouts |
| `frontend/src/components/layout/ProtectedLayout.tsx` | Protected layout wrapper | Authenticated routes |

### **📊 Backend API Controllers**

| Controller | File Path | Endpoints | Used By |
|------------|-----------|-----------|---------|
| `PatientController` | `backend/app/Http/Controllers/Api/PatientController.php` | `/api/patients*` | Pasien management |
| `RegistrationController` | `backend/app/Http/Controllers/Api/RegistrationController.php` | `/api/registrations*` | Registrasi management |
| `AuthController` | `backend/app/Http/Controllers/Auth/AuthenticatedSessionController.php` | `/api/auth*` | Authentication |
| `UserController` | `backend/app/Http/Controllers/Api/UserController.php` | `/api/users*` | User management |

### **🗄️ Database Models**

| Model | File Path | Table | Relations |
|-------|-----------|-------|-----------|
| `User` | `backend/app/Models/User.php` | `users` | roles, permissions |
| `Patient` | `backend/app/Models/Patient.php` | `patients` | registrations, medical_records |
| `Registration` | `backend/app/Models/Registration.php` | `registrations` | patient, queue |

### **📝 Notes untuk Developer**

1. **File Naming Convention**: Gunakan format `page.tsx` untuk halaman utama dan `component.tsx` untuk komponen
2. **Import Order**: React imports → Third-party libraries → Local utilities → Types
3. **State Management**: Gunakan React hooks untuk state lokal, React Query untuk server state
4. **Error Handling**: Selalu handle error dengan user-friendly messages
5. **Loading States**: Implement loading indicators untuk UX yang baik
6. **Accessibility**: Pastikan components memiliki proper labels dan ARIA attributes
7. **Performance**: Gunakan React.memo untuk expensive components, implement pagination untuk large datasets
8. **Testing**: Buat unit tests untuk utilities, integration tests untuk API calls

## 🔐 **Security Architecture**

### **Authentication & Authorization**
- **JWT-based Authentication** via Laravel Sanctum
- **Role-Based Access Control (RBAC)** with granular permissions
- **Session Management** with secure cookies
- **Password Policies** with complexity requirements
- **Two-Factor Authentication** (planned)

### **Data Security**
- **Data Encryption** at rest and in transit
- **SQL Injection Prevention** via Eloquent ORM
- **XSS Protection** via Content Security Policy
- **CSRF Protection** via Sanctum tokens
- **Input Validation** on both client and server

### **Compliance**
- **HIPAA Compliance** for medical data
- **PDPO Compliance** for personal data
- **Audit Logging** for all user actions
- **Data Retention Policies** per regulatory requirements

## 📊 **Performance Optimization**

### **Frontend Optimization**
- **Code Splitting** via Next.js dynamic imports
- **Image Optimization** via Next.js Image component
- **Bundle Analysis** and tree shaking
- **Lazy Loading** for dashboard modules
- **Service Worker** for offline capability

### **Backend Optimization**
- **Database Indexing** for query performance
- **Caching Strategy** with Redis
- **API Rate Limiting** to prevent abuse
- **Database Connection Pooling**
- **Query Optimization** with eager loading

### **Infrastructure Optimization**
- **CDN Integration** for static assets
- **Database Replication** for read scaling
- **Load Balancing** for high availability
- **Auto-scaling** based on traffic
- **Monitoring & Alerting** with thresholds

## 🔄 **Integration Points**

### **External Systems**
- **BPJS Kesehatan API** - Claims, SEP, Antrol
- **Satu Sehat Platform** - FHIR integration
- **Bank APIs** - Payment processing
- **SMS Gateway** - Notifications
- **Email Service** - Communications

### **Internal Systems**
- **LIS (Laboratory Information System)**
- **PACS (Picture Archiving & Communication System)**
- **HIS (Hospital Information System)** integration
- **Pharmacy Management System**
- **HR Management System**

## 📈 **Scalability Considerations**

### **Horizontal Scaling**
- **Microservices Architecture** for modular scaling
- **Database Sharding** for large datasets
- **Load Balancing** across multiple servers
- **CDN** for global content delivery

### **Vertical Scaling**
- **Database Optimization** with proper indexing
- **Caching Layers** (Redis, CDN)
- **Asynchronous Processing** for heavy operations
- **Background Jobs** for report generation

## 🧪 **Testing Strategy**

### **Unit Testing**
- **Frontend:** Jest + React Testing Library
- **Backend:** PHPUnit for PHP
- **Coverage:** Minimum 80% code coverage

### **Integration Testing**
- **API Testing** with Postman/Newman
- **E2E Testing** with Playwright
- **Database Testing** with test databases

### **Performance Testing**
- **Load Testing** with Artillery
- **Stress Testing** for peak loads
- **Memory Leak Testing** for long-running processes

## 📊 **Monitoring & Logging**

### **Application Monitoring**
- **Error Tracking** with Sentry
- **Performance Monitoring** with New Relic
- **User Analytics** with custom dashboards
- **System Health Checks** automated

### **Business Monitoring**
- **KPI Dashboards** real-time
- **Patient Flow Analytics**
- **Revenue Tracking**
- **Quality Metrics**

### **Infrastructure Monitoring**
- **Server Monitoring** with Prometheus
- **Database Monitoring** with Percona
- **Network Monitoring** with Nagios
- **Security Monitoring** with OSSEC

## 🚀 **Deployment Strategy**

### **Development Environment**
- **Local Development** with Docker
- **Hot Reload** for rapid development
- **Database Seeding** for consistent data
- **API Mocking** for frontend development

### **Staging Environment**
- **Automated Testing** on every push
- **Integration Testing** with real APIs
- **Performance Testing** automated
- **Security Scanning** automated

### **Production Environment**
- **Blue-Green Deployment** for zero downtime
- **Database Migrations** automated
- **Backup Verification** before deployment
- **Rollback Strategy** documented

## 🔧 **Development Workflow**

### **Git Flow**
```
main (production)
├── develop (integration)
│   ├── feature/dashboard-pendaftaran
│   ├── feature/bpjs-integration
│   └── feature/emr-module
└── hotfix/security-patch
```

### **Code Quality**
- **ESLint** for JavaScript/TypeScript
- **Prettier** for code formatting
- **PHPStan** for PHP static analysis
- **Pre-commit Hooks** for quality gates

### **CI/CD Pipeline**
1. **Code Quality Checks** (Linting, Testing)
2. **Security Scanning** (SAST, DAST)
3. **Build & Package** (Docker images)
4. **Integration Testing** (API, E2E)
5. **Deployment** (Staging → Production)

## 📋 **API Design Principles**

### **RESTful Design**
- **Resource-based URLs** (`/api/patients`, `/api/appointments`)
- **HTTP Methods** (GET, POST, PUT, DELETE)
- **Status Codes** (200, 201, 400, 401, 403, 404, 500)
- **Consistent Response Format** (JSON API specification)

### **Authentication**
- **Bearer Token** via Authorization header
- **Token Refresh** mechanism
- **Role-based Permissions** in middleware

### **Validation**
- **Request Validation** with Laravel validators
- **Response Sanitization** for security
- **Error Messages** user-friendly but not verbose

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Uptime:** 99.9% availability
- **Response Time:** < 2 seconds for API calls
- **Error Rate:** < 0.1% for critical operations
- **Concurrent Users:** Support 1000+ simultaneous users

### **Business Metrics**
- **User Adoption:** 95% of staff using system
- **Process Efficiency:** 30% reduction in administrative time
- **Patient Satisfaction:** > 4.5/5 rating
- **Compliance Rate:** 100% regulatory compliance

---

**📝 Dokumentasi ini akan diperbarui seiring perkembangan sistem SIRAMA.**
