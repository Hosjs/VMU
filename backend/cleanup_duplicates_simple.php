<?php
/**
 * Simple script to find and remove duplicate subjects
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Starting cleanup...\n";

    // Find duplicates
    $duplicates = DB::select("
        SELECT tenMon, COUNT(*) as cnt, GROUP_CONCAT(id) as ids
        FROM subjects
        WHERE tenMon IN (
            SELECT tenMon FROM subjects
            GROUP BY tenMon
            HAVING COUNT(*) > 1
        )
        GROUP BY tenMon
        ORDER BY tenMon
    ");

    echo "Found " . count($duplicates) . " duplicate groups\n\n";

    $deleted = 0;
    $updated = 0;

    foreach ($duplicates as $dup) {
        echo "Processing: {$dup->tenMon} ({$dup->cnt} copies)\n";

        $ids = explode(',', $dup->ids);

        // Get all subjects
        $subjects = DB::table('subjects')->whereIn('id', $ids)->get();

        // Choose keeper: prefer with description, then shorter code, then lower ID
        $keeper = null;
        foreach ($subjects as $s) {
            if (!$keeper) {
                $keeper = $s;
                continue;
            }

            // Prefer with description
            if (!empty($s->moTa) && empty($keeper->moTa)) {
                $keeper = $s;
            }
            // Or prefer shorter code (original format)
            elseif ((empty($s->moTa) == empty($keeper->moTa)) && strlen($s->maMon) < strlen($keeper->maMon)) {
                $keeper = $s;
            }
        }

        echo "  Keeping ID {$keeper->id}: {$keeper->maMon}\n";

        // Update relations
        foreach ($ids as $id) {
            if ($id != $keeper->id) {
                // Get all major_subjects for this duplicate
                $relations = DB::table('major_subjects')
                    ->where('subject_id', $id)
                    ->get();

                foreach ($relations as $rel) {
                    // Check if keeper already has this major relation
                    $exists = DB::table('major_subjects')
                        ->where('major_id', $rel->major_id)
                        ->where('subject_id', $keeper->id)
                        ->exists();

                    if ($exists) {
                        // Just delete the duplicate relation
                        DB::table('major_subjects')->where('id', $rel->id)->delete();
                    } else {
                        // Update to point to keeper
                        try {
                            DB::table('major_subjects')
                                ->where('id', $rel->id)
                                ->update(['subject_id' => (int)$keeper->id]);
                            $updated++;
                        } catch (Exception $e) {
                            echo "  Warning: Could not update relation {$rel->id}: " . $e->getMessage() . "\n";
                            // Just delete it if update fails
                            DB::table('major_subjects')->where('id', $rel->id)->delete();
                        }
                    }
                }

                // Delete duplicate subject
                DB::table('subjects')->where('id', $id)->delete();
                $deleted++;
                echo "  Deleted ID {$id}\n";
            }
        }

        echo "\n";
    }

    echo "Summary:\n";
    echo "  Deleted: {$deleted}\n";
    echo "  Updated relations: {$updated}\n";
    echo "Done!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
