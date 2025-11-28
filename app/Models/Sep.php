<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Sep extends Model
{
    protected $fillable = [
        'patient_id',
        'registration_id',
        'sep_number',
        'bpjs_number',
        'service_type',
        'diagnosis',
        'status',
        'notes',
        'created_by',
        'validated_at',
        'validation_status',
        'expiry_date',
        'flagged_reason',
        'validation_response',
        'dpjp_id', // ID of the doctor providing the service
        'poli_id', // ID of the clinic/department
    ];

    protected $casts = [
        'status' => 'string',
        'service_type' => 'string',
        'validated_at' => 'datetime',
        'expiry_date' => 'datetime',
        'validation_response' => 'array',
    ];

    /**
     * Generate unique SEP number
     */
    public static function generateSepNumber(): string
    {
        do {
            $number = 'SEP' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('sep_number', $number)->exists());

        return $number;
    }

    /**
     * Get the patient that owns the SEP
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the registration that owns the SEP
     */
    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    /**
     * Get the user who created the SEP
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the DPJP (doctor providing service)
     */
    public function dpjp(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'dpjp_id');
    }

    /**
     * Get the poli/clinic
     */
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    /**
     * Check if SEP can be updated
     */
    public function canBeUpdated(): bool
    {
        return $this->status !== 'rejected';
    }

    /**
     * Check if SEP can be deleted
     */
    public function canBeDeleted(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if SEP is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Calculate expiry date based on service type
     */
    public function calculateExpiryDate(): self
    {
        $days = $this->service_type === 'Rawat Inap' ? 3 : 7; // RI: 3 days, RJ: 7 days
        $this->expiry_date = $this->created_at->copy()->addDays($days);
        return $this;
    }

    /**
     * Get validation status color
     */
    public function getValidationStatusColor(): string
    {
        return match($this->validation_status) {
            'valid' => 'green',
            'invalid' => 'red',
            'expired' => 'red',
            'not_checked' => 'yellow',
            default => 'gray'
        };
    }

    /**
     * Check if SEP should be flagged as suspicious
     */
    public function isSuspicious(): bool
    {
        $rules = [
            $this->checkDuplicateSep(),
            $this->checkMultipleSepSameDay(),
            $this->checkHighFrequencyPatient(),
            $this->checkDiagnosisSpecialtyMismatch(),
            $this->checkOffScheduleDoctor(),
            $this->checkExpiredReferral(),
            $this->checkInvalidDiagnosis()
        ];

        return collect($rules)->contains(true);
    }

    /**
     * Rule: Duplicate SEP within 30 days
     */
    private function checkDuplicateSep(): bool
    {
        $duplicateCount = self::where('bpjs_number', $this->bpjs_number)
            ->where('created_at', '>=', now()->subDays(30))
            ->where('id', '!=', $this->id)
            ->count();

        return $duplicateCount > 0;
    }

    /**
     * Rule: Multiple SEP same day, same service type
     */
    private function checkMultipleSepSameDay(): bool
    {
        $sameDayCount = self::where('patient_id', $this->patient_id)
            ->where('service_type', $this->service_type)
            ->whereDate('created_at', $this->created_at)
            ->where('id', '!=', $this->id)
            ->count();

        return $sameDayCount > 0;
    }

    /**
     * Rule: High frequency patient (>10 SEPs in 30 days)
     */
    private function checkHighFrequencyPatient(): bool
    {
        $monthCount = self::where('bpjs_number', $this->bpjs_number)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        return $monthCount >= 10;
    }

    /**
     * Rule: Diagnosis doesn't match specialty
     */
    private function checkDiagnosisSpecialtyMismatch(): bool
    {
        if (!$this->poli_id) return false;

        // Get diagnosis from ICD-10
        $icd10 = Icd10Diagnosis::where('code', 'like', substr($this->diagnosis, 0, 3) . '%')
            ->first();

        if (!$icd10) return false;

        // Check if diagnosis is typical for this poli
        $poli = $this->poli;
        if (!$poli) return false;

        $typicalDiagnoses = $this->getTypicalDiagnosesForPoli($poli->id);

        return !collect($typicalDiagnoses)->contains($icd10->chapter);
    }

    /**
     * Rule: Doctor not scheduled
     */
    private function checkOffScheduleDoctor(): bool
    {
        if (!$this->dpjp_id) return false;

        $schedule = \DB::table('jadwal_dokters')
            ->where('doctor_id', $this->dpjp_id)
            ->where('date', $this->created_at->format('Y-m-d'))
            ->where('is_active', true)
            ->first();

        return !$schedule;
    }

    /**
     * Rule: Referral expired for Rawat Inap
     */
    private function checkExpiredReferral(): bool
    {
        if ($this->service_type !== 'Rawat Inap') return false;

        // Check if there's a referral record
        $referral = \DB::table('referrals')
            ->where('patient_id', $this->patient_id)
            ->where('created_at', '>=', now()->subDays(90))
            ->orderBy('created_at', 'desc')
            ->first();

        return !$referral;
    }

    /**
     * Rule: Invalid diagnosis
     */
    private function checkInvalidDiagnosis(): bool
    {
        if (empty($this->diagnosis)) return true;

        // Check if diagnosis exists in ICD-10
        $exists = Icd10Diagnosis::where('code', 'like', substr($this->diagnosis, 0, 3) . '%')
            ->exists();

        return !$exists;
    }

    /**
     * Get typical diagnosis chapters for a poli
     */
    private function getTypicalDiagnosesForPoli($poliId): array
    {
        // This would be a configuration or database lookup
        $poliDiagnoses = [
            'Umum' => ['A', 'B', 'J', 'R'],
            'Penyakit Dalam' => ['E', 'I', 'K', 'N'],
            'Jantung' => ['I'],
            'Paru' => ['J'],
            'Mata' => ['H'],
            'THT' => ['H', 'J'],
            'Kulit' => ['L'],
            'Anak' => ['P', 'Q', 'A', 'J'],
            'Kandungan' => ['O', 'N'],
            'Bedah' => ['S', 'T', 'M'],
            'Ortopedi' => ['M', 'S'],
            'Urologi' => ['N'],
            'Neurologi' => ['G'],
        ];

        return $poliDiagnoses[$poliId] ?? [];
    }

    /**
     * Get validation status badge
     */
    public function getValidationBadge(): array
    {
        return match($this->validation_status) {
            'valid' => ['🟢 Valid', 'green'],
            'invalid' => ['🔴 Invalid', 'red'],
            'expired' => ['⏰ Expired', 'red'],
            'not_checked' => ['🟡 Not Checked', 'yellow'],
            default => ['⚪ Unknown', 'gray']
        };
    }
}
