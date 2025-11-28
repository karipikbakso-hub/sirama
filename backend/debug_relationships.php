<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Registration;
use App\Models\Patient;
use App\Models\User;

echo "=== DEBUGGING RELATIONSHIPS ===\n\n";

// Check today's registrations
$registrations = Registration::whereDate('created_at', today())->get();

echo "Total registrations today: " . $registrations->count() . "\n\n";

foreach ($registrations as $reg) {
    echo "Registration ID: {$reg->id}\n";
    echo "  - patient_id: {$reg->patient_id}\n";
    echo "  - doctor_id: {$reg->doctor_id}\n";

    // Check patient relationship
    $patient = $reg->patient;
    if ($patient) {
        echo "  - Patient Name: {$patient->name}\n";
    } else {
        echo "  - Patient: NULL (patient_id {$reg->patient_id} not found)\n";
    }

    // Check doctor relationship
    $doctor = $reg->doctor;
    if ($doctor) {
        echo "  - Doctor Name: {$doctor->name}\n";
    } else {
        echo "  - Doctor: NULL (doctor_id {$reg->doctor_id} not found)\n";
    }

    echo "\n";
}

// Check if patients exist
$patientIds = $registrations->pluck('patient_id')->filter()->unique();
$existingPatients = Patient::whereIn('id', $patientIds)->count();
echo "Patient IDs in registrations: " . $patientIds->count() . "\n";
echo "Existing patients: $existingPatients\n\n";

// Check if doctors exist
$doctorIds = $registrations->pluck('doctor_id')->filter()->unique();
$existingDoctors = User::whereIn('id', $doctorIds)->count();
echo "Doctor IDs in registrations: " . $doctorIds->count() . "\n";
echo "Existing doctors: $existingDoctors\n\n";

echo "=== END DEBUG ===\n";