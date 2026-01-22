<?php

/**
 * Script để import dữ liệu major_subjects từ file SQL
 * Chạy: php import_major_subjects_data.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔄 Importing major_subjects data...\n";

try {
    // Read SQL file
    $sqlFile = __DIR__ . '/../frontend/app/routes/sql/major_subjects.sql';

    if (!file_exists($sqlFile)) {
        die("❌ SQL file not found: $sqlFile\n");
    }

    $sql = file_get_contents($sqlFile);

    // Extract INSERT statements
    preg_match_all('/INSERT INTO `major_subjects`.*?VALUES\s*(.*?);/s', $sql, $matches);

    if (empty($matches[1])) {
        die("❌ No INSERT statements found\n");
    }

    // Parse values
    $valuesString = $matches[1][0];
    preg_match_all('/\((\d+),\s*(\d+),\s*(\d+),\s*\'([^\']+)\',\s*\'([^\']+)\',\s*(NULL|\'[^\']*\')\)/', $valuesString, $valueMatches, PREG_SET_ORDER);

    if (empty($valueMatches)) {
        die("❌ No values found\n");
    }

    echo "Found " . count($valueMatches) . " records\n";

    // Truncate table
    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    DB::table('major_subjects')->truncate();
    DB::statement('SET FOREIGN_KEY_CHECKS=1');
    echo "✅ Truncated table\n";

    // Insert in chunks
    $data = [];
    foreach ($valueMatches as $match) {
        $data[] = [
            'id' => (int)$match[1],
            'major_id' => (int)$match[2],
            'subject_id' => (int)$match[3],
            'created_at' => $match[4],
            'updated_at' => $match[5],
            'deleted_at' => $match[6] === 'NULL' ? null : trim($match[6], "'"),
        ];
    }

    // Insert in chunks of 100
    $chunks = array_chunk($data, 100);
    $inserted = 0;

    foreach ($chunks as $chunk) {
        DB::table('major_subjects')->insert($chunk);
        $inserted += count($chunk);
        echo "  Inserted $inserted / " . count($data) . " records\r";
    }

    echo "\n✅ Successfully imported " . count($data) . " records\n";

    // Verify
    $count = DB::table('major_subjects')->count();
    echo "✅ Verification: $count records in database\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
