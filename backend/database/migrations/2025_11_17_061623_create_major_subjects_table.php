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
        Schema::create('major_subjects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('major_id');
            $table->unsignedBigInteger('subject_id');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('deleted_at')->nullable();

            // Indexes (FKs defined in Model)
            $table->index('major_id');
            $table->index('subject_id');

            // Đảm bảo không trùng lặp môn học trong cùng 1 ngành
            $table->unique(['major_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('major_subjects');
    }
};
