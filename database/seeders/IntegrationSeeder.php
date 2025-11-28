<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BpjsConfiguration;
use App\Models\OnehealthConfig;

class IntegrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed BPJS Configuration
        BpjsConfiguration::updateOrCreate(
            ['is_active' => true],
            [
                'api_endpoint' => 'https://api.bpjs-kesehatan.go.id',
                'api_key' => null, // Will be set by admin
                'secret_key' => null, // Will be set by admin
                'rate_limit' => 1000,
                'environment' => 'sandbox',
                'is_active' => false, // Disabled by default for security
                'description' => 'BPJS Kesehatan API Integration Configuration'
            ]
        );

        // Seed SATUSEHAT Configuration
        OnehealthConfig::updateOrCreate(
            ['name' => 'SATUSEHAT Integration'],
            [
                'status' => 'inactive', // Disabled by default
                'client_id' => null, // Will be set by admin
                'client_secret' => null, // Will be set by admin
                'base_url' => 'https://api-satusehat.kemkes.go.id',
                'organization_id' => null, // Will be set by admin
                'facility_id' => null, // Will be set by admin
                'notes' => 'SATUSEHAT (Satu Sehat) Integration Configuration - FHIR based healthcare data exchange'
            ]
        );

        $this->command->info('Integration configurations seeded successfully!');
        $this->command->warn('⚠️  IMPORTANT: Please configure API credentials in the admin dashboard before enabling integrations.');
        $this->command->info('📍 Go to: Admin Dashboard > Integration > BPJS/SATUSEHAT tabs to configure credentials.');
    }
}
