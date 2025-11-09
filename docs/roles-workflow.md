# 👥 **SIRAMA - 7 Role Utama Kemenkes Standards**

Dokumen ini mendefinisikan **7 role utama** pengguna dalam sistem SIRAMA sesuai standar Kemenkes RI untuk rumah sakit tipe C, beserta workflow, tanggung jawab, dan hubungan antar role.

## 🎯 **7 Role Utama (Current Implementation)**

### **1. 👨‍💼 ADMINISTRATOR/IT**
**Deskripsi:** Administrator sistem yang mengelola platform teknis rumah sakit

**Tanggung Jawab Utama:**
- Manajemen user dan role
- Konfigurasi sistem
- Audit log monitoring
- Backup dan recovery
- System maintenance

**Workflow:**
```
User Management → System Configuration → Monitoring → Backup → Maintenance
```

**Menu Dashboard:**
- User Management
- Role Management
- System Settings
- Audit Logs
- Backup & Recovery

---

### **2. 📋 PENDAFTARAN**
**Deskripsi:** Staf front office yang menangani registrasi pasien pertama kali

**Tanggung Jawab Utama:**
- Registrasi pasien baru dan lama
- Verifikasi data BPJS/KIS
- Pembuatan nomor antrian
- Input data demografi pasien
- Pengelolaan SEP BPJS

**Workflow:**
```
Pasien Datang → Verifikasi Identitas → Input Data → Generate No.Antrian → Cetak SEP → Arahkan ke Poli/UGD
```

**Menu Dashboard:**
- Home (Dashboard Utama)
- Patient Registration
- Patient Data
- Medical History
- Queue Management
- Digital Services (BPJS, Mobile JKN, Appointments)
- Referral System
- Administration (Master Data, Communication)

---

### **3. 👨‍⚕️ DOKTER**
**Deskripsi:** Dokter spesialis/poli yang menangani konsultasi medis

**Tanggung Jawab Utama:**
- Pemeriksaan fisik dan anamnesis
- Diagnosis penyakit
- Penulisan resep obat
- Order pemeriksaan penunjang
- Konsultasi dengan pasien

**Workflow:**
```
Anamnesis → Physical Exam → Diagnosis → Treatment Plan → Prescription → Follow-up
```

**Menu Dashboard:**
- Electronic Medical Record
- CPPT Documentation
- Diagnosis
- Prescription
- Lab Orders
- Radiology Orders

---

### **4. 👩‍⚕️ PERAWAT**
**Deskripsi:** Perawat yang menangani perawatan pasien (UGD & Poli)

**Tanggung Jawab Utama:**
- Pengukuran TTV (Vital Signs)
- Dokumentasi CPPT
- Persiapan pasien untuk pemeriksaan
- Emergency triage
- Edukasi pasien

**Workflow:**
```
Pre-Consultation → TTV → Patient Prep → Medical Assistance → Education → Documentation
```

**Menu Dashboard:**
- Vital Signs
- CPPT Documentation
- EMR Access
- Emergency Triage
- Clinic Queue

---

### **5. 💊 APOTEKER**
**Deskripsi:** Apoteker yang mengelola obat dan farmasi

**Tanggung Jawab Utama:**
- Validasi resep dokter
- Penyiapan dan dispensing obat
- Kontrol stok obat
- Pengelolaan narkotika
- Konsultasi obat

**Workflow:**
```
Prescription Review → Drug Preparation → Dispensing → Stock Control → Patient Counseling
```

**Menu Dashboard:**
- Prescription Orders
- Prescription Validation
- Dispensing
- Inventory Management
- Stock Transactions

---

### **6. 💰 KASIR**
**Deskripsi:** Staf billing yang menangani pembayaran dan klaim

**Tanggung Jawab Utama:**
- Pembuatan billing/invoice
- Penerimaan pembayaran
- Proses klaim BPJS
- Penerbitan kwitansi
- Deposit management

**Workflow:**
```
Service Recording → Billing Generation → Payment Processing → Claim Submission → Receipt Issuance
```

**Menu Dashboard:**
- Billing Management
- Payment Processing
- Receipts
- Deposit Management

---

### **7. 🏢 MANAJEMEN RS**
**Deskripsi:** Manajemen rumah sakit yang mengawasi operasional

**Tanggung Jawab Utama:**
- Monitoring KPI rumah sakit
- Analisis pendapatan
- Laporan operasional
- Perencanaan strategis
- Quality improvement

**Workflow:**
```
KPI Monitoring → Data Analysis → Report Generation → Strategic Planning → Quality Improvement
```

**Menu Dashboard:**
- BOR Analysis
- LOS Analysis
- Revenue Analytics
- Patient Satisfaction
- Quality Indicators

## 🔄 **Patient Journey Workflow**

```
PENDAFTARAN → PERAWAT UGD → UGD DOKTER → DOKTER POLI → PERAWAT POLI
    ↓              ↓              ↓              ↓              ↓
LAB/RADIOLOGI → APOTEKER → GIZI → KASIR → REKAM MEDIS → BPJS/SATU SEHAT
    ↓              ↓              ↓              ↓              ↓
SDM/LOGISTIK → KEUANGAN → MANAJEMEN RS → ADMIN
```

## 📊 **Role Hierarchy & Permissions**

### **Clinical Staff (Direct Patient Care):**
- Perawat UGD, UGD Dokter, Dokter, Perawat Poli

### **Support Services:**
- Laboratorium, Radiologi, Apoteker, Gizi

### **Administrative:**
- Pendaftaran, Kasir, Rekam Medis, BPJS, Satu Sehat

### **Management:**
- Manajemen RS, Kepala Unit, SDM, Keuangan

### **Technical:**
- Logistik Medis, Logistik Umum, Admin

## 🎯 **Key Performance Indicators (KPI) per Role**

| Role | Primary KPI | Secondary KPI |
|------|-------------|----------------|
| Pendaftaran | Registration Time | Patient Satisfaction |
| Perawat UGD | Triage Accuracy | Response Time |
| UGD Dokter | Survival Rate | Length of Stay |
| Dokter | Diagnosis Accuracy | Patient Recovery |
| Laboratorium | Test Turnaround Time | Error Rate |
| Kasir | Claim Approval Rate | Collection Rate |
| Manajemen RS | BOR/LOS/TOI | Revenue Growth |

---

**📝 Catatan:** Workflow dapat disesuaikan berdasarkan kebutuhan spesifik rumah sakit dengan tetap mengacu pada standar Kemenkes RI.**
