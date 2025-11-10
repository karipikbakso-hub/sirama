@echo off
echo 🚀 SIRAMA ONE-DAY COMPLETE SETUP
echo =================================
echo.

cd backend

echo 📦 Step 1: Install Critical Modules...
composer require pusher/pusher-php-server
composer require spatie/laravel-medialibrary
composer require barryvdh/laravel-dompdf
composer require laravel/scout
composer require meilisearch/meilisearch-php

echo 🗄️ Step 2: Run Migrations...
php artisan migrate

echo 👤 Step 3: Create Admin User...
php artisan db:seed --class=AdminUserSeeder

echo 📊 Step 4: Setup Broadcasting...
php artisan make:event PatientQueueUpdated
php artisan make:listener SendQueueUpdate
php artisan queue:table

echo 📤 Step 5: Setup Media Library...
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider"

echo 📧 Step 6: Create Notifications...
php artisan make:notification AppointmentReminder
php artisan make:notification QueueCalled
php artisan make:notification PrescriptionReady

echo 🔍 Step 7: Setup Search...
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"

echo 📊 Step 8: Create Dashboard Widgets...
php artisan make:filament-widget StatsOverview
php artisan make:filament-widget PatientChart

echo ✅ Step 9: Clear Cache...
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo.
echo 🎉 ONE-DAY SETUP COMPLETE!
echo.
echo 🌐 Admin Panel: http://localhost:8000/admin
echo 👤 Login: admin@sirama.com / password
echo.
echo 📱 User Portal: http://localhost:3004
echo.
echo ✅ Features Ready:
echo   - Real-time queue updates
echo   - File upload system
echo   - Email notifications
echo   - Search functionality
echo   - Basic analytics
echo   - PDF reports
echo.
echo 🚀 SIRAMA is now OPERATIONAL!
pause
