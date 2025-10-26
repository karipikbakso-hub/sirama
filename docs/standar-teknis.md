# ⚙️ Standar Teknis Sistem SIRAMA

Dokumen ini merinci spesifikasi teknis minimum dan rekomendasi arsitektur untuk pengembangan sistem SIRAMA agar aman, scalable, dan mudah dipelihara.

---

## 🔐 Keamanan

- Semua endpoint harus menggunakan autentikasi JWT
- Data sensitif (password, NIK, rekam medis) harus dienkripsi di database
- Role-based access control (RBAC) wajib diterapkan
- Audit trail harus mencatat semua perubahan data dan login
- Sistem harus mendukung HTTPS dan CORS
- Validasi input harus dilakukan di sisi client dan server
- Backup data dilakukan otomatis setiap hari dan disimpan minimal 30 hari

---

## ⚡ Performa

- Respon API harus <500ms untuk permintaan standar
- Modul dashboard dan laporan harus menggunakan query teroptimasi
- Caching diterapkan untuk data statis dan antrean (Redis atau sejenis)
- Sistem harus mampu menangani minimal 1000 request per menit
- Gunakan pagination dan lazy loading untuk data besar

---

## 🧱 Arsitektur

- Backend berbasis modular (NestJS, Laravel, atau sejenis)
- Frontend berbasis SPA (React, Vue, atau sejenis)
- Database relasional (PostgreSQL/MySQL) dengan migrasi terstruktur
- Semua modul harus bisa dikembangkan dan diuji secara terpisah
- Gunakan pattern MVC atau Hexagonal Architecture untuk maintainability

---

## ☁️ Infrastruktur

- Sistem harus bisa berjalan di cloud (Docker, Kubernetes, VPS)
- CI/CD pipeline untuk deployment otomatis (GitHub Actions, GitLab CI, dll)
- Monitoring via Prometheus/Grafana atau sejenis
- Logging terpusat (ELK Stack, Loki, atau sejenis)
- Dukungan horizontal scaling untuk modul antrean, dashboard, dan API publik

---

## 🔄 Interoperabilitas

- API harus mengikuti standar RESTful
- FHIR API wajib untuk data medis (HL7 FHIR v4)
- Format data JSON dan XML untuk integrasi eksternal
- Kompatibel dengan SATUSEHAT, e-SIRS, e-Klaim, e-Presensi
- Gunakan OpenAPI (Swagger) untuk dokumentasi API

---

## 🧪 Pengujian

- Unit test wajib untuk semua service dan controller
- Integration test untuk modul utama (pasien, rekam medis, kasir)
- Load test untuk endpoint antrean dan dashboard (k6, JMeter)
- Dokumentasi Swagger/OpenAPI harus tersedia dan sinkron
- Minimal 80% code coverage untuk modul kritikal

---

## 📦 Standar Kode & Dokumentasi

- Gunakan TypeScript (untuk Node/NestJS) atau PHP 8+ (untuk Laravel)
- Gunakan ESLint/Prettier atau PHP-CS-Fixer untuk konsistensi kode
- Dokumentasi modul disimpan di `docs/modules.md`
- Dokumentasi API disimpan di `docs/api.md`
- Dokumentasi teknis disimpan di `docs/standar-teknis.md`

---

📌 Dokumen ini menjadi acuan tim teknis dan AI dalam membangun sistem yang aman, scalable, dan interoperable.  
📌 Revisi dilakukan setiap fase besar atau perubahan arsitektur.
