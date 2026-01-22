<?php
/**
 * Check for Finance subjects in CNTT major
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Kiểm tra môn học của ngành CNTT (major_id = 4)\n\n";

// Get CNTT major info
$cntt = DB::table('majors')->where('id', 4)->first();
if ($cntt) {
    echo "Ngành: {$cntt->tenNganh} ({$cntt->maNganh})\n\n";
}

// Get all subjects for CNTT
$subjects = DB::table('major_subjects as ms')
    ->join('subjects as s', 'ms.subject_id', '=', 's.id')
    ->where('ms.major_id', 4)
    ->select('ms.id as relation_id', 's.id as subject_id', 's.maMon', 's.tenMon', 's.soTinChi')
    ->orderBy('s.tenMon')
    ->get();

echo "Tổng số môn: " . count($subjects) . "\n\n";

// Find Finance-related subjects
$financeKeywords = ['tài chính', 'kế toán', 'định giá', 'ngân hàng', 'đầu tư', 'rủi ro'];
$financeSubjects = [];

foreach ($subjects as $s) {
    $isTaiChinh = false;

    // Check by subject name
    foreach ($financeKeywords as $keyword) {
        if (stripos($s->tenMon, $keyword) !== false) {
            $isTaiChinh = true;
            break;
        }
    }

    // Check by subject code (TC prefix usually means Tài chính)
    if (preg_match('/^\d+\s*TC/', $s->maMon)) {
        $isTaiChinh = true;
    }

    if ($isTaiChinh) {
        $financeSubjects[] = $s;
    }
}

if (count($financeSubjects) > 0) {
    echo "⚠️  Phát hiện " . count($financeSubjects) . " môn học Tài chính trong ngành CNTT:\n\n";

    foreach ($financeSubjects as $s) {
        echo sprintf(
            "[Relation ID: %d] Subject ID: %d | %s - %s (%d TC)\n",
            $s->relation_id,
            $s->subject_id,
            $s->maMon,
            $s->tenMon,
            $s->soTinChi
        );
    }

    echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "💡 Các môn này nên thuộc về ngành Tài chính, không phải CNTT\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

    // Find Finance major
    $taiChinhMajors = DB::table('majors')
        ->where('tenNganh', 'LIKE', '%tài chính%')
        ->orWhere('maNganh', 'LIKE', '831011%')
        ->get();

    if (count($taiChinhMajors) > 0) {
        echo "Các ngành Tài chính trong database:\n";
        foreach ($taiChinhMajors as $tc) {
            echo "  - [{$tc->id}] {$tc->maNganh} - {$tc->tenNganh}\n";
        }
        echo "\n";

        // Check if these subjects belong to Finance majors
        echo "Kiểm tra xem các môn này có thuộc ngành Tài chính không:\n";
        $tcMajorIds = array_column($taiChinhMajors->toArray(), 'id');

        foreach ($financeSubjects as $s) {
            $belongsToFinance = DB::table('major_subjects')
                ->whereIn('major_id', $tcMajorIds)
                ->where('subject_id', $s->subject_id)
                ->exists();

            if ($belongsToFinance) {
                echo "  ✅ [{$s->subject_id}] {$s->maMon} - Đã có trong ngành Tài chính\n";
            } else {
                echo "  ❌ [{$s->subject_id}] {$s->maMon} - KHÔNG có trong ngành Tài chính\n";
            }
        }
    }

} else {
    echo "✅ Không tìm thấy môn Tài chính nào trong ngành CNTT\n";
}

echo "\n";
