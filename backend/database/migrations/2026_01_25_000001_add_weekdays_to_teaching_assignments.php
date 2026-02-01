<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alter the day_of_week column to support all days of the week
        DB::statement("
            ALTER TABLE teaching_assignments
            MODIFY COLUMN day_of_week
            ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
            NOT NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to only saturday and sunday
        // Note: This will fail if there are records with weekday values
        DB::statement("
            ALTER TABLE teaching_assignments
            MODIFY COLUMN day_of_week
            ENUM('saturday', 'sunday')
            NOT NULL
        ");
    }
};
