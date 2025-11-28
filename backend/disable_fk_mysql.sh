#!/bin/bash

echo "=== DISABLE MYSQL FOREIGN KEYS ==="
echo "Enter MySQL root password when prompted..."

# Disable foreign key checks
mysql -u root -p -e "SET GLOBAL foreign_key_checks=0;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Foreign keys disabled successfully"
else
    echo "❌ Failed to disable foreign keys"
    echo "(Try running: mysql -u root -p -e 'SET GLOBAL foreign_key_checks=0;')"
fi

echo ""
echo "Now run: php artisan migrate:fresh --seed"
echo ""
echo "After migration completes, run this to re-enable FK:"
echo 'mysql -u root -p -e "SET GLOBAL foreign_key_checks=1;"'
