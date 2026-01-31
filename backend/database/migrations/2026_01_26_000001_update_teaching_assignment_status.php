<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // BƯỚC 1: Mở rộng enum để bao gồm cả giá trị cũ và mới
        DB::statement("
            ALTER TABLE teaching_assignments
            MODIFY COLUMN status
            ENUM('scheduled', 'ongoing', 'completed', 'cancelled', 'in_progress', 'in_exam', 'paid')
            NOT NULL DEFAULT 'scheduled'
        ");

        // BƯỚC 2: Migrate dữ liệu từ enum cũ sang enum mới
        DB::statement("
            UPDATE teaching_assignments
            SET status = 'in_progress'
            WHERE status IN ('scheduled', 'ongoing', 'completed')
        ");

        // BƯỚC 3: Giới hạn enum chỉ còn các giá trị mới
        DB::statement("
            ALTER TABLE teaching_assignments
            MODIFY COLUMN status
            ENUM('in_progress', 'cancelled', 'in_exam', 'paid')
            NOT NULL DEFAULT 'in_progress'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Chuyển tất cả về 'scheduled' trước khi rollback
        DB::statement("
            UPDATE teaching_assignments
            SET status = 'scheduled'
        ");

        // Revert lại status enum cũ
        DB::statement("
            ALTER TABLE teaching_assignments
            MODIFY COLUMN status
            ENUM('scheduled', 'ongoing', 'completed', 'cancelled')
            NOT NULL DEFAULT 'scheduled'
        ");
    }
};
