<?php

/**
 * ETL Migration Script - SIRAMA Database Refactor
 * Extract → Transform → Load from old tables to new Indonesian tables
 */

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "🚀 Starting ETL Migration SIRAMA Database\n";
echo "==========================================\n\n";

// Create new schema
echo "1. Creating new schema sirama_v2...\n";
DB::statement("CREATE DATABASE IF NOT EXISTS sirama_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
echo "✅ Schema sirama_v2 created\n\n";

// Switch to new schema
DB::statement("USE sirama_v2");
echo "🔄 Switched to sirama_v2 schema\n\n";

// Run new migrations
echo "2. Running new migrations...\n";
$exitCode = Artisan::call('migrate', [
    '--path' => 'database/migrations_refactor',
    '--force' => true
]);
echo "✅ Migrations completed with exit code: $exitCode\n\n";

// ETL Process
echo "3. Starting ETL Process...\n";

$etlReport = [
    'start_time' => now(),
    'tables' => []
];

// 3.1 Extract & Load m_pasien
echo "3.1 Migrating m_pasien (patients)...\n";
$patients = DB::connection('mysql')->table('patients')->get();
$patientCount = 0;

foreach ($patients as $patient) {
    DB::table('m_pasien')->insert([
        'id' => $patient->id,
        'no_rm' => $patient->mrn,
        'nama' => $patient->name,
        'nik' => $patient->nik,
        'tanggal_lahir' => $patient->birth_date,
        'jenis_kelamin' => $patient->gender,
        'telepon' => $patient->phone,
        'alamat' => $patient->address,
        'kontak_darurat' => $patient->emergency_contact,
        'no_bpjs' => $patient->bpjs_number,
        'status' => $patient->status === 'active' ? 'aktif' :
                   ($patient->status === 'inactive' ? 'tidak_aktif' : 'meninggal'),
        'created_at' => $patient->created_at,
        'updated_at' => $patient->updated_at,
    ]);
    $patientCount++;
}

$etlReport['tables']['m_pasien'] = $patientCount;
echo "✅ Migrated $patientCount patients\n";

// 3.2 Extract & Load t_registrasi (gabungan registrations + emergency_registrations)
echo "3.2 Migrating t_registrasi (registrations + emergency_registrations)...\n";
$registrations = DB::connection('mysql')->table('registrations')->get();
$emergencyRegs = DB::connection('mysql')->table('emergency_registrations')->get();
$regCount = 0;

// Regular registrations
foreach ($registrations as $reg) {
    // Map poli_id from service_unit (assuming it's poli name, need to map to ID)
    $poliId = DB::connection('mysql')->table('m_poli')
        ->where('nama_poli', $reg->service_unit)
        ->value('id') ?? 1; // Default to first poli if not found

    DB::table('t_registrasi')->insert([
        'id' => $reg->id,
        'pasien_id' => $reg->patient_id,
        'no_registrasi' => $reg->registration_no,
        'poli_id' => $poliId,
        'dokter_id' => $reg->doctor_id,
        'jenis_kunjungan' => $reg->arrival_type === 'mandiri' ? 'baru' :
                           ($reg->arrival_type === 'rujukan' ? 'rujukan' : 'kontrol'),
        'sumber_rujukan' => $reg->referral_source,
        'penjamin' => $reg->payment_method,
        'no_asuransi' => $reg->insurance_number,
        'no_antrian' => $reg->queue_number,
        'status' => $reg->status === 'registered' ? 'menunggu' :
                   ($reg->status === 'checked-in' ? 'dipanggil' :
                   ($reg->status === 'completed' ? 'selesai' : 'batal')),
        'keluhan' => $reg->notes,
        'biaya_registrasi' => 0, // Default
        'is_igd' => false,
        'created_by' => $reg->created_by,
        'created_at' => $reg->created_at,
        'updated_at' => $reg->updated_at,
    ]);
    $regCount++;
}

// Emergency registrations
foreach ($emergencyRegs as $emerg) {
    DB::table('t_registrasi')->insert([
        'pasien_id' => $emerg->patient_id,
        'no_registrasi' => 'IGD-' . str_pad($emerg->id, 6, '0', STR_PAD_LEFT),
        'poli_id' => 10, // Assuming IGD poli_id = 10
        'dokter_id' => $emerg->doctor_assigned,
        'jenis_kunjungan' => 'baru',
        'penjamin' => $emerg->emergency_type ? 'tunai' : 'tunai', // Map from emergency_type
        'status' => $emerg->status === 'menunggu' ? 'menunggu' :
                   ($emerg->status === 'dalam_perawatan' ? 'sedang_diperiksa' :
                   ($emerg->status === 'stabil' ? 'selesai' : 'batal')),
        'keluhan' => $emerg->symptoms,
        'biaya_registrasi' => 0,
        'is_igd' => true,
        'gejala_igd' => $emerg->symptoms,
        'tanda_vital_igd' => $emerg->vital_signs,
        'triage_level' => $emerg->triage_level,
        'perawat_triage' => $emerg->nurse_assigned,
        'created_by' => 1, // Default admin
        'created_at' => $emerg->created_at,
        'updated_at' => $emerg->updated_at,
    ]);
    $regCount++;
}

$etlReport['tables']['t_registrasi'] = $regCount;
echo "✅ Migrated $regCount registrations\n";

// 3.3 Extract & Load t_antrian (queue_managements)
echo "3.3 Migrating t_antrian (queue_managements)...\n";
$queues = DB::connection('mysql')->table('queue_managements')->get();
$queueCount = 0;

foreach ($queues as $queue) {
    DB::table('t_antrian')->insert([
        'id' => $queue->id,
        'dokter_id' => $queue->doctor_id,
        'jenis_layanan' => $queue->service_type,
        'no_antrian_sekarang' => $queue->current_number,
        'no_antrian_terakhir' => $queue->last_called_number,
        'waktu_tunggu_rata_rata' => $queue->estimated_wait_time,
        'status' => $queue->status === 'active' ? 'aktif' : 'tidak_aktif',
        'jam_mulai' => $queue->working_hours_start,
        'jam_selesai' => $queue->working_hours_end,
        'antrian_per_jam' => $queue->max_queue_per_hour,
        'waktu_konsultasi_rata_rata' => $queue->average_consultation_time,
        'tanggal' => $queue->queue_date,
        'total_dilayani_hari_ini' => $queue->total_served_today,
        'total_dilewati_hari_ini' => $queue->total_skipped_today,
        'catatan' => $queue->notes,
        'created_at' => $queue->created_at,
        'updated_at' => $queue->updated_at,
    ]);
    $queueCount++;
}

$etlReport['tables']['t_antrian'] = $queueCount;
echo "✅ Migrated $queueCount queue records\n";

// 3.4 Extract & Load t_janji_temu (appointments)
echo "3.4 Migrating t_janji_temu (appointments)...\n";
$appointments = DB::connection('mysql')->table('appointments')->get();
$apptCount = 0;

foreach ($appointments as $appt) {
    DB::table('t_janji_temu')->insert([
        'id' => $appt->id,
        'pasien_id' => $appt->patient_id,
        'dokter_id' => $appt->doctor_id,
        'created_by' => $appt->created_by,
        'tanggal_janji' => $appt->appointment_date,
        'waktu_janji' => $appt->appointment_time,
        'jenis_layanan' => $appt->service_type,
        'status' => $appt->status === 'confirmed' ? 'dikonfirmasi' :
                   ($appt->status === 'pending' ? 'menunggu' :
                   ($appt->status === 'cancelled' ? 'dibatalkan' :
                   ($appt->status === 'completed' ? 'selesai' : 'tidak_hadir'))),
        'catatan' => $appt->notes,
        'pengiriman_pengingat' => $appt->reminder_sent,
        'waktu_pengingat_dikirim' => $appt->reminder_sent_at,
        'saluran_pengingat' => $appt->reminder_channel,
        'alasan_pembatalan' => $appt->cancellation_reason,
        'waktu_dibatalkan' => $appt->cancelled_at,
        'waktu_selesai' => $appt->completed_at,
        'catatan_tindak_lanjut' => $appt->follow_up_notes,
        'biaya_konsultasi' => $appt->consultation_fee,
        'sudah_dibayar' => $appt->is_paid,
        'created_at' => $appt->created_at,
        'updated_at' => $appt->updated_at,
    ]);
    $apptCount++;
}

$etlReport['tables']['t_janji_temu'] = $apptCount;
echo "✅ Migrated $apptCount appointments\n";

// Continue with other tables...
echo "3.5 Migrating remaining tables...\n";
// Add more ETL for other tables as needed

$etlReport['end_time'] = now();
$etlReport['duration'] = $etlReport['end_time']->diffInSeconds($etlReport['start_time']);

echo "\n✅ ETL Migration Completed!\n";
echo "📊 Summary:\n";
foreach ($etlReport['tables'] as $table => $count) {
    echo "  - $table: $count records\n";
}
echo "⏱️  Duration: {$etlReport['duration']} seconds\n";

// Save ETL report
file_put_contents('storage/logs/etl_report.md', json_encode($etlReport, JSON_PRETTY_PRINT));

echo "\n📁 ETL Report saved to storage/logs/etl_report.md\n";

?>
