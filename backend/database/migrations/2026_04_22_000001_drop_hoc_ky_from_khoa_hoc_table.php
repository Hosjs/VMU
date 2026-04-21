<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('khoa_hoc') && Schema::hasColumn('khoa_hoc', 'hoc_ky')) {
            $courses = DB::table('khoa_hoc')
                ->select('id', 'nam_hoc', 'hoc_ky', 'dot')
                ->orderBy('nam_hoc')
                ->orderBy('hoc_ky')
                ->orderBy('dot')
                ->orderBy('id')
                ->get();

            $yearCounters = [];
            $updates = [];

            foreach ($courses as $course) {
                $year = (string) $course->nam_hoc;
                $yearCounters[$year] = ($yearCounters[$year] ?? 0) + 1;

                $newDot = $yearCounters[$year];
                $updates[] = [
                    'id' => $course->id,
                    'dot' => $newDot,
                    'ma_khoa_hoc' => $year . '.' . $newDot,
                ];
            }

            DB::transaction(function () use ($updates) {
                foreach ($updates as $item) {
                    DB::table('khoa_hoc')
                        ->where('id', $item['id'])
                        ->update([
                            // Temporary unique value to avoid collisions on unique index.
                            'ma_khoa_hoc' => 'TMP-' . $item['id'],
                        ]);
                }

                foreach ($updates as $item) {
                    DB::table('khoa_hoc')
                        ->where('id', $item['id'])
                        ->update([
                            'dot' => $item['dot'],
                            'ma_khoa_hoc' => $item['ma_khoa_hoc'],
                        ]);
                }
            });

            Schema::table('khoa_hoc', function (Blueprint $table) {
                $table->dropColumn('hoc_ky');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('khoa_hoc') && !Schema::hasColumn('khoa_hoc', 'hoc_ky')) {
            Schema::table('khoa_hoc', function (Blueprint $table) {
                $table->integer('hoc_ky')->nullable()->after('nam_hoc');
            });
        }
    }
};
