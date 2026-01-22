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
        Schema::table('subject_students', function (Blueprint $table) {
            // Thêm 3 cột điểm X1, X2, X3
            $table->float('x1')->nullable()->after('x');
            $table->float('x2')->nullable()->after('x1');
            $table->float('x3')->nullable()->after('x2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subject_students', function (Blueprint $table) {
            $table->dropColumn(['x1', 'x2', 'x3']);
        });
    }
};
