<?php
/**
 * Script để tìm và merge các môn học trùng lặp
 *
 * Chiến lược:
 * 1. Tìm các môn có cùng tên (trim và lowercase)
 * 2. Giữ lại môn có mô tả hoặc môn được tạo trước
 * 3. Update major_subjects để trỏ về môn được giữ lại
 * 4. Xóa các môn trùng lặp
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Finding duplicate subjects...\n\n";

// Find duplicates by normalized name
$duplicates = DB::select("
    SELECT
        TRIM(LOWER(tenMon)) as normalized_name,
        COUNT(*) as count,
        GROUP_CONCAT(id ORDER BY id) as ids
    FROM subjects
    GROUP BY TRIM(LOWER(tenMon))
    HAVING count > 1
    ORDER BY count DESC, normalized_name
");

echo "Found " . count($duplicates) . " groups of duplicates\n\n";

$stats = [
    'groups_processed' => 0,
    'subjects_kept' => 0,
    'subjects_deleted' => 0,
    'relations_updated' => 0,
];

foreach ($duplicates as $group) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📚 Group: {$group->normalized_name}\n";
    echo "   Count: {$group->count}\n";

    $ids = explode(',', $group->ids);

    // Get full details of all duplicates
    $subjects = DB::table('subjects')
        ->whereIn('id', $ids)
        ->orderBy('id')
        ->get();

    echo "\n   Subjects in this group:\n";
    foreach ($subjects as $subj) {
        $hasDesc = !empty($subj->moTa) ? '✓ có mô tả' : '✗ không có mô tả';
        echo "   [{$subj->id}] {$subj->maMon} - {$subj->tenMon} ({$subj->soTinChi} TC) - {$hasDesc}\n";
    }

    // Choose which subject to keep
    // Priority: 1. Has description, 2. Shorter code (likely original), 3. Lower ID (created first)
    $keeper = null;
    foreach ($subjects as $subj) {
        if (!$keeper) {
            $keeper = $subj;
            continue;
        }

        // Prefer subject with description
        if (!empty($subj->moTa) && empty($keeper->moTa)) {
            $keeper = $subj;
            continue;
        }

        // If both have or don't have description, prefer shorter code (original format like CNTT01)
        if ((empty($subj->moTa) && empty($keeper->moTa)) || (!empty($subj->moTa) && !empty($keeper->moTa))) {
            if (strlen($subj->maMon) < strlen($keeper->maMon)) {
                $keeper = $subj;
                continue;
            }

            // If same length, prefer lower ID
            if (strlen($subj->maMon) === strlen($keeper->maMon) && $subj->id < $keeper->id) {
                $keeper = $subj;
            }
        }
    }

    echo "\n   ✅ Keeping: [{$keeper->id}] {$keeper->maMon} - {$keeper->tenMon}\n";

    // Get IDs to delete
    $toDelete = array_filter($ids, function($id) use ($keeper) {
        return $id != $keeper->id;
    });

    if (empty($toDelete)) {
        echo "   ⚠️  No subjects to delete\n\n";
        continue;
    }

    echo "   🗑️  Deleting: " . implode(', ', $toDelete) . "\n";

    // Update major_subjects to point to keeper
    $updated = DB::table('major_subjects')
        ->whereIn('subject_id', $toDelete)
        ->update(['subject_id' => $keeper->id]);

    if ($updated > 0) {
        echo "   📝 Updated {$updated} major_subjects relations\n";
        $stats['relations_updated'] += $updated;
    }

    // Delete duplicate subjects
    $deleted = DB::table('subjects')
        ->whereIn('id', $toDelete)
        ->delete();

    echo "   ✅ Deleted {$deleted} duplicate subjects\n\n";

    $stats['groups_processed']++;
    $stats['subjects_kept']++;
    $stats['subjects_deleted'] += $deleted;
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📊 STATISTICS\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "Groups processed:       {$stats['groups_processed']}\n";
echo "Subjects kept:          {$stats['subjects_kept']}\n";
echo "Subjects deleted:       {$stats['subjects_deleted']}\n";
echo "Relations updated:      {$stats['relations_updated']}\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// Verify no more duplicates
echo "🔍 Verifying...\n";
$remaining = DB::select("
    SELECT
        TRIM(LOWER(tenMon)) as normalized_name,
        COUNT(*) as count
    FROM subjects
    GROUP BY TRIM(LOWER(tenMon))
    HAVING count > 1
");

if (empty($remaining)) {
    echo "✅ No more duplicates found!\n";
} else {
    echo "⚠️  Still " . count($remaining) . " groups of duplicates remaining\n";
}

echo "\n✅ Cleanup completed!\n";
