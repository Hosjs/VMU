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
        Schema::table('teaching_sessions', function (Blueprint $table) {
            // Add class_id column (can be different from parent assignment if needed)
            $table->unsignedBigInteger('class_id')
                ->nullable()
                ->after('lecturer_id')
                ->comment('Lớp học (có thể khác với parent nếu cần)');

            // Add foreign key constraint
            $table->foreign('class_id')
                ->references('id')
                ->on('classes')
                ->onDelete('set null');

            // Add index
            $table->index('class_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_sessions', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropIndex(['class_id']);
            $table->dropColumn('class_id');
        });
    }
};
