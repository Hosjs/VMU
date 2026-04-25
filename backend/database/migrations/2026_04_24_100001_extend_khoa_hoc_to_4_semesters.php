<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Allow hoc_ky to reach 4 (spring, summer, fall, winter).
        // MySQL 8 CHECK constraints are named implicitly; drop and re-add if present.
        try {
            DB::statement('ALTER TABLE khoa_hoc DROP CHECK khoa_hoc_hoc_ky_check');
        } catch (\Throwable $e) {
            // Constraint may not exist (older MySQL / MariaDB) — ignore.
        }
        try {
            DB::statement('ALTER TABLE khoa_hoc ADD CONSTRAINT khoa_hoc_hoc_ky_check CHECK (hoc_ky BETWEEN 1 AND 4)');
        } catch (\Throwable $e) {
            // DB may not support check constraints — skip silently.
        }

        Schema::table('khoa_hoc', function (Blueprint $table) {
            if (!Schema::hasColumn('khoa_hoc', 'semester_label')) {
                $table->string('semester_label', 40)->nullable()->after('hoc_ky');
            }
        });
    }

    public function down(): void
    {
        Schema::table('khoa_hoc', function (Blueprint $table) {
            if (Schema::hasColumn('khoa_hoc', 'semester_label')) {
                $table->dropColumn('semester_label');
            }
        });
        try {
            DB::statement('ALTER TABLE khoa_hoc DROP CHECK khoa_hoc_hoc_ky_check');
            DB::statement('ALTER TABLE khoa_hoc ADD CONSTRAINT khoa_hoc_hoc_ky_check CHECK (hoc_ky BETWEEN 1 AND 3)');
        } catch (\Throwable $e) {}
    }
};
