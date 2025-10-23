<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Laravel\Passport\Client;
use Laravel\Passport\PersonalAccessClient;

class PassportClientSeeder extends Seeder
{
    /**
     * Seed the Passport OAuth clients.
     */
    public function run(): void
    {
        $this->command->info('🔐 Setting up Passport OAuth clients...');

        // Check if personal access client already exists
        $existingClient = Client::where('personal_access_client', true)->first();

        if ($existingClient) {
            $this->command->warn('Personal access client already exists. Skipping...');
            return;
        }

        // Create personal access client
        $client = Client::create([
            'name' => 'GarageApp Personal Access Client',
            'secret' => \Illuminate\Support\Str::random(40),
            'redirect' => 'http://localhost',
            'personal_access_client' => true,
            'password_client' => false,
            'revoked' => false,
        ]);

        // Create personal access client record
        PersonalAccessClient::create([
            'client_id' => $client->id,
        ]);

        $this->command->info('✅ Personal access client created successfully!');
        $this->command->table(
            ['ID', 'Name', 'Type'],
            [
                [$client->id, $client->name, 'Personal Access Client'],
            ]
        );
    }
}

