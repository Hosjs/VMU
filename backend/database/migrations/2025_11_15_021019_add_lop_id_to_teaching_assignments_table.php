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
        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->unsignedBigInteger('lop_id')->nullable()->after('lecturer_id');
            // Temporarily comment out foreign key to avoid constraint issues
            // $table->foreign('lop_id')->references('id')->on('lop')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teaching_assignments', function (Blueprint $table) {
            // $table->dropForeign(['lop_id']);
            $table->dropColumn('lop_id');
        });
    }
};
