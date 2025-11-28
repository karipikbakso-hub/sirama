# 🏥 Backend Role Pendaftaran - SIRAMA

Backend API untuk modul pendaftaran pasien yang fully compliant dengan standar Kemenkes RI.

## 📋 **Overview**

Backend role pendaftaran menyediakan API endpoints untuk:
- CRUD operations untuk pasien dan registrasi
- Manajemen antrian dan SEP BPJS
- Integrasi Mobile JKN (Antrol)
- Sistem rujukan dan appointment
- Dashboard KPI dan reporting
- Patient notifications

## 📁 **Struktur Folder**

```
backend/roles/pendaftaran/
├── Controllers/         # API Controllers
│   ├── PatientController.php
│   ├── RegistrationController.php
│   ├── QueueController.php
│   ├── SepController.php
│   ├── AntrolController.php
│   ├── ReferralController.php
│   ├── AppointmentController.php
│   ├── KpiController.php
│   └── NotificationController.php
├── Models/             # Eloquent Models
│   ├── Patient.php
│   ├── Registration.php
│   ├── Queue.php
│   ├── Sep.php
│   ├── AntrolQueue.php
│   ├── Referral.php
│   ├── Appointment.php
│   ├── KpiReport.php
│   └── PatientNotification.php
├── Services/           # Business Logic
│   ├── PatientService.php
│   ├── QueueService.php
│   └── SepService.php
├── database/           # Database files
│   ├── migrations/
│   │   ├── 2025_11_08_150000_create_antrol_queues_table.php
│   │   ├── 2025_11_08_150100_create_referrals_table.php
│   │   ├── 2025_11_08_150200_create_appointments_table.php
│   │   ├── 2025_11_08_150300_create_kpi_reports_table.php
│   │   └── 2025_11_08_150400_create_patient_notifications_table.php
│   └── seeders/
│       ├── PatientSeeder.php
│       ├── RegistrationSeeder.php
│       └── SepSeeder.php
├── routes/             # Route definitions
│   └── api.php
├── index.php           # Entry point
└── README.md           # This file
```

## 🔧 **API Endpoints**

### **Patient Management**
```
GET    /api/roles/pendaftaran/patients          # List patients
POST   /api/roles/pendaftaran/patients          # Create patient
GET    /api/roles/pendaftaran/patients/{id}     # Get patient
PUT    /api/roles/pendaftaran/patients/{id}     # Update patient
DELETE /api/roles/pendaftaran/patients/{id}     # Delete patient
GET    /api/roles/pendaftaran/patients-search   # Search patients
```

### **Registration Management**
```
GET    /api/roles/pendaftaran/registrations      # List registrations
POST   /api/roles/pendaftaran/registrations      # Create registration
GET    /api/roles/pendaftaran/registrations/{id} # Get registration
PUT    /api/roles/pendaftaran/registrations/{id} # Update registration
```

### **Queue Management**
```
GET    /api/roles/pendaftaran/queues             # Get queue status
POST   /api/roles/pendaftaran/queues/call        # Call next queue
POST   /api/roles/pendaftaran/queues/skip        # Skip queue
```

### **SEP Management**
```
GET    /api/roles/pendaftaran/seps               # List SEPs
POST   /api/roles/pendaftaran/seps               # Create SEP
GET    /api/roles/pendaftaran/seps/{id}          # Get SEP
PUT    /api/roles/pendaftaran/seps/{id}          # Update SEP
POST   /api/roles/pendaftaran/seps/{id}/print    # Print SEP
```

### **Antrol (Mobile JKN)**
```
GET    /api/roles/pendaftaran/antrol              # Get antrol queues
POST   /api/roles/pendaftaran/antrol              # Create booking
PUT    /api/roles/pendaftaran/antrol/{id}         # Update status
```

### **Referral System**
```
GET    /api/roles/pendaftaran/referrals           # List referrals
POST   /api/roles/pendaftaran/referrals           # Create referral
PUT    /api/roles/pendaftaran/referrals/{id}      # Update referral
POST   /api/roles/pendaftaran/referrals/{id}/approve # Approve referral
```

### **Appointment System**
```
GET    /api/roles/pendaftaran/appointments        # List appointments
POST   /api/roles/pendaftaran/appointments        # Create appointment
PUT    /api/roles/pendaftaran/appointments/{id}   # Update appointment
DELETE /api/roles/pendaftaran/appointments/{id}   # Cancel appointment
```

### **KPI Dashboard**
```
GET    /api/roles/pendaftaran/kpi                 # Get KPI data
GET    /api/roles/pendaftaran/kpi/reports         # Get KPI reports
POST   /api/roles/pendaftaran/kpi/generate        # Generate report
```

### **Notifications**
```
GET    /api/roles/pendaftaran/notifications       # List notifications
POST   /api/roles/pendaftaran/notifications       # Send notification
POST   /api/roles/pendaftaran/notifications/bulk  # Bulk send
```

## 🚀 **Quick Start**

### **Untuk Developer Baru:**

1. **Masuk folder role:**
   ```bash
   cd backend/roles/pendaftaran
   ```

2. **Lihat struktur:**
   ```bash
   ls -la
   ```

3. **Implementasi endpoint baru:**
   - Buat Controller di `Controllers/`
   - Buat Model di `Models/`
   - Buat Service di `Services/` (optional)
   - Update routes di `routes/api.php`

4. **Update main routes:**
   - Edit `backend/routes/api.php`
   - Include routes dari role ini

## 📊 **Database Tables**

| Table | Description | Migration |
|-------|-------------|-----------|
| `patients` | Data pasien | ✅ Existing |
| `registrations` | Data registrasi | ✅ Existing |
| `seps` | SEP BPJS | ✅ Existing |
| `antrol_queues` | Antrian Mobile JKN | 🔄 To create |
| `referrals` | Sistem rujukan | 🔄 To create |
| `appointments` | Janji temu | 🔄 To create |
| `kpi_reports` | Laporan KPI | 🔄 To create |
| `patient_notifications` | Notifikasi | 🔄 To create |

## 🔗 **Dependencies**

### **Internal:**
- `../../../shared/Controllers/` - Shared controllers
- `../../../shared/Models/` - Shared models
- `../../../shared/Services/` - Shared services

### **External:**
- `laravel/framework` - Laravel framework
- `laravel/sanctum` - API authentication
- `spatie/laravel-permission` - Role permissions

## 🧪 **Testing**

### **Unit Tests:**
```bash
# Test models
php artisan test --filter=PatientTest

# Test controllers
php artisan test --filter=PatientControllerTest

# Test services
php artisan test --filter=PatientServiceTest
```

### **Feature Tests:**
```bash
# Test API endpoints
php artisan test --filter=PatientApiTest

# Test registration flow
php artisan test --filter=RegistrationFlowTest
```

## 📈 **Performance**

- **Response Time:** < 500ms untuk queries sederhana
- **Concurrent Users:** Support 100+ simultaneous users
- **Database Queries:** Optimized dengan indexes
- **Caching:** Redis untuk data sering diakses

## 🔒 **Security**

- **Authentication:** Sanctum token-based
- **Authorization:** Role-based permissions
- **Validation:** Request validation di semua endpoints
- **Audit Trail:** Semua changes dicatat
- **Rate Limiting:** API rate limiting aktif

## 📞 **Support**

- **Lead Backend Developer:** [Nama Developer]
- **API Documentation:** `docs/api-documentation.md`
- **Database Schema:** `docs/database-schema.md`

---

**⚡ Backend pendaftaran harus reliable dan scalable untuk menangani traffic tinggi saat peak hours!**
