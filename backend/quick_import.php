<?php

/**
 * SCRIPT IMPORT MAJOR_SUBJECTS DATA
 * Chạy: php quick_import.php
 */

// Load Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔄 Starting import...\n";

try {
    // Check current count
    $currentCount = DB::table('major_subjects')->count();
    echo "📊 Current records: $currentCount\n";

    if ($currentCount > 0) {
        echo "⚠️  Table has data. Truncating...\n";
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('major_subjects')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        echo "✅ Truncated\n";
    }

    // Read SQL file
    $sqlFile = __DIR__ . '/../frontend/app/routes/sql/major_subjects.sql';

    if (!file_exists($sqlFile)) {
        die("❌ File not found: $sqlFile\n");
    }

    echo "📖 Reading SQL file...\n";
    $sql = file_get_contents($sqlFile);

    // Extract INSERT VALUES
    if (preg_match('/INSERT INTO `major_subjects`[^V]*VALUES\s*(.+);/s', $sql, $matches)) {
        $valuesBlock = $matches[1];

        // Split by "),(" to get individual records
        $valuesBlock = trim($valuesBlock);
        $records = preg_split('/\),\s*\(/s', $valuesBlock);

        echo "📦 Found " . count($records) . " records\n";

        $data = [];
        foreach ($records as $record) {
            // Clean up
            $record = trim($record, '()');

            // Parse values: id, major_id, subject_id, created_at, updated_at, deleted_at
            if (preg_match('/(\d+),\s*(\d+),\s*(\d+),\s*\'([^\']+)\',\s*\'([^\']+)\',\s*(NULL|\'[^\']*\')/', $record, $vals)) {
                $data[] = [
                    'id' => (int)$vals[1],
                    'major_id' => (int)$vals[2],
                    'subject_id' => (int)$vals[3],
                    'created_at' => $vals[4],
                    'updated_at' => $vals[5],
                    'deleted_at' => $vals[6] === 'NULL' ? null : trim($vals[6], "'"),
                ];
            }
        }

        if (empty($data)) {
            die("❌ No valid data parsed\n");
        }

        echo "💾 Inserting " . count($data) . " records...\n";

        // Insert in chunks
        $chunks = array_chunk($data, 100);
        $inserted = 0;

        DB::beginTransaction();

        foreach ($chunks as $index => $chunk) {
            DB::table('major_subjects')->insert($chunk);
            $inserted += count($chunk);
            echo "\r  Progress: $inserted / " . count($data);
        }

        DB::commit();

        echo "\n✅ SUCCESS! Inserted $inserted records\n";

        // Verify
        $finalCount = DB::table('major_subjects')->count();
        echo "📊 Final count: $finalCount\n";

        // Show sample
        echo "\n📋 Sample data:\n";
        $samples = DB::table('major_subjects')
            ->join('majors', 'major_subjects.major_id', '=', 'majors.id')
            ->join('subjects', 'major_subjects.subject_id', '=', 'subjects.id')
            ->select('majors.tenNganh', 'subjects.tenMon')
            ->limit(5)
            ->get();

        foreach ($samples as $sample) {
            echo "  - {$sample->tenNganh} → {$sample->tenMon}\n";
        }

    } else {
        die("❌ Could not parse INSERT statement\n");
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
