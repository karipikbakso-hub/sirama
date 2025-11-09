# 🏥 Role Pendaftaran - SIRAMA

Modul pendaftaran pasien yang fully compliant dengan standar Kemenkes RI untuk rumah sakit modern.

## 📋 **Overview**

Role pendaftaran bertanggung jawab untuk:
- Registrasi pasien baru dan lama
- Verifikasi data BPJS/KIS
- Manajemen antrian pasien
- Pembuatan SEP BPJS
- Sistem appointment/janji temu
- Dashboard KPI pendaftaran
- Integrasi Mobile JKN (Antrol)
- Sistem rujukan antar fasilitas

## 📁 **Struktur Folder**

```
frontend/src/roles/pendaftaran/
├── components/          # UI Components khusus pendaftaran
├── hooks/              # Custom hooks (usePatient, useQueue, etc.)
├── services/           # API services
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
├── pages/              # Page components per modul
│   ├── home.tsx                    # Dashboard utama
│   ├── registrasi.tsx              # Registrasi pasien
│   ├── pasien.tsx                  # Data pasien
│   ├── riwayat.tsx                 # Riwayat kunjungan
│   ├── antrian.tsx                 # Antrian pasien
│   ├── antrian-management.tsx      # Manajemen antrian
│   ├── sep.tsx                     # SEP BPJS
│   ├── antrol.tsx                  # Mobile JKN
│   ├── rujukan.tsx                 # Sistem rujukan
│   ├── appointment.tsx             # Janji temu
│   ├── registrasi-igd.tsx          # Registrasi IGD
│   ├── master-data.tsx             # Data master
│   ├── kpi.tsx                     # Dashboard KPI
│   ├── bpjs-integration.tsx        # Integrasi BPJS
│   └── notifications.tsx           # Komunikasi pasien
├── index.ts            # Export semua dari role ini
└── README.md           # Dokumentasi ini
```

## 🔧 **Menu Dashboard**

| Menu | File | Deskripsi |
|------|------|-----------|
| Home | `home.tsx` | Dashboard utama dengan statistik |
| Registrasi | `registrasi.tsx` | Form registrasi pasien |
| Data Pasien | `pasien.tsx` | Manajemen data pasien |
| Riwayat Pasien | `riwayat.tsx` | Riwayat kunjungan pasien |
| Antrian | `antrian.tsx` | Monitoring antrian real-time |
| Manajemen Antrian | `antrian-management.tsx` | Kontrol antrian advanced |
| SEP | `sep.tsx` | Pembuatan dan manajemen SEP |
| Antrol | `antrol.tsx` | Integrasi Mobile JKN |
| Rujukan | `rujukan.tsx` | Sistem rujukan antar fasilitas |
| Appointment | `appointment.tsx` | Sistem janji temu online |
| Registrasi IGD | `registrasi-igd.tsx` | Registrasi emergency |
| Master Data | `master-data.tsx` | Maintenance data referensi |
| Dashboard KPI | `kpi.tsx` | Monitoring kinerja pendaftaran |
| Integrasi BPJS | `bpjs-integration.tsx` | Extended BPJS integration |
| Komunikasi Pasien | `notifications.tsx` | SMS/WA notifications |

## 🚀 **Quick Start**

### **Untuk Developer Baru:**

1. **Masuk folder role:**
   ```bash
   cd frontend/src/roles/pendaftaran
   ```

2. **Lihat struktur:**
   ```bash
   ls -la
   ```

3. **Implementasi fitur baru:**
   - Buat file di `pages/[fitur-baru].tsx`
   - Tambah hook di `hooks/use[Fitur].ts`
   - Tambah service di `services/[fitur]Service.ts`
   - Update `index.ts` untuk export

4. **Update menu:**
   - Edit `menuByRole.ts` di root project
   - Tambah entry untuk role pendaftaran

## 📊 **Database Tables**

Role ini menggunakan tabel berikut:
- `patients` - Data pasien
- `registrations` - Data registrasi
- `seps` - Surat Eligibilitas Peserta
- `antrol_queues` - Antrian Mobile JKN
- `referrals` - Sistem rujukan
- `appointments` - Janji temu
- `kpi_reports` - Laporan KPI
- `patient_notifications` - Notifikasi pasien

## 🔗 **Dependencies**

### **Internal:**
- `../../../shared/components/` - Shared UI components
- `../../../shared/hooks/` - Global hooks
- `../../../shared/services/` - API client, auth, etc.

### **External:**
- `react` - UI framework
- `@tanstack/react-table` - Table management
- `react-icons` - Icon library
- `date-fns` - Date utilities

## 🧪 **Testing**

### **Unit Tests:**
```bash
# Test hooks
npm test hooks/usePatient.test.ts

# Test components
npm test components/PatientForm.test.tsx

# Test services
npm test services/patientService.test.ts
```

### **Integration Tests:**
```bash
# Test full registration flow
npm test integration/registration-flow.test.ts
```

## 📈 **Performance Metrics**

- **Load Time:** < 2 detik untuk dashboard
- **API Response:** < 500ms untuk queries
- **Bundle Size:** < 200KB untuk role ini
- **Test Coverage:** > 80%

## 🔒 **Security**

- **RBAC:** Role-based access control
- **Audit Trail:** Semua aksi dicatat
- **Data Validation:** Client & server side
- **Encryption:** Data sensitif dienkripsi

## 📞 **Support**

- **Lead Developer:** [Nama Developer]
- **Business Analyst:** [Nama BA]
- **Technical Documentation:** `docs/modular-architecture.md`
- **API Documentation:** `docs/api-documentation.md`

---

**🎯 Role pendaftaran adalah pintu gerbang rumah sakit - harus user-friendly, cepat, dan reliable!**
