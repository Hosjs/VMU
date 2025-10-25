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
        Schema::create('trinh_do_dao_tao', function (Blueprint $table) {
            $table->string('maTrinhDoDaoTao', 10)->primary();
            $table->string('tenTrinhDo', 100);
            $table->string('moTa', 255)->nullable();
            $table->boolean('trangThai')->default(true);

            $table->timestamps();
            $table->softDeletes();
            $table->unsignedBigInteger('createdBy')->nullable();

            $table->foreign('createdBy')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trinh_do_dao_tao');
    }
};

