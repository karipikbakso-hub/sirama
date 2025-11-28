<?php

require_once 'backend/vendor/autoload.php';

$app = require_once 'backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Poli;
use App\Models\DoctorSchedule;

// Create test data for registration
try {
    DB::beginTransaction();

    // Create test poli
    $poli = Poli::firstOrCreate(
        ['kode_poli' => 'UMUM'],
        [
            'nama_poli' => 'Poli Umum',
            'deskripsi' => 'Poli umum untuk pemeriksaan umum',
            'status' => 'active'
        ]
    );

    // Create test doctor
    $doctor = Doctor::firstOrCreate(
        ['no_str' => '123456789012345678'],
        [
            'nama_dokter' => 'Dr. Test Dokter',
            'spesialisasi' => 'Umum',
            'no_sip' => 'SIP123456789',
            'nip' => '123456789',
            'telepon' => '081234567890',
            'alamat' => 'Jl. Test No. 123',
            'status' => 'active'
        ]
    );

    // Create doctor schedule for today
    $today = strtolower(now()->format('l')); // monday, tuesday, etc.
    DoctorSchedule::firstOrCreate(
        [
            'doctor_id' => $doctor->id,
            'poli_id' => $poli->id,
            'hari' => $today
        ],
        [
            'jam_mulai' => '08:00:00',
            'jam_selesai' => '16:00:00',
            'is_active' => true,
            'quota' => 50
        ]
    );

    // Create test user for pendaftaran role
    $user = User::firstOrCreate(
        ['email' => 'pendaftaran@test.com'],
        [
            'name' => 'Petugas Pendaftaran',
            'password' => Hash::make('password'),
            'role' => 'pendaftaran'
        ]
    );

    DB::commit();

    echo "Test data created successfully!\n";
    echo "Poli: {$poli->nama_poli}\n";
    echo "Doctor: {$doctor->nama_dokter}\n";
    echo "User: {$user->email}\n";
    echo "Schedule created for today: {$today}\n";

} catch (Exception $e) {
    DB::rollBack();
    echo "Error creating test data: " . $e->getMessage() . "\n";
}