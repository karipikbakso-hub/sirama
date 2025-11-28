<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BpjsConfiguration;

class BpjsConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configs = [
            [
                'api_endpoint' => 'https://apijkn.bpjs-kesehatan.go.id/vclaim-rest',
                'api_key' => 'your_production_api_key_here',
                'secret_key' => 'your_production_secret_key_here',
                'token_expiry' => now()->addHours(1),
                'rate_limit' => 100,
                'is_active' => true,
                'environment' => 'production',
                'additional_config' => [
                    'timeout' => 30,
                    'retry_attempts' => 3,
                    'retry_delay' => 5,
                ],
                'description' => 'Production BPJS API Configuration',
            ],
            [
                'api_endpoint' => 'https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest',
                'api_key' => 'your_development_api_key_here',
                'secret_key' => 'your_development_secret_key_here',
                'token_expiry' => now()->addHours(1),
                'rate_limit' => 50,
                'is_active' => false,
                'environment' => 'development',
                'additional_config' => [
                    'timeout' => 60,
                    'retry_attempts' => 2,
                    'retry_delay' => 10,
                ],
                'description' => 'Development BPJS API Configuration',
            ],
            [
                'api_endpoint' => 'https://apijkn-staging.bpjs-kesehatan.go.id/vclaim-rest',
                'api_key' => 'your_staging_api_key_here',
                'secret_key' => 'your_staging_secret_key_here',
                'token_expiry' => now()->addHours(1),
                'rate_limit' => 25,
                'is_active' => false,
                'environment' => 'staging',
                'additional_config' => [
                    'timeout' => 45,
                    'retry_attempts' => 1,
                    'retry_delay' => 15,
                ],
                'description' => 'Staging BPJS API Configuration',
            ],
        ];

        foreach ($configs as $config) {
            BpjsConfiguration::create($config);
        }
    }
}
