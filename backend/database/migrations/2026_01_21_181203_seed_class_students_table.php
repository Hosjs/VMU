<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Import dữ liệu class_students từ file SQL
     */
    public function up(): void
    {
        echo "💾 Importing class_students data...\n";

        // Delete all existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('class_students')->delete();
        DB::statement('ALTER TABLE class_students AUTO_INCREMENT = 1');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        echo "✅ Cleared class_students table\n";

        // Path to SQL file
        $sqlFile = base_path('../frontend/app/routes/sql/class_students.sql');

        if (!file_exists($sqlFile)) {
            echo "❌ SQL file not found: {$sqlFile}\n";
            throw new Exception("SQL file not found");
        }

        echo "📖 Reading SQL file...\n";

        // Step 1: Import existing data from SQL file if exists
        $existingData = [];
        $sql = file_get_contents($sqlFile);

        if (preg_match('/INSERT INTO `class_students`.*?VALUES\s*(.+);/s', $sql, $matches)) {
            echo "📖 Found existing SQL data...\n";
            $valuesBlock = $matches[1];
            preg_match_all('/\((\d+),\s*(\d+),\s*\'([^\']+)\',\s*\'([^\']+)\',\s*\'([^\']+)\',\s*(NULL|\'[^\']*\')\)/', $valuesBlock, $records, PREG_SET_ORDER);

            foreach ($records as $match) {
                $class_id = (int)$match[2];
                $student_id = $match[3];
                $key = "{$class_id}-{$student_id}";
                $existingData[$key] = true;
            }
            echo "✅ Loaded " . count($existingData) . " existing records\n";
        }

        // Step 2: Auto-generate missing student-class assignments
        echo "🔄 Auto-generating student-class assignments...\n";

        $data = [];
        $seen = $existingData;

        // Get all classes with their major info
        $classes = DB::table('classes as c')
            ->join('majors as m', 'c.major_id', '=', 'm.id')
            ->select('c.id as class_id', 'c.class_name', 'c.major_id', 'm.maNganh', 'm.tenNganh')
            ->whereNull('c.deleted_at')
            ->get();

        echo "📚 Found " . count($classes) . " classes\n";

        $totalAdded = 0;

        foreach ($classes as $class) {
            // ✅ FIX: Get students by matching maNganh (string) instead of major_id (integer)
            $students = DB::table('students')
                ->where('maNganh', $class->maNganh)  // Match with majors.maNganh
                ->whereNull('deleted_at')
                ->where('trangThai', 'DangHoc')
                ->get();

            $addedToClass = 0;

            foreach ($students as $student) {
                $key = "{$class->class_id}-{$student->maHV}";

                // Skip if already exists
                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $data[] = [
                    'class_id' => $class->class_id,
                    'student_id' => $student->maHV,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'deleted_at' => null,
                ];

                $addedToClass++;
                $totalAdded++;
            }

            if ($addedToClass > 0) {
                echo "  ✓ {$class->class_name} ({$class->tenNganh}): +{$addedToClass} students\n";
            }
        }

        echo "\n📊 Summary:\n";
        echo "  - Existing records: " . count($existingData) . "\n";
        echo "  - New records generated: {$totalAdded}\n";
        echo "  - Total records to insert: " . count($data) . "\n";

        if (count($data) > 0) {
            echo "\n💾 Inserting records...\n";

            // Insert in chunks
            $chunks = array_chunk($data, 100);
            $inserted = 0;

            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            foreach ($chunks as $chunk) {
                DB::table('class_students')->insert($chunk);
                $inserted += count($chunk);
                echo "\r  Progress: {$inserted} / " . count($data);
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1');

            echo "\n✅ Successfully imported {$inserted} records into class_students\n";
        } else {
            echo "⚠️  No new records to insert\n";
        }

        // Show sample data
        echo "\n📋 Sample data:\n";
        $samples = DB::table('class_students as cs')
            ->join('classes as c', 'cs.class_id', '=', 'c.id')
            ->join('students as s', 'cs.student_id', '=', 's.maHV')
            ->join('majors as m', 'c.major_id', '=', 'm.id')
            ->select('c.class_name', 'm.tenNganh', 's.maHV', 's.hoDem', 's.ten')
            ->limit(5)
            ->get();

        foreach ($samples as $sample) {
            echo "  ✓ {$sample->class_name} ({$sample->tenNganh}) → {$sample->maHV} ({$sample->hoDem} {$sample->ten})\n";
        }

        // Show statistics by major
        echo "\n📊 Statistics by major:\n";
        $stats = DB::table('class_students as cs')
            ->join('classes as c', 'cs.class_id', '=', 'c.id')
            ->join('majors as m', 'c.major_id', '=', 'm.id')
            ->select('m.tenNganh', DB::raw('COUNT(*) as total'))
            ->groupBy('m.id', 'm.tenNganh')
            ->orderBy('total', 'desc')
            ->get();

        foreach ($stats as $stat) {
            echo "  - {$stat->tenNganh}: {$stat->total} enrollments\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "🗑️  Clearing class_students table...\n";

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::table('class_students')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        echo "✅ Cleared class_students table\n";
    }
};
