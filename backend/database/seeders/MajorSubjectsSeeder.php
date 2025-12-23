<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MajorSubjectsSeeder extends Seeder
{
    public function run(): void
    {
        // Check if already seeded
        $existingCount = DB::table('major_subjects')->count();

        if ($existingCount > 0) {
            $this->command->info("⚠️  Major-subjects relations already exist ({$existingCount} records). Skipping...");
            return;
        }

        $this->command->info("💾 Inserting major_subjects relations...");

        // Sample relationships - add more as needed
        $data = $this->getSampleRelations();

        if (empty($data)) {
            $this->command->warn("⚠️  No sample data. Create relationships via API.");
            return;
        }

        $chunks = array_chunk($data, 100);
        $total = 0;

        foreach ($chunks as $chunk) {
            DB::table('major_subjects')->insert($chunk);
            $total += count($chunk);
        }

        $this->command->info("✅ Successfully inserted {$total} major_subjects relations");
    }

    private function getSampleRelations(): array
    {
        $timestamp = '2025-11-16 23:35:20';

        // Sample data structure: [major_id, subject_id]
        // Map common subjects to multiple majors
        $relations = [
            // Triết học (id=4) - common for many majors
            [1, 4], [2, 4], [4, 4], [5, 4], [10, 4], [11, 4], [13, 4], [15, 4], [16, 4], [17, 4],
            // Tiếng Anh (id=5) - common for many majors
            [1, 5], [2, 5], [4, 5], [5, 5], [10, 5], [11, 5], [13, 5], [15, 5], [16, 5], [17, 5],
            // Add more relations as needed
        ];

        $result = [];
        foreach ($relations as $index => $rel) {
            $result[] = [
                'id' => $index + 1,
                'major_id' => $rel[0],
                'subject_id' => $rel[1],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
                'deleted_at' => null,
            ];
        }

        return $result;
    }
}


