# 📋 Dashboard: Pendaftaran

## 1. Informasi Umum
- **Controller utama:** `RegistrationController`, `PatientController`, `SepController`, `ReferralController`, `BpjsIntegrationController`
- **Model utama:** `Patient`, `Registration`, `Sep`, `Referral`, `BpjsIntegration`, `QueueManagement`, `Appointment`
- **Tabel utama:** `patients`, `registrations`, `seps`, `referrals`, `bpjs_integrations`, `queue_managements`, `appointments`
- **Deskripsi:** Dashboard pendaftaran menangani registrasi pasien baru/lama, manajemen antrian, pembuatan SEP BPJS, sistem rujukan, dan integrasi layanan digital kesehatan sesuai standar Kemenkes RI.

## 2. Tabel dan Relasi

### 2.1 Struktur Tabel Utama

| Tabel | Relasi | Deskripsi Singkat |
|--------|---------|-------------------|
| `patients` | **Parent table** | Master data pasien dengan MRN, NIK, data pribadi |
| `registrations` | `belongsTo → patients` | Data registrasi kunjungan pasien ke unit pelayanan |
| `seps` | `belongsTo → patients, registrations` | Surat Elektronik Pasien BPJS |
| `referrals` | `belongsTo → patients` | Sistem rujukan antar fasilitas kesehatan |
| `bpjs_integrations` | `belongsTo → patients` | Integrasi data BPJS pasien |
| `queue_managements` | `belongsTo → registrations` | Manajemen antrian berdasarkan registrasi |
| `appointments` | `belongsTo → patients` | Sistem janji temu pasien |
| `patient_communications` | `belongsTo → patients` | Komunikasi dengan pasien |
| `emergency_registrations` | `belongsTo → patients` | Registrasi kasus emergency IGD |
| `patient_histories` | `belongsTo → patients, registrations` | Riwayat medis pasien |

### 2.2 Diagram Relasi Database

```
patients (1) ──── (many) registrations
    │                       │
    │                       │
    ├── (many) seps         ├── (1) queue_managements
    │                       │
    ├── (many) referrals    ├── (many) patient_histories
    │                       │
    ├── (many) bpjs_integrations
    │
    ├── (many) appointments
    │
    ├── (many) patient_communications
    │
    └── (many) emergency_registrations
```

### 2.3 Relasi Antar Tabel

- **patients** ↔ **registrations**: One-to-Many (satu pasien bisa daftar berkali-kali)
- **registrations** ↔ **seps**: One-to-One (satu registrasi satu SEP)
- **patients** ↔ **referrals**: One-to-Many (pasien bisa dirujuk berkali-kali)
- **patients** ↔ **bpjs_integrations**: One-to-Many (multiple BPJS data per pasien)
- **registrations** ↔ **queue_managements**: One-to-One (satu registrasi satu antrian)
- **patients** ↔ **appointments**: One-to-Many (pasien bisa buat janji temu berkali-kali)
- **patients** ↔ **patient_communications**: One-to-Many (multiple komunikasi per pasien)
- **patients** ↔ **emergency_registrations**: One-to-Many (kasus emergency per pasien)
- **patients** ↔ **patient_histories**: One-to-Many (riwayat medis per pasien)

## 3. Tabel Database per Menu

### 3.1 Beranda (`/dashboard/pendaftaran`)
**Tabel yang digunakan:**
- `registrations` - Statistik registrasi harian (total, status)
- `patients` - Jumlah total pasien aktif
- `queue_managements` - Status antrian saat ini
- `seps` - Jumlah SEP yang aktif hari ini

**Operasi:** Read/Aggregate

### 3.2 Dashboard KPI (`/dashboard/pendaftaran/kpi`)
**Tabel yang digunakan:**
- `registrations` - KPI registrasi (BOR, LOS, throughput harian)
- `patients` - KPI demografi pasien (usia, gender, baru/lama)
- `queue_managements` - KPI waktu tunggu antrian
- `seps` - KPI cakupan BPJS dan klaim

**Operasi:** Read/Aggregate

### 3.3 Pendaftaran Pasien

#### 3.3.1 Pendaftaran Baru (`/dashboard/pendaftaran/registrasi`)
**Tabel yang digunakan:**
- `patients` - Data master pasien (Create/Update)
- `registrations` - Data registrasi kunjungan (Create)
- `queue_managements` - Penugasan nomor antrian otomatis (Create)

**Operasi:** CRUD (Create pasien baru + registrasi)

#### 3.3.2 Data Pasien (`/dashboard/pendaftaran/pasien`)
**Tabel yang digunakan:**
- `patients` - Master data pasien lengkap (CRUD)
- `bpjs_integrations` - Data BPJS pasien (Read untuk validasi)

**Operasi:** CRUD (full patient management)

#### 3.3.3 Riwayat Medis (`/dashboard/pendaftaran/riwayat`)
**Tabel yang digunakan:**
- `patient_histories` - Riwayat kunjungan dan diagnosis (CRUD)
- `patients` - Data pasien untuk referensi (Read)
- `registrations` - Link ke registrasi terkait (Read)

**Operasi:** CRUD (medical history management)

#### 3.3.4 Pendaftaran IGD (`/dashboard/pendaftaran/registrasi-igd`)
**Tabel yang digunakan:**
- `emergency_registrations` - Data registrasi emergency (CRUD)
- `patients` - Data pasien emergency (Read/Create)
- `queue_managements` - Antrian prioritas tinggi (Create)

**Operasi:** CRUD (emergency registration)

### 3.4 Manajemen Antrian

#### 3.4.1 Monitor Antrian (`/dashboard/pendaftaran/antrian`)
**Tabel yang digunakan:**
- `queue_managements` - Status antrian real-time (Read)
- `registrations` - Data registrasi terkait antrian (Read)
- `patients` - Info pasien dalam antrian (Read)

**Operasi:** Read (real-time monitoring)

#### 3.4.2 Kontrol Antrian (`/dashboard/pendaftaran/antrian-management`)
**Tabel yang digunakan:**
- `queue_managements` - Update status antrian (Update)
- `registrations` - Update status registrasi (Update)

**Operasi:** Update (queue status management)

### 3.5 Layanan Digital

#### 3.5.1 SEP BPJS (`/dashboard/pendaftaran/sep`)
**Tabel yang digunakan:**
- `seps` - Data Surat Elektronik Pasien (CRUD)
- `patients` - Validasi data BPJS pasien (Read)
- `registrations` - Link ke registrasi aktif (Read)

**Operasi:** CRUD (SEP management)

#### 3.5.2 Mobile JKN (`/dashboard/pendaftaran/antrol`)
**Tabel yang digunakan:**
- `appointments` - Sistem janji temu mobile (CRUD)
- `patients` - Data pasien untuk booking (Read)

**Operasi:** CRUD (mobile appointment booking)

#### 3.5.3 Janji Temu (`/dashboard/pendaftaran/appointment`)
**Tabel yang digunakan:**
- `appointments` - Manajemen jadwal temu (CRUD)
- `patients` - Data pasien yang booking (Read)
- `doctors` - Info dokter yang tersedia (Read)

**Operasi:** CRUD (appointment scheduling)

#### 3.5.4 Integrasi BPJS (`/dashboard/pendaftaran/bpjs-integration`)
**Tabel yang digunakan:**
- `bpjs_integrations` - Data integrasi BPJS (CRUD)
- `bpjs_configurations` - Konfigurasi API BPJS (Read)
- `patients` - Sinkronisasi data pasien BPJS (Read/Update)

**Operasi:** CRUD (BPJS data integration)

### 3.6 Sistem Rujukan (`/dashboard/pendaftaran/rujukan`)
**Tabel yang digunakan:**
- `referrals` - Data rujukan antar fasilitas (CRUD)
- `patients` - Data pasien yang dirujuk (Read)
- `doctors` - Dokter yang membuat rujukan (Read)

**Operasi:** CRUD (referral management)

### 3.7 Administrasi

#### 3.7.1 Data Master (`/dashboard/pendaftaran/master-data`)
**Tabel yang digunakan:**
- `doctors` - Master data dokter (CRUD)
- `medicines` - Master data obat (CRUD)
- `icd10_diagnoses` - Master data diagnosis ICD-10 (CRUD)
- `bpjs_configurations` - Konfigurasi sistem BPJS (CRUD)

**Operasi:** CRUD (master data management)

#### 3.7.2 Komunikasi Pasien (`/dashboard/pendaftaran/notifications`)
**Tabel yang digunakan:**
- `patient_communications` - Log komunikasi dengan pasien (CRUD)
- `patients` - Data kontak pasien (Read)

**Operasi:** CRUD (patient communication log)

## 4. Penggunaan Tabel di Dashboard Lain

| Tabel | Digunakan di Dashboard | Controller/Model | Tujuan Penggunaan |
|--------|-------------------------|---------------------|--------------------|
| `patients` | `dokter`, `perawat`, `kasir`, `apoteker` | `RekamMedisController`, `BillingController` | Data pasien untuk pemeriksaan, perawatan, pembayaran |
| `registrations` | `dokter`, `perawat` | `KunjunganController` | Riwayat kunjungan dan status pasien |
| `seps` | `kasir` | `BillingController` | Validasi pembayaran BPJS |
| `patient_histories` | `dokter`, `perawat` | `MedicalRecordController` | Riwayat medis untuk diagnosis |
| `queue_managements` | `perawat` | `QueueController` | Update status antrian |
| `appointments` | `dokter` | `AppointmentController` | Konfirmasi jadwal temu |
| `referrals` | `manajemenrs` | `LaporanController` | Analisis rujukan antar fasilitas |
| `bpjs_integrations` | `kasir` | `BillingController` | Verifikasi klaim BPJS |
| `emergency_registrations` | `perawat`, `dokter` | `EmergencyController` | Penanganan kasus emergency |
| `patient_communications` | `manajemenrs` | `CommunicationController` | Laporan komunikasi pasien |

## 5. API Endpoints per Menu

### 5.1 Patient Management
- `GET /api/patients` - List patients with pagination
- `POST /api/patients` - Create new patient
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient
- `GET /api/patients-search` - Search patients

### 5.2 Registration Management
- `GET /api/registrations` - List registrations
- `POST /api/registrations` - Create registration
- `GET /api/registrations/{id}` - Get registration details
- `PUT /api/registrations/{id}` - Update registration
- `PUT /api/registrations/{id}/status` - Update status
- `GET /api/registrations-statistics` - Get statistics
- `GET /api/queue-list` - Get queue list

### 5.3 SEP Management
- `GET /api/seps` - List SEPs
- `POST /api/seps` - Create SEP
- `GET /api/seps/{id}` - Get SEP details
- `PUT /api/seps/{id}` - Update SEP
- `DELETE /api/seps/{id}` - Delete SEP
- `GET /api/seps-statistics` - Get SEP statistics

### 5.4 Queue Management
- `GET /api/queue` - Get current queue
- `PUT /api/queue/{id}` - Update queue status
- `POST /api/queue/generate` - Generate queue number

### 5.5 Appointment Management
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### 5.6 Referral Management
- `GET /api/referrals` - List referrals
- `POST /api/referrals` - Create referral
- `PUT /api/referrals/{id}` - Update referral status

### 5.7 BPJS Integration
- `GET /api/bpjs-integration` - Get BPJS data
- `POST /api/bpjs-integration/sync` - Sync BPJS data
- `PUT /api/bpjs-integration/{id}` - Update BPJS integration

## 6. Workflow Pendaftaran

### 6.1 Normal Registration Flow
1. **Patient Search/Registration** → `patients` table
2. **Visit Registration** → `registrations` table
3. **Queue Assignment** → `queue_managements` table
4. **SEP Creation** (if BPJS) → `seps` table
5. **Referral Process** (if needed) → `referrals` table

### 6.2 Emergency Registration Flow
1. **Emergency Registration** → `emergency_registrations` table
2. **Patient Data** → `patients` table
3. **Priority Queue** → `queue_managements` table
4. **Immediate Triage** → Update status

### 6.3 Appointment Flow
1. **Appointment Booking** → `appointments` table
2. **Patient Validation** → `patients` table
3. **Schedule Confirmation** → Update appointment status

## 7. Data Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Patient       │───▶│  Registration   │───▶│   Queue         │
│   Data          │    │   Process       │    │   Management    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BPJS          │    │   SEP           │    │   Appointment   │
│   Integration   │    │   Creation      │    │   System       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Referral      │    │   Medical       │    │   Billing       │
│   System        │    │   Records       │    │   System       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 8. Security & Access Control

### 8.1 Role Permissions
- **pendaftaran**: Full CRUD pada semua tabel pendaftaran
- **Read Access**: Patient data untuk validasi
- **Create/Update**: Registrations, SEPs, Appointments, Referrals
- **Delete**: Cancelled registrations dan invalid data

### 8.2 Data Validation
- **Patient Data**: NIK uniqueness, age validation
- **Registration**: Service unit availability, doctor assignment
- **SEP**: BPJS number format, active registration check
- **Queue**: Sequential numbering, service unit grouping

## 9. Performance Considerations

### 9.1 Database Indexes
- `patients.nik` - Unique index for fast lookup
- `patients.mrn` - Index for patient search
- `registrations.patient_id` - Foreign key index
- `registrations.created_at` - Date range queries
- `queue_managements.service_unit` - Queue filtering

### 9.2 Caching Strategy
- **Patient Search**: Redis cache for frequent searches
- **Queue Status**: Real-time updates with WebSocket
- **Statistics**: Daily aggregation cache
- **Master Data**: Long-term cache for doctors/medicines

### 9.3 Query Optimization
- **Pagination**: All list endpoints use pagination
- **Eager Loading**: Relationships loaded as needed
- **Search Optimization**: Full-text search with indexes
- **Statistics**: Pre-calculated aggregations

## 10. Integration Points

### 10.1 External Systems
- **BPJS API**: Real-time SEP validation and claims
- **Hospital Information System**: Patient data sync
- **Pharmacy System**: Medicine availability check
- **Laboratory System**: Test order integration

### 10.2 Internal Systems
- **Doctor Dashboard**: Patient history access
- **Nurse Dashboard**: Vital signs and care plans
- **Pharmacy Dashboard**: Prescription management
- **Cashier Dashboard**: Billing and payments
- **Management Dashboard**: KPI and reporting

---

**Dokumentasi lengkap Dashboard Pendaftaran - SIRAMA Healthcare Management System**
**Dibuat pada:** November 2025
**Versi:** 1.0
**Standar:** Kemenkes RI
