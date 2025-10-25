<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PassportClientSeeder extends Seeder
{
    /**
     * Seed the Passport OAuth clients.
     */
    public function run(): void
    {
        $this->command->info('🔐 Setting up Passport OAuth clients...');

        // Check if client already exists
        $existingClient = DB::table('oauth_clients')->where('name', 'GarageApp Personal Access Client')->first();

        if ($existingClient) {
            $this->command->warn('⚠️  Personal access client already exists. Skipping...');
            return;
        }

        // Create personal access client
        DB::table('oauth_clients')->insert([
            'id' => Str::uuid(),
            'name' => 'GarageApp Personal Access Client',
            'secret' => Str::random(40),
            'provider' => null,
            'redirect_uris' => json_encode(['http://localhost']),
            'grant_types' => json_encode(['personal_access']),
            'revoked' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create password grant client
        DB::table('oauth_clients')->insert([
            'id' => Str::uuid(),
            'name' => 'GarageApp Password Grant Client',
            'secret' => Str::random(40),
            'provider' => 'users',
            'redirect_uris' => json_encode(['http://localhost']),
            'grant_types' => json_encode(['password']),
            'revoked' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('✅ Passport OAuth clients created successfully!');
    }
}
