<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add 'in_exam' and 'paid' status to teaching_assignments
     * - in_progress: Đang diễn ra
     * - cancelled: Đã hủy
     * - in_exam: Đang thi (all sessions completed)
     * - paid: Đã thanh toán
     *
     * Note: Using Blueprint dropColumn + add instead of raw ALTER
     * to avoid SQL injection risks
     */
    public function up(): void
    {
        Schema::table('teaching_assignments', function (Blueprint $table) {
            // Drop old column
            $table->dropColumn('status');
        });

        Schema::table('teaching_assignments', function (Blueprint $table) {
            // Add column with new enum values
            $table->enum('status', [
                'scheduled',
                'ongoing',
                'completed',
                'cancelled',
                'in_progress',
                'in_exam',
                'paid'
            ])->default('scheduled')->after('student_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('teaching_assignments', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('status', [
                'scheduled',
                'ongoing',
                'completed',
                'cancelled'
            ])->default('scheduled')->after('student_count');
        });
    }
};
