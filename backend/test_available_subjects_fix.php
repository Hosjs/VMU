<?php
/**
 * Test available-subjects API fix
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "═══════════════════════════════════════════════════\n";
echo "  Testing available-subjects API Fix\n";
echo "═══════════════════════════════════════════════════\n\n";

try {
    // Test Case 1: semester_code = 2025.1
    echo "TEST 1: Get subjects for 2025.1\n";
    echo "────────────────────────────────\n";

    $request1 = new \Illuminate\Http\Request([
        'semester_code' => '2025.1'
    ]);

    $controller = new \App\Http\Controllers\Api\LecturerPaymentController();
    $response1 = $controller->getAvailableSubjects($request1);
    $data1 = json_decode($response1->getContent(), true);

    echo "Semester: 2025.1\n";
    echo "Success: " . ($data1['success'] ? 'YES' : 'NO') . "\n";
    echo "Count: " . (isset($data1['data']) ? count($data1['data']) : 0) . "\n";

    if (isset($data1['data']) && count($data1['data']) > 0) {
        echo "\n✅ FOUND SUBJECTS!\n";
        echo "First 5 subjects:\n";
        foreach (array_slice($data1['data'], 0, 5) as $idx => $subject) {
            echo "  " . ($idx + 1) . ". {$subject['label']}\n";
        }
    } else {
        echo "\n❌ NO SUBJECTS FOUND\n";
        echo "This might mean:\n";
        echo "  - No teaching_assignments in database\n";
        echo "  - No course_code/course_name in assignments\n";
    }

    // Test Case 2: semester_code = 2024.2
    echo "\n\nTEST 2: Get subjects for 2024.2\n";
    echo "────────────────────────────────\n";

    $request2 = new \Illuminate\Http\Request([
        'semester_code' => '2024.2'
    ]);

    $response2 = $controller->getAvailableSubjects($request2);
    $data2 = json_decode($response2->getContent(), true);

    echo "Semester: 2024.2\n";
    echo "Success: " . ($data2['success'] ? 'YES' : 'NO') . "\n";
    echo "Count: " . (isset($data2['data']) ? count($data2['data']) : 0) . "\n";

    if (isset($data2['data']) && count($data2['data']) > 0) {
        echo "\n✅ FOUND SUBJECTS!\n";
        echo "First 5 subjects:\n";
        foreach (array_slice($data2['data'], 0, 5) as $idx => $subject) {
            echo "  " . ($idx + 1) . ". {$subject['label']}\n";
        }
    }

    // Compare with teaching assignments
    echo "\n\nVERIFICATION: Check teaching_assignments\n";
    echo "────────────────────────────────\n";

    $totalAssignments = \DB::table('teaching_assignments')->count();
    echo "Total teaching assignments: {$totalAssignments}\n";

    $withSubjects = \DB::table('teaching_assignments')
        ->whereNotNull('course_code')
        ->whereNotNull('course_name')
        ->where('course_code', '!=', '')
        ->where('course_name', '!=', '')
        ->count();
    echo "With course info: {$withSubjects}\n";

    $distinctSubjects = \DB::table('teaching_assignments')
        ->select('course_code', 'course_name')
        ->whereNotNull('course_code')
        ->whereNotNull('course_name')
        ->where('course_code', '!=', '')
        ->where('course_name', '!=', '')
        ->distinct()
        ->get();
    echo "Distinct subjects: " . $distinctSubjects->count() . "\n";

    if ($distinctSubjects->count() > 0) {
        echo "\nSample subjects in database:\n";
        foreach ($distinctSubjects->take(5) as $idx => $subject) {
            echo "  " . ($idx + 1) . ". {$subject->course_code} - {$subject->course_name}\n";
        }
    }

    echo "\n═══════════════════════════════════════════════════\n";
    echo "  TEST COMPLETE\n";
    echo "═══════════════════════════════════════════════════\n";

    // Summary
    echo "\n📊 SUMMARY:\n";
    if (isset($data1['data']) && count($data1['data']) > 0) {
        echo "✅ available-subjects API NOW WORKS!\n";
        echo "   Returns subjects from teaching_assignments\n";
    } else if ($totalAssignments === 0) {
        echo "⚠️  No teaching_assignments in database\n";
        echo "   Need to import data first\n";
    } else if ($withSubjects === 0) {
        echo "⚠️  Teaching assignments exist but no course_code/course_name\n";
        echo "   Need to populate course information\n";
    } else {
        echo "❌ API still not working\n";
        echo "   Check logs for errors\n";
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

