<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubjectStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * NOTE: This table contains a very large dataset (thousands of records).
     * For production, consider:
     * 1. Importing via API from external source
     * 2. Using CSV import
     * 3. Or run this seeder only once during initial setup
     */
    public function run(): void
    {
        $this->command->info("💾 Inserting subject_students records...");

        // Sample data structure - in production, load from external source or API
        $sampleData = $this->getSampleData();

        if (empty($sampleData)) {
            $this->command->warn("⚠️  No sample data available. Please import via API or CSV.");
            return;
        }

        // Insert in large chunks for performance
        $chunks = array_chunk($sampleData, 500);
        $total = 0;

        foreach ($chunks as $chunk) {
            DB::table('subject_students')->insert($chunk);
            $total += count($chunk);
            $percentage = round(($total / count($sampleData)) * 100, 1);
            $this->command->info("✅ Progress: {$total} / " . count($sampleData) . " ({$percentage}%)");
        }

        $this->command->info("✅ Successfully inserted {$total} subject_students records");
    }

    private function getSampleData(): array
    {
        // Sample records - in production, this would be loaded from an external source
        // Format: [student_id, subject_id, x, y, z]
        $timestamp = '2025-11-18 19:19:00';

        $rawData = [
            // Add your data here or load from external source
            // Example format:
            // ['CA2421002', 39, null, null, null],
            // ['CA2421002', 40, null, null, null],
            // ... more records
        ];

        // Convert to full format
        $result = [];
        foreach ($rawData as $index => $item) {
            $result[] = [
                'id' => $index + 1,
                'student_id' => $item[0],
                'subject_id' => $item[1],
                'x' => $item[2],
                'y' => $item[3],
                'z' => $item[4],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        return $result;
    }
}

