@echo off
echo 🚀 SIRAMA COMPLETE INDONESIAN SETUP
echo ===================================
echo.

cd backend

echo 📦 Step 1: Install Critical Modules...
composer require pusher/pusher-php-server
composer require spatie/laravel-medialibrary
composer require barryvdh/laravel-dompdf
composer require laravel/scout
composer require meilisearch/meilisearch-php

echo 🗄️ Step 2: Run Indonesian Database Migration...
php artisan migrate --path=database/migrations/2025_11_10_020000_create_indonesian_database_structure.php

echo 👤 Step 3: Create Admin User...
php artisan db:seed --class=AdminUserSeeder

echo 🌱 Step 4: Seed Indonesian Database...
php artisan db:seed --class=IndonesianDatabaseSeeder

echo 📊 Step 5: Setup Broadcasting...
php artisan make:event PatientQueueUpdated
php artisan make:listener SendQueueUpdate
php artisan queue:table

echo 📤 Step 6: Setup Media Library...
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider"

echo 📧 Step 7: Create Notifications...
php artisan make:notification AppointmentReminder
php artisan make:notification QueueCalled
php artisan make:notification PrescriptionReady

echo 🔍 Step 8: Setup Search...
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"

echo 📊 Step 9: Create Dashboard Widgets...
php artisan make:filament-widget StatsOverview
php artisan make:filament-widget PatientChart

echo ✅ Step 10: Clear Cache...
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo.
echo 🎉 SIRAMA INDONESIAN SETUP COMPLETE!
echo.
echo 🌐 Admin Panel: http://localhost:8000/admin
echo 👤 Login: admin@sirama.com / password
echo.
echo 📱 User Portal: http://localhost:3004
echo.
echo ✅ DATABASE INDONESIA TERINSTALL:
echo   📊 m_pasien - Data pasien lengkap
echo   👨‍⚕️ m_dokter - Data dokter & spesialisasi
echo   💊 m_obat - Inventori obat lengkap
echo   🏥 m_ruangan - Data ruangan & fasilitas
echo   📋 m_diagnosis_icd10 - Kode diagnosis ICD-10
echo   📝 t_registrasi_pasien - Registrasi kunjungan
echo   ⏰ t_antrian - Sistem antrian
echo   📅 t_janji_temu - Appointment system
echo   🧾 t_resep_obat - Sistem resep
echo   📄 t_catatan_cppt - Catatan medis CPPT
echo   🔬 t_pemesanan_lab - Pemesanan lab
echo   📻 t_pemesanan_radiologi - Pemesanan radiologi
echo   📚 t_riwayat_pasien - Riwayat medis
echo   🏥 t_sep - BPJS SEP management
echo   🔄 t_rujukan - Sistem rujukan
echo   ⚙️ m_konfigurasi_bpjs - Konfigurasi BPJS
echo   💬 t_komunikasi_pasien - Komunikasi pasien
echo.
echo 📊 SAMPLE DATA TERISI:
echo   👥 3 Pasien sample
echo   👨‍⚕️ 3 Dokter spesialis
echo   💊 3 Obat umum
echo   🏥 3 Ruangan berbeda jenis
echo   📋 3 Diagnosis ICD-10
echo   📝 2 Registrasi sample
echo   ⏰ 2 Antrian sample
echo.
echo 🚀 SIRAMA SIAP DIGUNAKAN!
echo.
echo 📋 LANGKAH SELANJUTNYA:
echo 1. Jalankan: php artisan serve (backend)
echo 2. Jalankan: npm run dev (frontend)
echo 3. Akses admin panel untuk management
echo 4. Test fitur real-time & file upload
echo 5. Customize sesuai kebutuhan rumah sakit
echo.
pause
