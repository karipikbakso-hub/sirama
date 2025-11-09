# 🏥 SIRAMA
**Sistem Informasi Rumah Sakit Modular Adaptif**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 📖 Tentang Proyek

SIRAMA adalah sistem manajemen rumah sakit (SIMRS) yang dirancang secara **modular** dan **adaptif** untuk melayani berbagai skala fasilitas kesehatan—mulai dari klinik/puskesmas hingga rumah sakit tipe A dan nasional.

### 🎯 Tujuan
- Menyediakan SIMRS yang **mudah dikustomisasi** sesuai kebutuhan faskes
- Mendukung **interoperabilitas** dengan sistem nasional (BPJS, SATUSEHAT)
- Menggunakan **teknologi modern** untuk performa dan skalabilitas tinggi
- Implementasi **best practices** sesuai standar Kemenkes

---

## 🏗️ Arsitektur Teknologi

### Backend
- **Framework**: Laravel 12 (Latest)
- **PHP**: 8.2+
- **Autentikasi**: Laravel Sanctum 4.0
- **Database**: MySQL/MariaDB
- **Permission**: Spatie Laravel Permission 6.23
- **API**: RESTful API dengan CORS

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State Management**: TanStack Query v5.90
- **Data Table**: TanStack Table v8.21
- **Charts**: Chart.js 4.5 & Recharts 3.3
- **Form**: React Hook Form 7.66
- **UI Components**: Radix UI, Lucide Icons
- **Theme**: next-themes 0.4 (dark/light mode)

---

## 📊 Database

### Struktur Database Lengkap
Database SIRAMA terdiri dari **86 tabel** yang mencakup seluruh aspek operasional rumah sakit:

#### Master Tables (25 tabel)
Data referensi permanen:
- `m_roles` - Role sistem
- `m_hak_akses` - Hak akses per role
- `m_unit_kerja` - Unit/departemen RS
- `m_diagnosa` - Master diagnosa ICD-10
- `m_tindakan` - Master tindakan medis
- `m_obat` - Master obat dan alkes
- `m_satuan`, `m_kategori_barang`, `m_supplier`
- `m_aset`, `m_penjamin`, `m_bank`, `m_tarif`
- `m_ruangan`, `m_pasien`, `m_pegawai`
- `m_menu`, `m_kpi`, `m_pengaturan`
- `m_status_kunjungan`, `m_status_pembayaran`, `m_status_rekam_medis`

#### Transaction Tables (61 tabel)
Data transaksi operasional:

**Pelayanan Pasien:**
- Kunjungan, registrasi, antrian, SEP, klaim BPJS, deposit

**Rekam Medis:**
- EMR, CPPT, TTV, triase, asistensi, asesmen gizi

**Penunjang Medis:**
- Order & hasil lab/radiologi, validasi, resep, order diet, distribusi diet

**Keuangan:**
- Billing, pembayaran, kwitansi, jurnal, piutang/hutang, transaksi bank

**Logistik:**
- Stok barang, mutasi, opname, PO, barang nonmedis, pengeluaran barang

**SDM:**
- Absensi, presensi, gaji

**Monitoring & Pelaporan:**
- KPI (BOR, LOS, TOI), kepuasan pasien, pendapatan

**Audit & Log:**
- Log aktivitas, login, error, UAT, backup, integrasi BPJS/SATUSEHAT, notifikasi

### Status Database
✅ **Sudah selesai:**
- Migrasi 86 tabel
- Seeding data master (10 records per tabel)
- Seeding data transaksi sample
- 28 user account dengan berbagai role

---

## 👥 Sistem Role - Standar Kemenkes RI

SIRAMA mengimplementasi **7 role utama** sesuai standar Kemenkes RI untuk rumah sakit tipe C, dengan struktur yang dapat dikembangkan menjadi **12 role lengkap** di masa depan.

### 🎯 7 Role Utama (Current Implementation)

| Role | Status | Dashboard | Menu/Fitur |
|------|--------|-----------|------------|
| **👨‍💼 admin** | ✅ Lengkap | ✅ | User Management, Role Management, System Settings, Audit Logs, Backup & Recovery |
| **📋 pendaftaran** | ✅ Lengkap | ✅ | Patient Registration, Queue Management, Digital Services (BPJS, Mobile JKN), Referral System |
| **👨‍⚕️ dokter** | ✅ Lengkap | ✅ | EMR, CPPT Documentation, Diagnosis, Prescription, Lab/Radiology Orders |
| **👩‍⚕️ perawat** | ✅ Lengkap | ✅ | Vital Signs, CPPT Documentation, Emergency Triage, Patient Care |
| **💊 apoteker** | ✅ Lengkap | ✅ | Prescription Validation, Dispensing, Inventory Management, Stock Transactions |
| **💰 kasir** | ✅ Lengkap | ✅ | Billing Management, Payment Processing, Receipts, Deposit Management |
| **🏢 manajemenrs** | ✅ Lengkap | ✅ | BOR/LOS Analysis, Revenue Analytics, Patient Satisfaction, Quality Indicators |

### 🔮 5 Role Tambahan (Future Implementation)

| Role | Status | Menu Defined | Target Implementation |
|------|--------|--------------|---------------------|
| **🔬 laboratorium** | ⏳ Planned | ✅ | Lab Testing, Result Validation, Equipment Management |
| **📹 radiologi** | ⏳ Planned | ✅ | Imaging Services, PACS Integration, Report Generation |
| **📄 rekammedis** | ⏳ Planned | ✅ | Medical Records, ICD Coding, Claim Preparation |
| **🧹 housekeeping** | ⏳ Planned | ✅ | Facility Maintenance, Cleaning Schedules, Room Status |
| **🔒 security** | ⏳ Planned | ✅ | Access Control, Incident Reports, Surveillance |

### 📊 Role Hierarchy & Permissions

#### **Clinical Staff (Direct Patient Care):**
- **Dokter** - Medical diagnosis & treatment
- **Perawat** - Patient care & monitoring

#### **Support Services:**
- **Apoteker** - Pharmacy management
- **Laboratorium** - Lab testing (future)
- **Radiologi** - Imaging services (future)

#### **Administrative:**
- **Pendaftaran** - Patient registration & queue
- **Kasir** - Billing & payments
- **Rekam Medis** - Documentation (future)

#### **Management:**
- **Manajemen RS** - Hospital management
- **Admin** - System administration

#### **Facility Services (Future):**
- **Housekeeping** - Facility maintenance
- **Security** - Hospital security

---

## 📁 Struktur Proyek

```
sirama/
├── frontend/              # Next.js Application
│   ├── src/
│   │   ├── app/          # App Router Pages
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/          ✅ Implementasi lengkap
│   │   │   │   ├── analislab/      ✅ Dashboard + layout
│   │   │   │   ├── apoteker/       ✅ Dashboard + layout
│   │   │   │   ├── dokter/         ✅ Dashboard + layout
│   │   │   │   ├── kasir/          ✅ Implementasi lengkap
│   │   │   │   ├── manajemenrs/    ✅ Dashboard + layout
│   │   │   │   ├── pendaftaran/    ✅ Dashboard + layout
│   │   │   │   └── perawatpoli/    ✅ Dashboard + layout
│   │   │   ├── login/
│   │   │   ├── unauthorized/
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── auth/        # Login, auth components
│   │   │   ├── dashboard/   # Dashboard cards, stats
│   │   │   ├── layout/      # Sidebar, header, layout
│   │   │   ├── table/       # Data tables by role
│   │   │   ├── chart/       # Charts & statistics
│   │   │   ├── modal/       # Modal dialogs
│   │   │   ├── menu/        # Navigation menus
│   │   │   └── ui/          # UI primitives (button, input, dialog, etc)
│   │   ├── hooks/           # Custom React hooks (useAuth, useUserQuery, etc)
│   │   ├── lib/             # Utilities & configs (apiAuth, apiData, roles, menuByRole)
│   │   ├── types/           # TypeScript type definitions
│   │   └── styles/          # Global styles
│   └── package.json
│
├── laravel/              # Laravel API Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── AuthController.php
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   │   └── User.php
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/      # 86 tabel migrasi
│   │   │   ├── 2025_11_04_000000_create_master_tables.php
│   │   │   └── 2025_11_04_000001_create_transaksi_rs_tables.php
│   │   ├── seeders/         # Data seeding
│   │   │   ├── MasterSeeder.php
│   │   │   ├── TransaksiSeeder.php
│   │   │   ├── UserSeeder.php
│   │   │   └── PermissionSeeder.php
│   │   └── factories/
│   ├── routes/
│   │   ├── api.php
│   │   ├── auth.php
│   │   └── web.php
│   ├── config/
│   │   ├── cors.php
│   │   ├── permission.php
│   │   └── sanctum.php
│   └── composer.json
│
└── docs/                 # Dokumentasi
    ├── standar-fungsional.md  # Kebutuhan fungsional per fase
    ├── standar-teknis.md      # Spesifikasi teknis
    ├── roadmap.md             # Roadmap pengembangan
    ├── modules.md             # Detail modul
    ├── roleAuth.md            # Sistem role & auth
    └── api.md                 # API documentation
```

---

## 🚀 Instalasi & Menjalankan Proyek

### Prerequisites
- PHP 8.2+
- Composer 2.x
- Node.js 18+ & npm
- MySQL/MariaDB 10.x
- XAMPP (recommended untuk development di Windows)

### 1. Clone Repository
```bash
git clone https://github.com/karipikbakso-hub/sirama.git
cd sirama
```

### 2. Setup Backend (Laravel)
```bash
cd laravel

# Install dependencies
composer install

# Setup environment
cp .env.example .env
# Edit .env, sesuaikan konfigurasi database:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sirama
# DB_USERNAME=root
# DB_PASSWORD=

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database dengan data sample (28 users + sample data)
php artisan db:seed

# Start Laravel development server
php artisan serve
# Backend running di http://localhost:8000
```

### 3. Setup Frontend (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend running di http://localhost:3000
```

### 4. Akses Aplikasi
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Login**: Gunakan salah satu dari 28 user yang sudah di-seed (lihat UserSeeder)

---

## 🔐 Keamanan & Autentikasi

### Fitur Keamanan
- ✅ JWT authentication via Laravel Sanctum 4.0
- ✅ Role-based access control (RBAC) with Spatie Permission
- ✅ Protected routes dengan middleware auth:sanctum
- ✅ Audit trail untuk semua aktivitas user
- ✅ CORS configuration untuk frontend-backend communication
- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ XSS & CSRF protection

### Flow Autentikasi
1. User login via `/api/login` → mendapat token Sanctum
2. Token disimpan di cookie (httpOnly untuk keamanan)
3. Setiap request menyertakan token di header
4. Backend validasi token & permissions
5. Frontend guard route berdasarkan role

### Hak Akses
Setiap role memiliki:
- Dashboard khusus dengan menu spesifik
- Akses terbatas ke modul sesuai fungsi
- Proteksi level route dengan `RoleGuard` component
- Menu dinamis via `menuByRole.ts`
- Audit log aktivitas

---

## 📈 Status Development

### ✅ Phase 0: Foundation (SELESAI)
- [x] Setup project structure (Laravel 12 + Next.js 16)
- [x] Database schema design (86 tabel)
- [x] Migration & seeding lengkap
- [x] Authentication system (Sanctum)
- [x] Role-based access control (23 role)
- [x] Basic UI components (button, input, modal, table)
- [x] Layout & navigation system
- [x] Protected routing & RoleGuard
- [x] Theme system (dark/light mode)

### 🚧 Phase 1: Core Implementation (SEDANG BERJALAN)

**Frontend Dashboard:**
- [x] Admin dashboard (user, role, relasi, audit, backup)
- [x] Kasir dashboard (billing, pembayaran, kwitansi, deposit)
- [x] Pendaftaran dashboard (registrasi, pasien, antrian, SEP)
- [x] Dashboard untuk 8 role utama (struktur layout & menu)
- [ ] Implementasi halaman detail per menu
- [ ] Integrasi frontend dengan backend API

**Backend API:**
- [x] Auth endpoints (login, logout, me)
- [x] User CRUD endpoints
- [ ] Master data endpoints (pasien, pegawai, obat, dll)
- [ ] Transaction endpoints (kunjungan, billing, resep, lab, dll)
- [ ] Audit log endpoints
- [ ] File upload endpoints

**Status per Modul:**
- ✅ Authentication & Authorization
- ✅ User Management (frontend + backend)
- ✅ Role Management (frontend structure)
- ✅ Audit System (frontend structure)
- 🚧 Patient Registration (struktur UI ready, perlu API)
- 🚧 EMR/CPPT (struktur UI ready, perlu API)
- 🚧 Billing & Payment (menu ready, perlu implementasi)
- ⏳ Laboratory (dashboard ready, perlu halaman & API)
- ⏳ Pharmacy (dashboard ready, perlu halaman & API)
- ⏳ Radiology (menu defined, perlu implementasi)

### ⏳ Phase 2: Extended Features (PLANNED)
- [ ] Implementasi backend API untuk semua modul
- [ ] Laboratory system lengkap
- [ ] Radiology system lengkap
- [ ] Pharmacy inventory management
- [ ] Reporting system (PDF/Excel export)
- [ ] BPJS integration (SEP, e-Claim, V-Claim)
- [ ] Dashboard analytics & charts

### 🎯 Phase 3: Integration & Scale (FUTURE)
- [ ] SATUSEHAT integration (FHIR resources)
- [ ] Mobile app API
- [ ] Telemedicine features
- [ ] Multi-branch support
- [ ] Advanced analytics & BI
- [ ] Payment gateway integration

---

## 📚 Dokumentasi Lengkap

Untuk informasi lebih detail, lihat dokumentasi di folder `docs/`:

- **[Standar Fungsional](docs/standar-fungsional.md)** - Kebutuhan fungsional per fase
- **[Standar Teknis](docs/standar-teknis.md)** - Spesifikasi teknis & arsitektur
- **[Roadmap](docs/roadmap.md)** - Rencana pengembangan bertahap
- **[Modules](docs/modules.md)** - Detail setiap modul SIMRS
- **[Role & Auth](docs/roleAuth.md)** - Sistem role dan autentikasi
- **[API Documentation](docs/api.md)** - Dokumentasi API endpoints

---

## 🛠️ Development Tools

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

### Backend
```bash
php artisan serve              # Development server
php artisan migrate            # Run migrations
php artisan db:seed            # Seed database
php artisan migrate:fresh --seed  # Reset & seed database
php artisan route:list         # List all routes
php artisan tinker             # Laravel REPL
```

---

## 🤝 Kontribusi

Proyek ini masih dalam tahap pengembangan aktif. Kontribusi sangat diterima!

### Prioritas Development
1. **Backend API** - Implementasi controller & endpoint untuk modul prioritas
2. **Frontend Pages** - Halaman detail untuk menu yang sudah ada
3. **Integration** - Koneksi UI dengan API backend
4. **Testing** - Unit test & integration test
5. **Documentation** - API docs & usage guide

### Tech Stack Requirement
- Familiar dengan Laravel 12, Next.js 16, TypeScript
- Understanding of RESTful API & authentication
- Knowledge of SIMRS/healthcare workflows (plus)

---

## 📝 License

[Tentukan lisensi proyek Anda]

---

## 👨‍💻 Developer

Dikembangkan oleh tim SIRAMA

**Repository**: https://github.com/karipikbakso-hub/sirama

**Latest Commit**: 1bbea75d2820a5e5e4ea554cda9521ad485f50d9

---

## 📞 Kontak & Support

[Tambahkan informasi kontak jika diperlukan]

---

<p align="center">
  <i>SIRAMA - Sistem Informasi Rumah Sakit Modular Adaptif</i><br>
  <i>Modern Healthcare Management System with Laravel 12 & Next.js 16</i>
</p>
