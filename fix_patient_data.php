<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Patient;
use App\Models\User;
use App\Models\Registration;
use Illuminate\Support\Facades\DB;

echo "=== FIXING PATIENT DATA ===\n\n";

// 1. Update patient names
echo "Updating patient names...\n";
Patient::whereIn('id', [1,3,4,5])->update([
    'nama_lengkap' => DB::raw("CONCAT('Pasien Test ', id)")
]);

// 2. Create a doctor if not exists
echo "Checking for doctors...\n";
$doctor = User::where('role', 'dokter')->first();

if (!$doctor) {
    echo "Creating test doctor...\n";
    $doctor = User::create([
        'name' => 'Dr. Test',
        'email' => 'dr@test.com',
        'password' => bcrypt('password'),
        'role' => 'dokter'
    ]);
}

// 3. Update registrations with dokter_id
echo "Updating registrations with dokter_id...\n";
Registration::whereDate('created_at', today())
    ->whereNull('dokter_id')
    ->orWhere('dokter_id', '')
    ->update(['dokter_id' => $doctor->id]);

echo "Data fix completed!\n\n";

// Verify the fix
echo "=== VERIFICATION ===\n";
$registrations = Registration::whereDate('created_at', today())->with(['patient', 'doctor'])->get();

foreach ($registrations as $reg) {
    echo "Registration ID: {$reg->id}\n";
    echo "  - Patient: " . ($reg->patient ? $reg->patient->nama_lengkap : 'NULL') . "\n";
    echo "  - Doctor: " . ($reg->doctor ? $reg->doctor->name : 'NULL') . "\n";
    echo "\n";
}

echo "=== END ===\n";