<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * B2 — Bổ sung iso_year + iso_week (ISO 8601) cho weekly_schedules.
 *
 * `week_number` cũ là chuỗi (ví dụ "Tuần 12") gắn với khoá học/kỳ học,
 * không thể so sánh giữa các kỳ. iso_year + iso_week cho phép truy vấn
 * theo tuần lịch dương chuẩn 1-53, không phụ thuộc kỳ học.
 *
 * Migration thêm cột nullable + index. Backfill dữ liệu cũ làm thủ công
 * (xem db_changes/B2_iso_week.md).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('weekly_schedules', function (Blueprint $table) {
            if (!Schema::hasColumn('weekly_schedules', 'iso_year')) {
                $table->smallInteger('iso_year')->nullable()->after('week_number');
            }
            if (!Schema::hasColumn('weekly_schedules', 'iso_week')) {
                $table->tinyInteger('iso_week')->nullable()->after('iso_year');
            }
        });

        // Indexes phải tách riêng vì hasColumn check cần xảy ra trước.
        Schema::table('weekly_schedules', function (Blueprint $table) {
            $table->index(['iso_year', 'iso_week'], 'weekly_schedules_iso_idx');
        });
    }

    public function down(): void
    {
        Schema::table('weekly_schedules', function (Blueprint $table) {
            $table->dropIndex('weekly_schedules_iso_idx');
            $table->dropColumn(['iso_year', 'iso_week']);
        });
    }
};
