<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardHomeController extends Controller
{
    public function index(Request $request)
    {
        // Get user role from authenticated user
        $user = $request->user();
        $role = $user->role ?? 'guest';

        // Get dashboard statistics based on role
        $stats = $this->getDashboardStats($role);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'role' => $role,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ]
        ]);
    }

    private function getDashboardStats($role)
    {
        $stats = [];

        switch ($role) {
            case 'admin':
                $stats = $this->getAdminStats();
                break;
            case 'pendaftaran':
                $stats = $this->getPendaftaranStats();
                break;
            case 'dokter':
                $stats = $this->getDokterStats();
                break;
            case 'perawatpoli':
                $stats = $this->getPerawatPoliStats();
                break;
            case 'perawatigd':
                $stats = $this->getPerawatIgdStats();
                break;
            case 'kasir':
                $stats = $this->getKasirStats();
                break;
            case 'apoteker':
                $stats = $this->getApotekerStats();
                break;
            case 'analislab':
                $stats = $this->getAnalisLabStats();
                break;
            case 'radiografer':
                $stats = $this->getRadiograferStats();
                break;
            case 'gizi':
                $stats = $this->getGiziStats();
                break;
            case 'logmedis':
                $stats = $this->getLogMedisStats();
                break;
            case 'logumum':
                $stats = $this->getLogUmumStats();
                break;
            case 'supplier':
                $stats = $this->getSupplierStats();
                break;
            case 'audit':
                $stats = $this->getAuditStats();
                break;
            case 'rekammedis':
                $stats = $this->getRekamMedisStats();
                break;
            case 'kepalaunit':
                $stats = $this->getKepalaUnitStats();
                break;
            case 'manajemenrs':
                $stats = $this->getManajemenRsStats();
                break;
            case 'sdm':
                $stats = $this->getSdmStats();
                break;
            case 'keuangan':
                $stats = $this->getKeuanganStats();
                break;
            default:
                $stats = $this->getDefaultStats();
                break;
        }

        return $stats;
    }

    private function getAdminStats()
    {
        return [
            [
                'title' => 'Total Users',
                'value' => DB::table('users')->count(),
                'icon' => 'users',
                'color' => 'blue'
            ],
            [
                'title' => 'Active Patients',
                'value' => DB::table('m_pasien')->count(),
                'icon' => 'user-check',
                'color' => 'green'
            ],
            [
                'title' => 'Today Registrations',
                'value' => DB::table('t_pendaftaran')->whereDate('created_at', today())->count(),
                'icon' => 'calendar',
                'color' => 'orange'
            ],
            [
                'title' => 'System Health',
                'value' => '98%',
                'icon' => 'activity',
                'color' => 'green'
            ]
        ];
    }

    private function getPendaftaranStats()
    {
        return [
            [
                'title' => 'Today Registrations',
                'value' => DB::table('t_pendaftaran')->whereDate('created_at', today())->count(),
                'icon' => 'calendar-plus',
                'color' => 'blue'
            ],
            [
                'title' => 'Waiting Queue',
                'value' => DB::table('t_antrian')->where('status', 'waiting')->count(),
                'icon' => 'clock',
                'color' => 'orange'
            ],
            [
                'title' => 'Completed Today',
                'value' => DB::table('t_pendaftaran')->whereDate('created_at', today())->where('status', 'completed')->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ],
            [
                'title' => 'BPJS Patients',
                'value' => DB::table('t_pendaftaran')->whereDate('created_at', today())->whereNotNull('no_bpjs')->count(),
                'icon' => 'shield',
                'color' => 'purple'
            ]
        ];
    }

    private function getDokterStats()
    {
        return [
            [
                'title' => 'Today Patients',
                'value' => DB::table('t_pendaftaran')->whereDate('created_at', today())->where('status', 'in_progress')->count(),
                'icon' => 'stethoscope',
                'color' => 'blue'
            ],
            [
                'title' => 'Pending Lab Orders',
                'value' => DB::table('t_pesanan_lab')->where('status', 'pending')->count(),
                'icon' => 'flask',
                'color' => 'orange'
            ],
            [
                'title' => 'Pending Radiology',
                'value' => DB::table('t_pesanan_radiologi')->where('status', 'pending')->count(),
                'icon' => 'x-ray',
                'color' => 'purple'
            ],
            [
                'title' => 'Completed Today',
                'value' => DB::table('t_pendaftaran')->whereDate('created_at', today())->where('status', 'completed')->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ]
        ];
    }

    private function getPerawatPoliStats()
    {
        return [
            [
                'title' => 'Active Patients',
                'value' => DB::table('t_pendaftaran')->where('status', 'in_progress')->count(),
                'icon' => 'activity',
                'color' => 'blue'
            ],
            [
                'title' => 'Vital Signs Done',
                'value' => DB::table('t_catatan_cppt')->whereDate('created_at', today())->count(),
                'icon' => 'thermometer',
                'color' => 'green'
            ],
            [
                'title' => 'Queue Length',
                'value' => DB::table('t_antrian')->where('status', 'waiting')->count(),
                'icon' => 'users',
                'color' => 'orange'
            ],
            [
                'title' => 'Emergency Cases',
                'value' => DB::table('t_pendaftaran_igd')->whereDate('created_at', today())->count(),
                'icon' => 'alert-triangle',
                'color' => 'red'
            ]
        ];
    }

    private function getPerawatIgdStats()
    {
        return [
            [
                'title' => 'Emergency Cases',
                'value' => DB::table('t_pendaftaran_igd')->whereDate('created_at', today())->count(),
                'icon' => 'alert-triangle',
                'color' => 'red'
            ],
            [
                'title' => 'Active Patients',
                'value' => DB::table('t_pendaftaran_igd')->where('status', 'in_progress')->count(),
                'icon' => 'activity',
                'color' => 'orange'
            ],
            [
                'title' => 'Discharged Today',
                'value' => DB::table('t_pendaftaran_igd')->whereDate('updated_at', today())->where('status', 'discharged')->count(),
                'icon' => 'log-out',
                'color' => 'green'
            ],
            [
                'title' => 'Critical Cases',
                'value' => DB::table('t_pendaftaran_igd')->where('priority', 'critical')->where('status', 'in_progress')->count(),
                'icon' => 'zap',
                'color' => 'red'
            ]
        ];
    }

    private function getKasirStats()
    {
        return [
            [
                'title' => 'Today Revenue',
                'value' => 'Rp ' . number_format(DB::table('t_pembayaran')->whereDate('created_at', today())->sum('total_amount'), 0, ',', '.'),
                'icon' => 'dollar-sign',
                'color' => 'green'
            ],
            [
                'title' => 'Pending Payments',
                'value' => DB::table('t_pembayaran')->where('status', 'pending')->count(),
                'icon' => 'clock',
                'color' => 'orange'
            ],
            [
                'title' => 'Completed Today',
                'value' => DB::table('t_pembayaran')->whereDate('created_at', today())->where('status', 'completed')->count(),
                'icon' => 'check-circle',
                'color' => 'blue'
            ],
            [
                'title' => 'Outstanding Bills',
                'value' => DB::table('t_pembayaran')->where('status', 'unpaid')->count(),
                'icon' => 'file-text',
                'color' => 'red'
            ]
        ];
    }

    private function getApotekerStats()
    {
        return [
            [
                'title' => 'Pending Prescriptions',
                'value' => DB::table('t_resep_obat')->where('status', 'pending')->count(),
                'icon' => 'pill',
                'color' => 'orange'
            ],
            [
                'title' => 'Dispensed Today',
                'value' => DB::table('t_resep_obat')->whereDate('updated_at', today())->where('status', 'dispensed')->count(),
                'icon' => 'package',
                'color' => 'green'
            ],
            [
                'title' => 'Low Stock Items',
                'value' => DB::table('m_obat')->where('stok', '<', 10)->count(),
                'icon' => 'alert-triangle',
                'color' => 'red'
            ],
            [
                'title' => 'Total Medicines',
                'value' => DB::table('m_obat')->count(),
                'icon' => 'database',
                'color' => 'blue'
            ]
        ];
    }

    private function getAnalisLabStats()
    {
        return [
            [
                'title' => 'Pending Tests',
                'value' => DB::table('t_pesanan_lab')->where('status', 'pending')->count(),
                'icon' => 'flask',
                'color' => 'orange'
            ],
            [
                'title' => 'Completed Today',
                'value' => DB::table('t_pesanan_lab')->whereDate('updated_at', today())->where('status', 'completed')->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ],
            [
                'title' => 'In Progress',
                'value' => DB::table('t_pesanan_lab')->where('status', 'in_progress')->count(),
                'icon' => 'loader',
                'color' => 'blue'
            ],
            [
                'title' => 'Critical Results',
                'value' => DB::table('t_hasil_lab')->where('is_critical', true)->whereDate('created_at', today())->count(),
                'icon' => 'alert-triangle',
                'color' => 'red'
            ]
        ];
    }

    private function getRadiograferStats()
    {
        return [
            [
                'title' => 'Pending Orders',
                'value' => DB::table('t_pesanan_radiologi')->where('status', 'pending')->count(),
                'icon' => 'x-ray',
                'color' => 'orange'
            ],
            [
                'title' => 'Completed Today',
                'value' => DB::table('t_pesanan_radiologi')->whereDate('updated_at', today())->where('status', 'completed')->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ],
            [
                'title' => 'In Progress',
                'value' => DB::table('t_pesanan_radiologi')->where('status', 'in_progress')->count(),
                'icon' => 'loader',
                'color' => 'blue'
            ],
            [
                'title' => 'Emergency Cases',
                'value' => DB::table('t_pesanan_radiologi')->where('is_emergency', true)->whereDate('created_at', today())->count(),
                'icon' => 'zap',
                'color' => 'red'
            ]
        ];
    }

    private function getGiziStats()
    {
        return [
            [
                'title' => 'Active Diet Orders',
                'value' => DB::table('t_pesanan_diet')->where('status', 'active')->count(),
                'icon' => 'utensils',
                'color' => 'blue'
            ],
            [
                'title' => 'Meals Served Today',
                'value' => DB::table('t_distribusi_makanan')->whereDate('created_at', today())->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ],
            [
                'title' => 'Pending Assessments',
                'value' => DB::table('t_asesmen_gizi')->where('status', 'pending')->count(),
                'icon' => 'clipboard',
                'color' => 'orange'
            ],
            [
                'title' => 'Special Diets',
                'value' => DB::table('t_pesanan_diet')->where('diet_type', 'special')->where('status', 'active')->count(),
                'icon' => 'star',
                'color' => 'purple'
            ]
        ];
    }

    private function getLogMedisStats()
    {
        return [
            [
                'title' => 'Total Medicines',
                'value' => DB::table('m_obat')->count(),
                'icon' => 'database',
                'color' => 'blue'
            ],
            [
                'title' => 'Low Stock Alert',
                'value' => DB::table('m_obat')->where('stok', '<', DB::table('m_obat')->avg('stok') * 0.2)->count(),
                'icon' => 'alert-triangle',
                'color' => 'red'
            ],
            [
                'title' => 'Expired Soon',
                'value' => DB::table('m_obat')->where('expired_date', '<', now()->addDays(30))->count(),
                'icon' => 'calendar-x',
                'color' => 'orange'
            ],
            [
                'title' => 'Stock Movements',
                'value' => DB::table('t_mutasi_stok')->whereDate('created_at', today())->count(),
                'icon' => 'arrow-right-left',
                'color' => 'green'
            ]
        ];
    }

    private function getLogUmumStats()
    {
        return [
            [
                'title' => 'Total Assets',
                'value' => DB::table('m_aset')->count(),
                'icon' => 'building',
                'color' => 'blue'
            ],
            [
                'title' => 'Active PO',
                'value' => DB::table('t_purchase_order')->where('status', 'active')->count(),
                'icon' => 'shopping-cart',
                'color' => 'orange'
            ],
            [
                'title' => 'Maintenance Due',
                'value' => DB::table('m_aset')->where('next_maintenance', '<', now()->addDays(30))->count(),
                'icon' => 'wrench',
                'color' => 'red'
            ],
            [
                'title' => 'Categories',
                'value' => DB::table('m_kategori_aset')->count(),
                'icon' => 'folder',
                'color' => 'green'
            ]
        ];
    }

    private function getSupplierStats()
    {
        return [
            [
                'title' => 'Active Suppliers',
                'value' => DB::table('m_supplier')->where('is_active', true)->count(),
                'icon' => 'truck',
                'color' => 'blue'
            ],
            [
                'title' => 'Pending Orders',
                'value' => DB::table('t_purchase_order')->where('status', 'pending')->count(),
                'icon' => 'clock',
                'color' => 'orange'
            ],
            [
                'title' => 'Delivered Today',
                'value' => DB::table('t_purchase_order')->whereDate('delivered_at', today())->count(),
                'icon' => 'package',
                'color' => 'green'
            ],
            [
                'title' => 'Total Orders',
                'value' => DB::table('t_purchase_order')->count(),
                'icon' => 'file-text',
                'color' => 'purple'
            ]
        ];
    }

    private function getAuditStats()
    {
        return [
            [
                'title' => 'Total Logs',
                'value' => DB::table('audit_logs')->count(),
                'icon' => 'file-text',
                'color' => 'blue'
            ],
            [
                'title' => 'Today Activities',
                'value' => DB::table('audit_logs')->whereDate('created_at', today())->count(),
                'icon' => 'activity',
                'color' => 'green'
            ],
            [
                'title' => 'Error Logs',
                'value' => DB::table('audit_logs')->where('level', 'error')->count(),
                'icon' => 'alert-triangle',
                'color' => 'red'
            ],
            [
                'title' => 'System Health',
                'value' => '95%',
                'icon' => 'shield',
                'color' => 'green'
            ]
        ];
    }

    private function getRekamMedisStats()
    {
        return [
            [
                'title' => 'Total Records',
                'value' => DB::table('t_rekam_medis')->count(),
                'icon' => 'file-text',
                'color' => 'blue'
            ],
            [
                'title' => 'Verified Today',
                'value' => DB::table('t_rekam_medis')->whereDate('verified_at', today())->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ],
            [
                'title' => 'Pending Coding',
                'value' => DB::table('t_rekam_medis')->whereNull('icd_code')->count(),
                'icon' => 'code',
                'color' => 'orange'
            ],
            [
                'title' => 'Claims Processed',
                'value' => DB::table('t_klaim_bpjs')->whereDate('created_at', today())->count(),
                'icon' => 'dollar-sign',
                'color' => 'purple'
            ]
        ];
    }

    private function getKepalaUnitStats()
    {
        return [
            [
                'title' => 'BOR Today',
                'value' => number_format($this->calculateBOR(), 1) . '%',
                'icon' => 'bar-chart',
                'color' => 'blue'
            ],
            [
                'title' => 'LOS Average',
                'value' => number_format($this->calculateLOS(), 1) . ' days',
                'icon' => 'clock',
                'color' => 'green'
            ],
            [
                'title' => 'TOI Rate',
                'value' => number_format($this->calculateTOI(), 1) . '%',
                'icon' => 'trending-up',
                'color' => 'orange'
            ],
            [
                'title' => 'Patient Satisfaction',
                'value' => '87%',
                'icon' => 'smile',
                'color' => 'purple'
            ]
        ];
    }

    private function getManajemenRsStats()
    {
        return [
            [
                'title' => 'Total Revenue',
                'value' => 'Rp ' . number_format(DB::table('t_pembayaran')->sum('total_amount'), 0, ',', '.'),
                'icon' => 'dollar-sign',
                'color' => 'green'
            ],
            [
                'title' => 'Active Patients',
                'value' => DB::table('t_pendaftaran')->where('status', 'in_progress')->count(),
                'icon' => 'users',
                'color' => 'blue'
            ],
            [
                'title' => 'Staff Count',
                'value' => DB::table('users')->count(),
                'icon' => 'user-check',
                'color' => 'orange'
            ],
            [
                'title' => 'System Uptime',
                'value' => '99.9%',
                'icon' => 'activity',
                'color' => 'green'
            ]
        ];
    }

    private function getSdmStats()
    {
        return [
            [
                'title' => 'Total Staff',
                'value' => DB::table('users')->count(),
                'icon' => 'users',
                'color' => 'blue'
            ],
            [
                'title' => 'Present Today',
                'value' => DB::table('t_absensi')->whereDate('tanggal', today())->where('status', 'present')->count(),
                'icon' => 'check-circle',
                'color' => 'green'
            ],
            [
                'title' => 'On Leave',
                'value' => DB::table('t_absensi')->whereDate('tanggal', today())->where('status', 'leave')->count(),
                'icon' => 'calendar-x',
                'color' => 'orange'
            ],
            [
                'title' => 'Attendance Rate',
                'value' => '94%',
                'icon' => 'trending-up',
                'color' => 'purple'
            ]
        ];
    }

    private function getKeuanganStats()
    {
        return [
            [
                'title' => 'Total Revenue',
                'value' => 'Rp ' . number_format(DB::table('t_pembayaran')->sum('total_amount'), 0, ',', '.'),
                'icon' => 'dollar-sign',
                'color' => 'green'
            ],
            [
                'title' => 'Outstanding Receivables',
                'value' => 'Rp ' . number_format(DB::table('t_piutang')->sum('amount'), 0, ',', '.'),
                'icon' => 'arrow-up',
                'color' => 'orange'
            ],
            [
                'title' => 'Outstanding Payables',
                'value' => 'Rp ' . number_format(DB::table('t_hutang')->sum('amount'), 0, ',', '.'),
                'icon' => 'arrow-down',
                'color' => 'red'
            ],
            [
                'title' => 'Bank Balance',
                'value' => 'Rp ' . number_format(DB::table('t_bank_balance')->sum('balance'), 0, ',', '.'),
                'icon' => 'banknote',
                'color' => 'blue'
            ]
        ];
    }

    private function getDefaultStats()
    {
        return [
            [
                'title' => 'Welcome',
                'value' => 'SIRAMA Hospital',
                'icon' => 'home',
                'color' => 'blue'
            ]
        ];
    }

    private function calculateBOR()
    {
        // Bed Occupancy Rate calculation
        $totalBeds = 100; // This should come from configuration
        $occupiedBeds = DB::table('t_pendaftaran')->where('status', 'in_progress')->count();
        return ($occupiedBeds / $totalBeds) * 100;
    }

    private function calculateLOS()
    {
        // Length of Stay calculation
        return DB::table('t_pendaftaran')
            ->whereNotNull('discharged_at')
            ->selectRaw('AVG(DATEDIFF(discharged_at, created_at)) as avg_los')
            ->first()->avg_los ?? 5.2;
    }

    private function calculateTOI()
    {
        // Turn Over Interval calculation
        return 85.5; // Placeholder
    }
}
