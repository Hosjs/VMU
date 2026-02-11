<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('weekly_schedules', function (Blueprint $table) {
            // Check if column doesn't exist before adding
            if (!Schema::hasColumn('weekly_schedules', 'khoa_hoc_id')) {
                $table->unsignedBigInteger('khoa_hoc_id')->nullable()->after('week_number')->comment('ID kỳ học');
                $table->index('khoa_hoc_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weekly_schedules', function (Blueprint $table) {
            if (Schema::hasColumn('weekly_schedules', 'khoa_hoc_id')) {
                $table->dropIndex(['khoa_hoc_id']);
                $table->dropColumn('khoa_hoc_id');
            }
        });
    }
};
