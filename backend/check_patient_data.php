<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Registration;
use App\Models\Patient;

echo "=== CHECKING PATIENT DATA IN DASHBOARD ===\n\n";

$today = today();
echo "Today: " . $today->format('Y-m-d') . "\n\n";

// Check registrations today
$registrations = Registration::whereDate('created_at', $today)->get();
echo "Total registrations today: " . $registrations->count() . "\n\n";

if ($registrations->count() > 0) {
    echo "REGISTRATIONS DATA:\n";
    echo str_pad("ID", 5) . str_pad("Patient ID", 12) . str_pad("Registration No", 15) . "Status\n";
    echo str_repeat("-", 50) . "\n";

    foreach ($registrations as $reg) {
        echo str_pad($reg->id, 5) .
             str_pad($reg->patient_id ?? 'NULL', 12) .
             str_pad($reg->registration_no ?? 'NULL', 15) .
             ($reg->status ?? 'NULL') . "\n";
    }
    echo "\n";

    // Check patient relationships
    echo "PATIENT RELATIONSHIPS:\n";
    echo str_pad("Reg ID", 8) . str_pad("Patient ID", 12) . "Patient Name\n";
    echo str_repeat("-", 40) . "\n";

    foreach ($registrations as $reg) {
        $patient = $reg->patient;
        echo str_pad($reg->id, 8) .
             str_pad($reg->patient_id ?? 'NULL', 12) .
             ($patient ? ($patient->name ?? 'EMPTY NAME') : 'NO PATIENT') . "\n";
    }
    echo "\n";

    // Check if patients exist
    echo "PATIENTS IN DATABASE:\n";
    $patientIds = $registrations->pluck('patient_id')->filter()->unique();
    if ($patientIds->count() > 0) {
        $patients = Patient::whereIn('id', $patientIds)->get();
        echo "Found " . $patients->count() . " patients out of " . $patientIds->count() . " patient IDs\n";

        foreach ($patients as $patient) {
            echo "ID: {$patient->id}, Name: " . ($patient->name ?? 'EMPTY') . "\n";
        }
    } else {
        echo "No patient IDs found in registrations!\n";
    }
} else {
    echo "No registrations found for today.\n\n";

    // Check if there are any registrations at all
    $allRegistrations = Registration::count();
    echo "Total registrations in database: $allRegistrations\n";

    if ($allRegistrations > 0) {
        $latestReg = Registration::latest()->first();
        echo "Latest registration: " . $latestReg->created_at . "\n";
    }
}

echo "\n=== END CHECK ===\n";