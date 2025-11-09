# 📋 SIRAMA - Sistem Informasi Manajemen Rumah Sakit

Sistem Informasi Manajemen Rumah Sakit (SIMRS) untuk Rumah Sakit Tipe C yang comprehensive dan compliant dengan regulasi Kemenkes RI.

## 🎯 **Visi & Misi**

**Visi:** Menjadi solusi SIMRS terdepan untuk rumah sakit tipe C di Indonesia dengan fokus pada efisiensi operasional dan kepuasan pasien.

**Misi:**
- ✅ Implementasi 24 modul dasar SIMRS sesuai standar Kemenkes
- ✅ Integrasi penuh dengan sistem BPJS Kesehatan
- ✅ Compliance dengan regulasi pelaporan SIRS/RL1-RL6
- ✅ User experience yang intuitif untuk semua level pengguna
- ✅ Sistem yang scalable dan mudah di-maintain

## 🏗️ **Arsitektur Sistem**

### **Frontend Stack:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query + Context API
- **UI Components:** Custom components with Radix UI

### **Backend Stack:**
- **Framework:** Laravel 11
- **Language:** PHP 8.2+
- **Database:** MySQL 8.0
- **Authentication:** Laravel Sanctum
- **API:** RESTful API with OpenAPI specification

### **Infrastructure:**
- **Deployment:** Docker containerization
- **Database:** MySQL with backup automation
- **Security:** SSL/TLS encryption, role-based access control
- **Monitoring:** Application logs, error tracking

## 📊 **Status Implementasi**

### **Phase 1: Entry & Registration** ✅ **COMPLETED**
- [x] Pendaftaran Pasien (Registration)
- [x] Data Pasien Management
- [x] Sistem Antrian
- [x] BPJS SEP Management

### **Phase 2: Frontline Clinical** 🔄 **IN PROGRESS**
- [x] Perawat UGD Dashboard
- [ ] UGD Dokter Dashboard
- [ ] Triase & Emergency Protocols

### **Phase 3: Medical Examination** ⏳ **PLANNED**
- [x] Dokter Poli Dashboard
- [x] Perawat Poli Dashboard
- [ ] EMR Integration
- [ ] Prescription Management

### **Phase 4-10: Diagnostic to Admin** 📋 **PLANNED**
- [ ] Laboratorium, Radiologi, Farmasi
- [ ] Billing & Payment Systems
- [ ] Medical Records Management
- [ ] Hospital Management Dashboards
- [ ] Administrative Modules
- [ ] Integration Modules (BPJS, Satu Sehat)

## 🚀 **Quick Start**

### **Prerequisites:**
```bash
- Node.js 18+
- PHP 8.2+
- MySQL 8.0+
- Composer
- Docker (optional)
```

### **Installation:**
```bash
# Clone repository
git clone https://github.com/karipikbakso-hub/sirama.git
cd sirama

# Setup backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Setup frontend
cd ../frontend
npm install
npm run dev

# Start development servers
# Backend: php artisan serve (port 8000)
# Frontend: npm run dev (port 3000)
```

## 📁 **Project Structure**

```
sirama/
├── backend/                 # Laravel API backend
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── config/
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable components
│   │   ├── lib/           # Utilities & configurations
│   │   └── hooks/         # Custom React hooks
│   └── public/
├── docs/                   # Documentation
├── docker/                 # Docker configurations
└── scripts/               # Deployment & utility scripts
```

## 👥 **User Roles & Permissions**

| Role | Description | Key Responsibilities |
|------|-------------|---------------------|
| **Pendaftaran** | Front office staff | Patient registration, queue management |
| **Perawat UGD** | Emergency nurses | Triage, vital signs, emergency care |
| **UGD Dokter** | Emergency physicians | Emergency diagnosis, critical care |
| **Dokter** | Medical doctors | Patient examination, diagnosis, treatment |
| **Perawat Poli** | Clinic nurses | Nursing care, patient monitoring |
| **Laboratorium** | Lab technicians | Lab tests, sample processing |
| **Radiologi** | Radiology staff | Imaging, X-rays, reports |
| **Apoteker** | Pharmacists | Medication management, dispensing |
| **Kasir** | Billing staff | Payment processing, claims |
| **Rekam Medis** | Medical records | Documentation, coding, claims |
| **Manajemen RS** | Hospital management | KPIs, reporting, operations |
| **Admin** | System administrators | User management, system config |

## 📋 **Development Roadmap**

### **Q4 2025:**
- [ ] Complete Phase 2 (UGD modules)
- [ ] Implement EMR basic functionality
- [ ] BPJS integration testing

### **Q1 2026:**
- [ ] Complete Phase 3-4 (Clinical modules)
- [ ] Laboratory Information System (LIS)
- [ ] Picture Archiving System (PACS)

### **Q2 2026:**
- [ ] Complete Phase 5-6 (Pharmacy & Billing)
- [ ] Medical records digitization
- [ ] SIRS reporting automation

### **Q3-Q4 2026:**
- [ ] Complete Phase 7-10 (Management & Admin)
- [ ] Satu Sehat integration
- [ ] Mobile application
- [ ] Production deployment

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 **Support & Contact**

- **Project Lead:** Development Team
- **Technical Support:** [GitHub Issues](https://github.com/karipikbakso-hub/sirama/issues)
- **Documentation:** [Wiki](https://github.com/karipikbakso-hub/sirama/wiki)

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🏥 SIRAMA - Menjadikan Pelayanan Kesehatan Lebih Efisien**
