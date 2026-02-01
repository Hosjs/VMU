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
        // Kiểm tra nếu bảng đã tồn tại thì bỏ qua (vì đã tạo trực tiếp trong DB)
        if (Schema::hasTable('lecturers')) {
            return;
        }

        Schema::create('lecturers', function (Blueprint $table) {
            $table->id();
            $table->string('hoTen', 255);
            $table->string('trinhDoChuyenMon', 50)->nullable();
            $table->string('hocHam', 50)->nullable();
            $table->unsignedBigInteger('maNganh')->nullable();
            $table->text('ghiChu')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable()->useCurrentOnUpdate();
            $table->timestamp('deleted_at')->nullable();

            // Index (FK defined in Model)
            $table->index('maNganh');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lecturers');
    }
};
