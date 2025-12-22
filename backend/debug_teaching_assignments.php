<?php

/**
 * Debug script to check teaching assignments data
 * Run: php debug_teaching_assignments.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Debugging Teaching Assignments Data ===\n\n";

// 1. Check total teaching assignments
$totalAssignments = DB::table('teaching_assignments')->count();
echo "1. Total teaching assignments: {$totalAssignments}\n\n";

if ($totalAssignments === 0) {
    echo "⚠️  WARNING: No teaching assignments found in database!\n";
    echo "   You need to create some teaching assignments first.\n\n";
} else {
    // 2. Check assignments with lecturers
    $withLecturer = DB::table('teaching_assignments')
        ->whereNotNull('lecturer_id')
        ->count();
    echo "2. Assignments with lecturer: {$withLecturer}\n\n";

    // 3. Check assignments with classes (lop_id)
    $withClass = DB::table('teaching_assignments')
        ->whereNotNull('lop_id')
        ->count();
    echo "3. Assignments with class (lop_id): {$withClass}\n\n";

    // 4. Sample teaching assignments
    echo "4. Sample teaching assignments:\n";
    $samples = DB::table('teaching_assignments')
        ->select('id', 'lecturer_id', 'lop_id', 'course_code', 'course_name', 'class_name', 'start_date', 'end_date')
        ->limit(5)
        ->get();

    foreach ($samples as $sample) {
        echo "   - ID: {$sample->id}\n";
        echo "     Lecturer ID: " . ($sample->lecturer_id ?? 'NULL') . "\n";
        echo "     Lop ID: " . ($sample->lop_id ?? 'NULL') . "\n";
        echo "     Course: {$sample->course_code} - {$sample->course_name}\n";
        echo "     Class: {$sample->class_name}\n";
        echo "     Dates: {$sample->start_date} to {$sample->end_date}\n";
        echo "\n";
    }

    // 5. Check classes data
    echo "5. Classes (lop) data:\n";
    $totalClasses = DB::table('classes')->count();
    echo "   Total classes: {$totalClasses}\n";

    $classesWithYear = DB::table('classes')
        ->whereNotNull('khoaHoc_id')
        ->count();
    echo "   Classes with khoaHoc_id: {$classesWithYear}\n\n";

    if ($classesWithYear > 0) {
        echo "   Sample classes with years:\n";
        $sampleClasses = DB::table('classes')
            ->select('id', 'class_name', 'khoaHoc_id')
            ->whereNotNull('khoaHoc_id')
            ->limit(5)
            ->get();

        foreach ($sampleClasses as $class) {
            echo "     - ID: {$class->id}, Name: {$class->class_name}, Year: {$class->khoaHoc_id}\n";
        }
        echo "\n";
    }

    // 6. Check assignments joined with classes
    echo "6. Teaching assignments WITH matching classes:\n";
    $joined = DB::table('teaching_assignments')
        ->join('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
        ->select(
            'teaching_assignments.id',
            'teaching_assignments.lecturer_id',
            'teaching_assignments.course_code',
            'teaching_assignments.course_name',
            'classes.class_name',
            'classes.khoaHoc_id'
        )
        ->limit(5)
        ->get();

    if ($joined->count() > 0) {
        foreach ($joined as $item) {
            echo "   - Assignment ID: {$item->id}\n";
            echo "     Lecturer: {$item->lecturer_id}\n";
            echo "     Course: {$item->course_code} - {$item->course_name}\n";
            echo "     Class: {$item->class_name} (Year: {$item->khoaHoc_id})\n";
            echo "\n";
        }
    } else {
        echo "   ⚠️  No assignments with matching classes found!\n";
        echo "   This means lop_id in teaching_assignments doesn't match any class ID.\n\n";
    }

    // 7. Check lecturers
    echo "7. Lecturers data:\n";
    $totalLecturers = DB::table('lecturers')->count();
    echo "   Total lecturers: {$totalLecturers}\n\n";

    if ($totalLecturers > 0) {
        echo "   Sample lecturers:\n";
        $sampleLecturers = DB::table('lecturers')
            ->select('id', 'hoTen', 'maSo')
            ->limit(5)
            ->get();

        foreach ($sampleLecturers as $lecturer) {
            echo "     - ID: {$lecturer->id}, Name: {$lecturer->hoTen}, Code: {$lecturer->maSo}\n";
        }
        echo "\n";
    }

    // 8. Test query for specific lecturer and year
    if ($totalLecturers > 0) {
        $testLecturer = DB::table('lecturers')->first();
        $testYear = 2024;

        echo "8. Test query for Lecturer ID {$testLecturer->id}, Year {$testYear}:\n";

        $testResults = DB::table('teaching_assignments')
            ->leftJoin('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
            ->where('teaching_assignments.lecturer_id', $testLecturer->id)
            ->where(function($query) use ($testYear) {
                $query->where('classes.khoaHoc_id', $testYear)
                      ->orWhereNull('teaching_assignments.lop_id');
            })
            ->select(
                'teaching_assignments.*',
                'classes.khoaHoc_id',
                'classes.class_name as lop_name'
            )
            ->get();

        echo "   Results: " . $testResults->count() . " assignments\n";

        if ($testResults->count() > 0) {
            foreach ($testResults as $result) {
                echo "     - {$result->course_code}: {$result->course_name}\n";
            }
        } else {
            echo "     ⚠️  No results! Try different lecturer or year.\n";
        }
    }
}

echo "\n=== Debug Complete ===\n";

