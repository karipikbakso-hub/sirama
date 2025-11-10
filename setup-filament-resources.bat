@echo off
echo 🚀 SIRAMA FILAMENT COMPLETE SETUP SCRIPT
echo ======================================
echo.

REM Change to backend directory
cd backend

echo 📦 Step 1: Installing Filament...
composer require filament/filament

echo 🔧 Step 2: Publishing Filament assets...
php artisan filament:install

echo 🗄️ Step 3: Running migrations...
php artisan migrate

echo 👤 Step 4: Creating admin user...
php artisan db:seed --class=AdminUserSeeder

echo 📊 Step 5: Generating Filament Resources...
php artisan make:filament-resource Doctor --generate
php artisan make:filament-resource Medicine --generate
php artisan make:filament-resource Appointment --generate
php artisan make:filament-resource Registration --generate
php artisan make:filament-resource QueueManagement --generate
php artisan make:filament-resource Sep --generate

echo 📈 Step 6: Creating Dashboard Widgets...
php artisan make:filament-widget StatsOverview
php artisan make:filament-widget MonthlyReport
php artisan make:filament-widget PatientChart

echo 🎨 Step 7: Setting up navigation and permissions...
echo (Manual step: Update AdminPanelProvider with custom navigation)

echo ✅ Step 8: Clearing cache...
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo.
echo 🎉 FILAMENT SETUP COMPLETE!
echo.
echo 🌐 Admin Panel: http://localhost:8000/admin
echo 👤 Login: admin@sirama.com / password
echo.
echo 📋 Next Steps:
echo 1. Customize Filament resources as needed
echo 2. Add more dashboard widgets
echo 3. Configure role-based permissions
echo 4. Test all CRUD operations
echo.
echo 🚀 Ready for development!
pause
