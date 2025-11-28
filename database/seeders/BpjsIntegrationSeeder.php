<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BpjsIntegration;

class BpjsIntegrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $integrations = [
            [
                'patient_id' => 1,
                'service_type' => 'sep_creation',
                'request_data' => [
                    'noKartu' => '0001234567890',
                    'tglSep' => '2025-01-15',
                    'jnsPelayanan' => '2',
                    'klsRawat' => '3',
                    'noMR' => 'MR001',
                    'rujukan' => [
                        'asalRujukan' => '1',
                        'tglRujukan' => '2025-01-15',
                        'noRujukan' => 'RFL00120250115',
                        'ppkRujukan' => '0123R001'
                    ],
                    'catatan' => 'Suspect Acute Coronary Syndrome',
                    'diagAwal' => 'I20.0',
                    'poliTujuan' => 'INT',
                    'klsRawatHak' => '3'
                ],
                'response_data' => [
                    'noSep' => '0123R0010125V000001',
                    'tglSep' => '2025-01-15',
                    'jnsPelayanan' => 'Rawat Inap',
                    'klsRawat' => 'Kelas 3',
                    'penjamin' => 'JKN',
                    'poli' => 'Kardiologi'
                ],
                'status' => 'success',
                'error_message' => null,
                'processing_time_ms' => 1250,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/SEP/2.0/insert',
                'request_timestamp' => '2025-01-15 10:30:00',
                'response_timestamp' => '2025-01-15 10:30:01',
                'retry_count' => 0,
                'correlation_id' => 'SEP-20250115-001',
            ],
            [
                'patient_id' => 2,
                'service_type' => 'sep_creation',
                'request_data' => [
                    'noKartu' => '0001234567891',
                    'tglSep' => '2025-01-18',
                    'jnsPelayanan' => '2',
                    'klsRawat' => '2',
                    'noMR' => 'MR002',
                    'rujukan' => [
                        'asalRujukan' => '1',
                        'tglRujukan' => '2025-01-18',
                        'noRujukan' => 'RFL00220250118',
                        'ppkRujukan' => '0123R001'
                    ],
                    'catatan' => 'Severe Pneumonia with Sepsis',
                    'diagAwal' => 'J18.1',
                    'poliTujuan' => 'ICU',
                    'klsRawatHak' => '2'
                ],
                'response_data' => [
                    'noSep' => '0123R0010125V000002',
                    'tglSep' => '2025-01-18',
                    'jnsPelayanan' => 'Rawat Inap',
                    'klsRawat' => 'Kelas 2',
                    'penjamin' => 'JKN',
                    'poli' => 'ICU'
                ],
                'status' => 'success',
                'error_message' => null,
                'processing_time_ms' => 980,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/SEP/2.0/insert',
                'request_timestamp' => '2025-01-18 15:45:00',
                'response_timestamp' => '2025-01-18 15:45:01',
                'retry_count' => 0,
                'correlation_id' => 'SEP-20250118-002',
            ],
            [
                'patient_id' => 3,
                'service_type' => 'sep_creation',
                'request_data' => [
                    'noKartu' => '0001234567892',
                    'tglSep' => '2025-01-20',
                    'jnsPelayanan' => '1',
                    'klsRawat' => '1',
                    'noMR' => 'MR003',
                    'rujukan' => [
                        'asalRujukan' => '1',
                        'tglRujukan' => '2025-01-20',
                        'noRujukan' => 'RFL00520250120',
                        'ppkRujukan' => '0123R001'
                    ],
                    'catatan' => 'Febrile Seizure',
                    'diagAwal' => 'R56.0',
                    'poliTujuan' => 'ANA',
                    'klsRawatHak' => '1'
                ],
                'response_data' => [
                    'noSep' => '0123R0010125J000003',
                    'tglSep' => '2025-01-20',
                    'jnsPelayanan' => 'Rawat Jalan',
                    'klsRawat' => 'Kelas 1',
                    'penjamin' => 'JKN',
                    'poli' => 'Anak'
                ],
                'status' => 'success',
                'error_message' => null,
                'processing_time_ms' => 1450,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/SEP/2.0/insert',
                'request_timestamp' => '2025-01-20 20:15:00',
                'response_timestamp' => '2025-01-20 20:15:01',
                'retry_count' => 0,
                'correlation_id' => 'SEP-20250120-003',
            ],
            [
                'patient_id' => 4,
                'service_type' => 'sep_update',
                'request_data' => [
                    'noSep' => '0123R0010125V000004',
                    'klsRawat' => '2',
                    'noMR' => 'MR004',
                    'catatan' => 'Update kelas rawat - Diabetes Melitus'
                ],
                'response_data' => [
                    'noSep' => '0123R0010125V000004',
                    'status' => 'updated',
                    'message' => 'SEP berhasil diupdate'
                ],
                'status' => 'success',
                'error_message' => null,
                'processing_time_ms' => 890,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/SEP/2.0/update',
                'request_timestamp' => '2025-01-22 11:30:00',
                'response_timestamp' => '2025-01-22 11:30:01',
                'retry_count' => 0,
                'correlation_id' => 'SEP-UPD-20250122-004',
            ],
            [
                'patient_id' => 5,
                'service_type' => 'sep_deletion',
                'request_data' => [
                    'noSep' => '0123R0010125V000005',
                    'user' => 'dr.hartono',
                    'catatan' => 'Pasien tidak jadi dirawat'
                ],
                'response_data' => [
                    'noSep' => '0123R0010125V000005',
                    'status' => 'deleted',
                    'message' => 'SEP berhasil dihapus'
                ],
                'status' => 'success',
                'error_message' => null,
                'processing_time_ms' => 720,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/SEP/2.0/delete',
                'request_timestamp' => '2025-01-25 17:20:00',
                'response_timestamp' => '2025-01-25 17:20:01',
                'retry_count' => 0,
                'correlation_id' => 'SEP-DEL-20250125-005',
            ],
            [
                'patient_id' => 1,
                'service_type' => 'claim_submission',
                'request_data' => [
                    'noSep' => '0123R0010125V000001',
                    'coderNIK' => '1234567890123456',
                    'kdDokter' => '123456',
                    'poliRujukan' => 'INT',
                    'diagnosa' => 'I20.0',
                    'procedure' => ['5-801', '5-802'],
                    'tarifRs' => [
                        'prosedurNonBedah' => 5000000,
                        'prosedurBedah' => 0,
                        'konsultasi' => 500000,
                        'tenagaAhli' => 1000000,
                        'keperawatan' => 750000,
                        'penunjang' => 1500000,
                        'radiologi' => 500000,
                        'laboratorium' => 300000,
                        'pelayananDarah' => 0,
                        'rehabilitasi' => 0,
                        'kamar' => 2000000,
                        'rawatIntensif' => 3000000,
                        'obat' => 800000,
                        'alkes' => 2000000,
                        'bmhp' => 100000,
                        'sewaAlat' => 0
                    ]
                ],
                'response_data' => [
                    'noSep' => '0123R0010125V000001',
                    'status' => 'accepted',
                    'message' => 'Klaim berhasil disubmit',
                    'cbgCode' => 'P-5-81-0-I',
                    'tarifCbg' => 8500000
                ],
                'status' => 'success',
                'error_message' => null,
                'processing_time_ms' => 2100,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/Claim/1.0/Submit',
                'request_timestamp' => '2025-01-16 08:00:00',
                'response_timestamp' => '2025-01-16 08:00:02',
                'retry_count' => 0,
                'correlation_id' => 'CLAIM-20250116-001',
            ],
            [
                'patient_id' => 2,
                'service_type' => 'sep_creation',
                'request_data' => [
                    'noKartu' => '0001234567891',
                    'tglSep' => '2025-01-18',
                    'jnsPelayanan' => '2',
                    'klsRawat' => '3',
                    'noMR' => 'MR002',
                    'rujukan' => [
                        'asalRujukan' => '1',
                        'tglRujukan' => '2025-01-18',
                        'noRujukan' => 'RFL00220250118',
                        'ppkRujukan' => '0123R001'
                    ],
                    'catatan' => 'Severe Pneumonia with Sepsis',
                    'diagAwal' => 'J18.1',
                    'poliTujuan' => 'ICU',
                    'klsRawatHak' => '3'
                ],
                'response_data' => [
                    'error' => 'Kartu BPJS tidak aktif',
                    'code' => '201',
                    'message' => 'Peserta tidak aktif'
                ],
                'status' => 'failed',
                'error_message' => 'BPJS API Error: Peserta tidak aktif',
                'processing_time_ms' => 850,
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest/SEP/2.0/insert',
                'request_timestamp' => '2025-01-18 15:40:00',
                'response_timestamp' => '2025-01-18 15:40:01',
                'retry_count' => 2,
                'correlation_id' => 'SEP-20250118-002-FAIL',
            ],
        ];

        foreach ($integrations as $integration) {
            BpjsIntegration::create($integration);
        }
    }
}
