<?php
/**
 * Script để import môn học từ API bên ngoài vào database
 *
 * Cách chạy:
 * php import_subjects_from_training_api.php
 *
 * Script này sẽ:
 * 1. Lấy danh sách tất cả các ngành từ database
 * 2. Với mỗi ngành, gọi API bên ngoài để lấy danh sách môn học
 * 3. Insert/Update vào bảng `subjects`
 * 4. Insert vào bảng `major_subjects` để link ngành với môn học
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Constants
const API_BASE_URL = 'http://203.162.246.113:8088/KeHoachDaoTao';
const EDUCATION_TYPES = [
    'thac-sy' => 'ThacSy',
    'tien-sy' => 'TienSy'
];

// Statistics
$stats = [
    'majors_processed' => 0,
    'subjects_created' => 0,
    'subjects_updated' => 0,
    'relations_created' => 0,
    'errors' => 0,
];

echo "🚀 Starting import from Training API...\n\n";

// Get all majors from database
$majors = DB::table('majors')->get();
echo "📚 Found " . count($majors) . " majors in database\n\n";

foreach ($majors as $major) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📖 Processing: {$major->tenNganh} ({$major->maNganh})\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $stats['majors_processed']++;

    // Determine education type based on maNganh
    $educationType = 'thac-sy';
    if (substr($major->maNganh, 0, 1) === '9' || substr($major->maNganh, 0, 1) === '6') {
        $educationType = 'tien-sy';
    }

    echo "   Education Type: " . strtoupper($educationType) . "\n";

    // Try multiple years to find data
    $currentYear = date('Y');
    $yearsToTry = [
        $currentYear - 1,
        $currentYear - 2,
        $currentYear - 3,
        2024,
        2023,
        2022
    ];

    $courses = [];
    $foundYear = null;

    foreach ($yearsToTry as $year) {
        try {
            echo "   Trying year: {$year}... ";

            $apiType = EDUCATION_TYPES[$educationType];
            $url = sprintf(
                '%s/%s?NamVao=%d&MaNganh=%s',
                API_BASE_URL,
                $apiType,
                $year,
                $major->maNganh
            );

            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'ignore_errors' => true
                ]
            ]);

            $response = @file_get_contents($url, false, $context);

            if ($response === false) {
                echo "❌ Failed\n";
                continue;
            }

            $data = json_decode($response, true);

            if (is_array($data) && count($data) > 0) {
                $courses = $data;
                $foundYear = $year;
                echo "✅ Found " . count($courses) . " courses\n";
                break;
            } else {
                echo "⚠️  No data\n";
            }
        } catch (Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
            continue;
        }
    }

    // If still no data for Tien-sy, try fallback to Thac-sy
    if (empty($courses) && $educationType === 'tien-sy' && substr($major->maNganh, 0, 1) === '9') {
        $masterMaNganh = '8' . substr($major->maNganh, 1);
        echo "   🔄 Fallback: Trying Thac-sy with code {$masterMaNganh}\n";

        foreach ($yearsToTry as $year) {
            try {
                echo "   Trying year: {$year}... ";

                $url = sprintf(
                    '%s/ThacSy?NamVao=%d&MaNganh=%s',
                    API_BASE_URL,
                    $year,
                    $masterMaNganh
                );

                $context = stream_context_create([
                    'http' => [
                        'timeout' => 10,
                        'ignore_errors' => true
                    ]
                ]);

                $response = @file_get_contents($url, false, $context);

                if ($response === false) {
                    echo "❌ Failed\n";
                    continue;
                }

                $data = json_decode($response, true);

                if (is_array($data) && count($data) > 0) {
                    $courses = $data;
                    $foundYear = $year;
                    echo "✅ Found " . count($courses) . " courses (from Thac-sy)\n";
                    break;
                } else {
                    echo "⚠️  No data\n";
                }
            } catch (Exception $e) {
                echo "❌ Error: " . $e->getMessage() . "\n";
                continue;
            }
        }
    }

    if (empty($courses)) {
        echo "   ⚠️  WARNING: No courses found for this major\n\n";
        $stats['errors']++;
        continue;
    }

    echo "   📦 Processing " . count($courses) . " courses (Year: {$foundYear})...\n";

    // Process each course
    foreach ($courses as $course) {
        try {
            // Generate course code from hocPhanSo and hocPhanChu
            $maMon = '';
            if (!empty($course['hocPhanChu'])) {
                $maMon = trim($course['hocPhanSo'] . ' ' . $course['hocPhanChu']);
            } else {
                $maMon = (string)$course['hocPhanSo'];
            }

            $tenMon = $course['tenMon'] ?? '';
            $soTinChi = $course['soTinChi'] ?? 0;

            if (empty($maMon) || empty($tenMon)) {
                echo "      ⚠️  Skipped invalid course (no code or name)\n";
                continue;
            }

            // Check if subject exists
            $existingSubject = DB::table('subjects')
                ->where('maMon', $maMon)
                ->first();

            if ($existingSubject) {
                // Update if needed
                if ($existingSubject->tenMon !== $tenMon || $existingSubject->soTinChi != $soTinChi) {
                    DB::table('subjects')
                        ->where('id', $existingSubject->id)
                        ->update([
                            'tenMon' => $tenMon,
                            'soTinChi' => $soTinChi,
                            'updated_at' => now(),
                        ]);
                    echo "      🔄 Updated: {$maMon} - {$tenMon}\n";
                    $stats['subjects_updated']++;
                }
                $subjectId = $existingSubject->id;
            } else {
                // Create new subject
                $subjectId = DB::table('subjects')->insertGetId([
                    'maMon' => $maMon,
                    'tenMon' => $tenMon,
                    'soTinChi' => $soTinChi,
                    'moTa' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                echo "      ✅ Created: {$maMon} - {$tenMon}\n";
                $stats['subjects_created']++;
            }

            // Link major with subject (check if relation exists)
            $existingRelation = DB::table('major_subjects')
                ->where('major_id', $major->id)
                ->where('subject_id', $subjectId)
                ->first();

            if (!$existingRelation) {
                DB::table('major_subjects')->insert([
                    'major_id' => $major->id,
                    'subject_id' => $subjectId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $stats['relations_created']++;
            }

        } catch (Exception $e) {
            echo "      ❌ Error processing course: " . $e->getMessage() . "\n";
            $stats['errors']++;
        }
    }

    echo "   ✅ Completed: {$major->tenNganh}\n\n";

    // Sleep to avoid overwhelming the API
    sleep(1);
}

echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📊 IMPORT STATISTICS\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Majors processed:      {$stats['majors_processed']}\n";
echo "Subjects created:      {$stats['subjects_created']}\n";
echo "Subjects updated:      {$stats['subjects_updated']}\n";
echo "Relations created:     {$stats['relations_created']}\n";
echo "Errors:                {$stats['errors']}\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Show sample data
echo "📋 SAMPLE DATA FROM major_subjects:\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$samples = DB::table('major_subjects as ms')
    ->join('majors as m', 'ms.major_id', '=', 'm.id')
    ->join('subjects as s', 'ms.subject_id', '=', 's.id')
    ->select('m.maNganh', 'm.tenNganh', 's.maMon', 's.tenMon', 's.soTinChi')
    ->limit(10)
    ->get();

foreach ($samples as $sample) {
    echo sprintf(
        "[%s] %s | %s - %s (%d TC)\n",
        $sample->maNganh,
        $sample->tenNganh,
        $sample->maMon,
        $sample->tenMon,
        $sample->soTinChi
    );
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Import completed successfully!\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
