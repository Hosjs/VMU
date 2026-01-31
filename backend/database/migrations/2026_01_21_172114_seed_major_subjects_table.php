<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Import dữ liệu major_subjects từ file SQL
     */
    public function up(): void
    {
        echo "💾 Importing major_subjects data...\n";

        // Delete all existing data (better than truncate for constraints)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('major_subjects')->delete();
        DB::statement('ALTER TABLE major_subjects AUTO_INCREMENT = 1');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        echo "✅ Cleared major_subjects table\n";

        // Path to SQL file
        $sqlFile = base_path('../frontend/app/routes/sql/major_subjects.sql');

        if (!file_exists($sqlFile)) {
            echo "❌ SQL file not found: {$sqlFile}\n";
            throw new Exception("SQL file not found");
        }

        echo "📖 Reading SQL file...\n";

        // Read SQL file
        $sql = file_get_contents($sqlFile);

        // Extract INSERT VALUES (skip CREATE TABLE)
        if (preg_match('/INSERT INTO `major_subjects`.*?VALUES\s*(.+);/s', $sql, $matches)) {
            try {
                echo "⚡ Parsing data...\n";

                // Parse individual records
                $valuesBlock = $matches[1];
                preg_match_all('/\((\d+),\s*(\d+),\s*(\d+),\s*\'([^\']+)\',\s*\'([^\']+)\',\s*(NULL|\'[^\']*\')\)/', $valuesBlock, $records, PREG_SET_ORDER);

                echo "📦 Found " . count($records) . " records\n";

                // Build data array and remove duplicates
                $data = [];
                $seen = [];
                $duplicates = 0;

                foreach ($records as $match) {
                    $major_id = (int)$match[2];
                    $subject_id = (int)$match[3];
                    $key = "{$major_id}-{$subject_id}";

                    // Skip duplicates
                    if (isset($seen[$key])) {
                        $duplicates++;
                        continue;
                    }

                    $seen[$key] = true;
                    $data[] = [
                        'major_id' => $major_id,
                        'subject_id' => $subject_id,
                        'created_at' => $match[4],
                        'updated_at' => $match[5],
                        'deleted_at' => $match[6] === 'NULL' ? null : trim($match[6], "'"),
                    ];
                }

                echo "⚠️  Removed {$duplicates} duplicate records\n";
                echo "💾 Inserting " . count($data) . " unique records...\n";

                // Insert in chunks
                $chunks = array_chunk($data, 100);
                $inserted = 0;

                DB::statement('SET FOREIGN_KEY_CHECKS=0');

                foreach ($chunks as $chunk) {
                    DB::table('major_subjects')->insert($chunk);
                    $inserted += count($chunk);
                    echo "\r  Progress: {$inserted} / " . count($data);
                }

                DB::statement('SET FOREIGN_KEY_CHECKS=1');

                echo "\n✅ Successfully imported {$inserted} records into major_subjects\n";

                // Show sample data
                echo "\n📋 Sample data:\n";
                $samples = DB::table('major_subjects as ms')
                    ->join('majors as m', 'ms.major_id', '=', 'm.id')
                    ->join('subjects as s', 'ms.subject_id', '=', 's.id')
                    ->select('m.tenNganh', 's.tenMon')
                    ->limit(3)
                    ->get();

                foreach ($samples as $sample) {
                    echo "  ✓ {$sample->tenNganh} → {$sample->tenMon}\n";
                }

            } catch (\Exception $e) {
                echo "❌ Error importing data: " . $e->getMessage() . "\n";
                throw $e;
            }
        } else {
            echo "❌ Could not find INSERT statement in SQL file\n";
            throw new Exception("Could not parse SQL file");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "🗑️  Clearing major_subjects table...\n";

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('major_subjects')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        echo "✅ Cleared major_subjects table\n";
    }
};
