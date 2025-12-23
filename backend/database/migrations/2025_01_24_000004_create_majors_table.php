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
        Schema::create('majors', function (Blueprint $table) {
            $table->id();
            $table->string('maNganh', 20)->unique()->nullable();
            $table->string('tenNganh', 255);
            $table->decimal('thoi_gian_dao_tao', 3, 1)->nullable();
            $table->text('ghiChu')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('deleted_in')->nullable();

            // Foreign key
            $table->foreign('parent_id', 'fk_major_parent')
                ->references('id')
                ->on('majors')
                ->onDelete('set null')
                ->onUpdate('cascade');

            // Indexes
            $table->index('parent_id', 'idx_parent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('majors');
    }
};
