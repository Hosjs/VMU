<?php

/**
 * Test script for Auto-Fill API endpoints
 * Run from command line: php test_autofill_api.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

echo "=== Testing Auto-Fill API Endpoints ===\n\n";

// Test 1: Get Available Semesters
echo "1. Testing getAvailableSemesters...\n";
try {
    $controller = new \App\Http\Controllers\Api\LecturerPaymentController();
    $request = new \Illuminate\Http\Request();

    $response = $controller->getAvailableSemesters($request);
    $data = json_decode($response->getContent(), true);

    if ($data['success']) {
        echo "   ✅ SUCCESS: Found " . count($data['data']) . " semesters\n";
        echo "   Sample semesters: " . json_encode(array_slice($data['data'], 0, 3)) . "\n";
    } else {
        echo "   ❌ FAILED: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} catch (\Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";

// Test 2: Get Teaching Assignments for Auto-Fill
echo "2. Testing getTeachingAssignmentsForAutoFill...\n";
try {
    $controller = new \App\Http\Controllers\Api\LecturerPaymentController();

    // Get a lecturer from database
    $lecturer = \App\Models\Lecturer::first();

    if (!$lecturer) {
        echo "   ⚠️  WARNING: No lecturers found in database. Skipping test.\n";
    } else {
        echo "   Using lecturer: {$lecturer->hoTen} (ID: {$lecturer->id})\n";

        $request = new \Illuminate\Http\Request([
            'lecturer_id' => $lecturer->id,
            'semester_code' => '2024.1'
        ]);

        $response = $controller->getTeachingAssignmentsForAutoFill($request);
        $data = json_decode($response->getContent(), true);

        if ($data['success']) {
            echo "   ✅ SUCCESS: Found " . count($data['data']) . " teaching assignments\n";
            if (count($data['data']) > 0) {
                $sample = $data['data'][0];
                echo "   Sample assignment:\n";
                echo "     - Subject: {$sample['subject_code']} - {$sample['subject_name']}\n";
                echo "     - Class: {$sample['class_name']}\n";
                echo "     - Students: {$sample['student_count']}\n";
                echo "     - Sessions: {$sample['total_sessions']}\n";
            }
        } else {
            echo "   ❌ FAILED: " . ($data['message'] ?? 'Unknown error') . "\n";
        }
    }
} catch (\Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    echo "   Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";

// Test 3: Check database tables
echo "3. Checking database structure...\n";
try {
    $classesCount = DB::table('classes')->count();
    $assignmentsCount = DB::table('teaching_assignments')->count();
    $paymentsCount = DB::table('lecturer_payments')->count();

    echo "   ✅ Tables exist:\n";
    echo "     - classes: {$classesCount} records\n";
    echo "     - teaching_assignments: {$assignmentsCount} records\n";
    echo "     - lecturer_payments: {$paymentsCount} records\n";

    // Check if classes have khoaHoc_id
    $classWithKhoaHoc = DB::table('classes')->whereNotNull('khoaHoc_id')->first();
    if ($classWithKhoaHoc) {
        echo "   ✅ Sample class has khoaHoc_id: {$classWithKhoaHoc->khoaHoc_id}\n";
    } else {
        echo "   ⚠️  WARNING: No classes with khoaHoc_id found\n";
    }

} catch (\Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";

