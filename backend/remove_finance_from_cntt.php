<?php
/**
 * Remove Finance subjects from CNTT major
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Xóa các môn Tài chính khỏi ngành CNTT\n\n";

// Get CNTT major
$cntt = DB::table('majors')->where('id', 4)->first();
echo "Ngành CNTT: {$cntt->tenNganh} ({$cntt->maNganh})\n\n";

// Find Finance-related subjects in CNTT
$financeKeywords = ['tài chính', 'kế toán', 'định giá', 'ngân hàng', 'đầu tư', 'rủi ro'];

$wrongRelations = DB::table('major_subjects as ms')
    ->join('subjects as s', 'ms.subject_id', '=', 's.id')
    ->where('ms.major_id', 4)
    ->where(function($query) use ($financeKeywords) {
        foreach ($financeKeywords as $keyword) {
            $query->orWhere('s.tenMon', 'LIKE', "%{$keyword}%");
        }
        // Also check for TC prefix in code
        $query->orWhereRaw('s.maMon REGEXP "^[0-9]+ TC"');
    })
    ->select('ms.id as relation_id', 's.id as subject_id', 's.maMon', 's.tenMon')
    ->get();

if (count($wrongRelations) == 0) {
    echo "✅ Không tìm thấy môn Tài chính nào trong ngành CNTT\n";
    exit(0);
}

echo "Tìm thấy " . count($wrongRelations) . " môn Tài chính trong ngành CNTT:\n\n";

foreach ($wrongRelations as $rel) {
    echo "  [{$rel->relation_id}] {$rel->maMon} - {$rel->tenMon}\n";
}

echo "\n";
echo "Bạn có muốn xóa các môn này khỏi ngành CNTT? (y/n): ";
$handle = fopen ("php://stdin","r");
$line = fgets($handle);
$confirmation = trim(strtolower($line));
fclose($handle);

if ($confirmation !== 'y' && $confirmation !== 'yes') {
    echo "❌ Đã hủy\n";
    exit(0);
}

echo "\n";
echo "Đang xóa...\n";

$deleted = 0;
foreach ($wrongRelations as $rel) {
    // Check if this subject belongs to Finance majors
    $taiChinhMajors = DB::table('majors')
        ->where('tenNganh', 'LIKE', '%tài chính%')
        ->orWhere('maNganh', 'LIKE', '831011%')
        ->orWhere('maNganh', 'LIKE', '9340201')
        ->orWhere('maNganh', 'LIKE', '9340202')
        ->pluck('id');

    $belongsToFinance = DB::table('major_subjects')
        ->whereIn('major_id', $taiChinhMajors)
        ->where('subject_id', $rel->subject_id)
        ->exists();

    if ($belongsToFinance) {
        // Delete from CNTT
        DB::table('major_subjects')->where('id', $rel->relation_id)->delete();
        echo "  ✅ Đã xóa [{$rel->relation_id}] {$rel->maMon} - {$rel->tenMon}\n";
        $deleted++;
    } else {
        echo "  ⚠️  Bỏ qua [{$rel->relation_id}] {$rel->maMon} - Không thuộc ngành Tài chính\n";
    }
}

echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Đã xóa {$deleted} môn học Tài chính khỏi ngành CNTT\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Verify
echo "Xác nhận:\n";
$remaining = DB::table('major_subjects as ms')
    ->join('subjects as s', 'ms.subject_id', '=', 's.id')
    ->where('ms.major_id', 4)
    ->where(function($query) use ($financeKeywords) {
        foreach ($financeKeywords as $keyword) {
            $query->orWhere('s.tenMon', 'LIKE', "%{$keyword}%");
        }
        $query->orWhereRaw('s.maMon REGEXP "^[0-9]+ TC"');
    })
    ->count();

if ($remaining == 0) {
    echo "✅ Không còn môn Tài chính nào trong ngành CNTT\n";
} else {
    echo "⚠️  Vẫn còn {$remaining} môn Tài chính trong ngành CNTT\n";
}

echo "\n";
