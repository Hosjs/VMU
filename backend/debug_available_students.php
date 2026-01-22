<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 Debugging available-students issue...\n\n";

// Get major info
$major = DB::table('majors')->where('id', 4)->first();
echo "Major ID 4:\n";
echo "  - maNganh: {$major->maNganh}\n";
echo "  - tenNganh: {$major->tenNganh}\n\n";

// Count students with this maNganh
$totalStudents = DB::table('students')
    ->where('maNganh', $major->maNganh)
    ->where('trangThai', 'DangHoc')
    ->count();
echo "Total CNTT students (maNganh={$major->maNganh}, trangThai=DangHoc): {$totalStudents}\n\n";

// Sample students
$students = DB::table('students')
    ->where('maNganh', $major->maNganh)
    ->where('trangThai', 'DangHoc')
    ->limit(5)
    ->get();

echo "Sample students:\n";
foreach ($students as $s) {
    echo "  - {$s->maHV}: {$s->hoDem} {$s->ten} (maNganh: {$s->maNganh})\n";
}

// Check enrollments for subject 20
echo "\n📚 Subject enrollments:\n";
$enrolled = DB::table('subject_enrollments')
    ->where('subject_id', 20)
    ->where('namHoc', 2026)
    ->count();
echo "  - Already enrolled in subject 20, year 2026: {$enrolled}\n";

// Available students (not enrolled)
$enrolledIds = DB::table('subject_enrollments')
    ->where('subject_id', 20)
    ->where('namHoc', 2026)
    ->pluck('maHV')
    ->toArray();

$available = DB::table('students')
    ->where('maNganh', $major->maNganh)
    ->where('trangThai', 'DangHoc')
    ->whereNotIn('maHV', $enrolledIds)
    ->count();

echo "  - Available students (not enrolled): {$available}\n";
