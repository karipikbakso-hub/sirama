@echo off
echo Disabling foreign key checks and running migrations...

REM Disable foreign key checks
mysql -u root -p -e "SET GLOBAL foreign_key_checks = 0;"

REM Run migrations
php artisan migrate:fresh --force

REM Re-enable foreign key checks
mysql -u root -p -e "SET GLOBAL foreign_key_checks = 1;"

echo Migration completed!
pause