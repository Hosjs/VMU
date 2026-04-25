<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * D4 — Bổ sung trường đồng bộ học viên từ API bên ngoài (`students`).
 *
 * `external_id` lưu mã định danh của học viên ở hệ thống nguồn (có thể trùng
 * `maHV` nội bộ, có thể không). `external_source` cho phép sau này có nhiều
 * nguồn khác nhau (vmu_sdh, ehsv...). `synced_at` để biết lần sync gần nhất.
 *
 * Xem `db_changes/D4_external_student_sync.md`.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'external_id')) {
                $table->string('external_id', 50)->nullable()->after('maHV');
            }
            if (!Schema::hasColumn('students', 'external_source')) {
                $table->string('external_source', 30)->nullable()->after('external_id');
            }
            if (!Schema::hasColumn('students', 'synced_at')) {
                $table->timestamp('synced_at')->nullable()->after('external_source');
            }
        });

        Schema::table('students', function (Blueprint $table) {
            $table->unique(['external_source', 'external_id'], 'students_external_uniq');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique('students_external_uniq');
            $table->dropColumn(['external_id', 'external_source', 'synced_at']);
        });
    }
};
