<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DIAGNOSTIC: Teaching Assignments Auto-Fill Issue ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n\n";

try {
    // 1. Check database connection
    echo "1. DATABASE CONNECTION\n";
    echo "   Database: " . env('DB_DATABASE') . "\n";
    echo "   Connection: " . env('DB_CONNECTION') . "\n\n";

    // 2. Check teaching_assignments table
    echo "2. TEACHING ASSIGNMENTS TABLE\n";
    $taCount = DB::table('teaching_assignments')->count();
    echo "   Total records: {$taCount}\n";

    if ($taCount > 0) {
        // Check with lecturer_id
        $withLecturer = DB::table('teaching_assignments')
            ->whereNotNull('lecturer_id')
            ->count();
        echo "   With lecturer_id: {$withLecturer}\n";

        // Check with lop_id
        $withLop = DB::table('teaching_assignments')
            ->whereNotNull('lop_id')
            ->count();
        echo "   With lop_id: {$withLop}\n";

        // List unique lecturer IDs
        $lecturerIds = DB::table('teaching_assignments')
            ->select('lecturer_id')
            ->distinct()
            ->whereNotNull('lecturer_id')
            ->pluck('lecturer_id')
            ->toArray();
        echo "   Unique lecturers: " . count($lecturerIds) . "\n";
        echo "   Lecturer IDs: " . implode(', ', array_slice($lecturerIds, 0, 10)) . (count($lecturerIds) > 10 ? '...' : '') . "\n\n";

        // Show sample records
        echo "3. SAMPLE TEACHING ASSIGNMENTS\n";
        $samples = DB::table('teaching_assignments')
            ->limit(3)
            ->get();

        foreach ($samples as $idx => $record) {
            echo "   Record #" . ($idx + 1) . ":\n";
            echo "     ID: {$record->id}\n";
            echo "     Lecturer ID: " . ($record->lecturer_id ?? 'NULL') . "\n";
            echo "     Lop ID: " . ($record->lop_id ?? 'NULL') . "\n";
            echo "     Course: " . ($record->course_code ?? 'N/A') . " - " . ($record->course_name ?? 'N/A') . "\n";
            echo "     Class: " . ($record->class_name ?? 'N/A') . "\n";
            echo "     Dates: " . ($record->start_date ?? 'N/A') . " to " . ($record->end_date ?? 'N/A') . "\n\n";
        }

        // 4. Check classes table relationship
        echo "4. CLASSES TABLE (khoaHoc_id)\n";
        $classesCount = DB::table('classes')->count();
        echo "   Total classes: {$classesCount}\n";

        $withKhoaHoc = DB::table('classes')
            ->whereNotNull('khoaHoc_id')
            ->count();
        echo "   With khoaHoc_id: {$withKhoaHoc}\n";

        if ($withKhoaHoc > 0) {
            $years = DB::table('classes')
                ->select('khoaHoc_id', DB::raw('COUNT(*) as count'))
                ->whereNotNull('khoaHoc_id')
                ->groupBy('khoaHoc_id')
                ->orderBy('khoaHoc_id', 'desc')
                ->get();

            echo "   Years in classes:\n";
            foreach ($years as $year) {
                echo "     Year {$year->khoaHoc_id}: {$year->count} classes\n";
            }
            echo "\n";
        }

        // 5. Check JOIN between teaching_assignments and classes
        echo "5. TEACHING ASSIGNMENTS WITH CLASS YEARS\n";
        $joined = DB::table('teaching_assignments')
            ->join('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
            ->select('classes.khoaHoc_id', DB::raw('COUNT(*) as count'))
            ->groupBy('classes.khoaHoc_id')
            ->orderBy('classes.khoaHoc_id', 'desc')
            ->get();

        if ($joined->count() > 0) {
            echo "   Assignments by year:\n";
            foreach ($joined as $row) {
                echo "     Year {$row->khoaHoc_id}: {$row->count} assignments\n";
            }
        } else {
            echo "   ⚠️  NO JOINED RESULTS - teaching_assignments.lop_id may not match classes.id\n";
        }
        echo "\n";

        // 6. Test specific lecturer and semester
        echo "6. TEST SPECIFIC QUERY (Example)\n";
        $testLecturerId = $lecturerIds[0] ?? null;
        $testSemesterCode = "2024.1";
        $testYear = 2024;

        if ($testLecturerId) {
            echo "   Testing with:\n";
            echo "     Lecturer ID: {$testLecturerId}\n";
            echo "     Semester: {$testSemesterCode}\n";
            echo "     Year: {$testYear}\n\n";

            // Query without year filter
            $allAssignments = DB::table('teaching_assignments')
                ->where('lecturer_id', $testLecturerId)
                ->count();
            echo "   Assignments for lecturer (no filter): {$allAssignments}\n";

            // Query with year filter (using JOIN)
            $yearFiltered = DB::table('teaching_assignments')
                ->join('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
                ->where('teaching_assignments.lecturer_id', $testLecturerId)
                ->where('classes.khoaHoc_id', $testYear)
                ->count();
            echo "   Assignments for lecturer (year {$testYear}): {$yearFiltered}\n\n";

            if ($yearFiltered === 0 && $allAssignments > 0) {
                echo "   ⚠️  ISSUE FOUND: Lecturer has assignments but none match year {$testYear}\n";
                echo "   This means either:\n";
                echo "   - teaching_assignments.lop_id is NULL\n";
                echo "   - classes.khoaHoc_id doesn't match {$testYear}\n";
                echo "   - JOIN is not working\n\n";

                // Check what years this lecturer has
                $lecturerYears = DB::table('teaching_assignments')
                    ->leftJoin('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
                    ->where('teaching_assignments.lecturer_id', $testLecturerId)
                    ->select('classes.khoaHoc_id', DB::raw('COUNT(*) as count'))
                    ->groupBy('classes.khoaHoc_id')
                    ->get();

                echo "   Years for this lecturer:\n";
                foreach ($lecturerYears as $ly) {
                    $yearLabel = $ly->khoaHoc_id ?? 'NULL';
                    echo "     Year {$yearLabel}: {$ly->count} assignments\n";
                }
            }
        }

    } else {
        echo "   ⚠️  TABLE IS EMPTY - No teaching assignments in database!\n";
        echo "   This is the root cause. Need to import teaching assignments.\n";
    }

    echo "\n=== DIAGNOSTIC COMPLETE ===\n";
    echo "\n🔍 RECOMMENDATIONS:\n";

    if ($taCount === 0) {
        echo "1. ❌ CRITICAL: teaching_assignments table is empty\n";
        echo "   → Import teaching assignments from source system\n";
        echo "   → Check if there's an import script in the backend/ folder\n";
    } else if ($withLecturer === 0) {
        echo "1. ❌ CRITICAL: No assignments have lecturer_id\n";
        echo "   → Update teaching_assignments to set proper lecturer_id\n";
    } else if ($joined->count() === 0 && $withLop > 0) {
        echo "1. ❌ ISSUE: teaching_assignments.lop_id doesn't match any classes.id\n";
        echo "   → Check foreign key relationship\n";
        echo "   → Verify data integrity\n";
    } else {
        echo "1. ✅ Data structure looks good\n";
        echo "   → Check if semester_code and year mapping is correct\n";
        echo "   → Verify the frontend is sending correct lecturer_id and semester_code\n";
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

