<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\TeachingAssignment;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * ✅ Safe approach: Drop and recreate column with new enum values
     * No DB::statement() to avoid SQL injection risks
     */
    public function up(): void
    {
        // Store existing data temporarily
        $existingAssignments = TeachingAssignment::all()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'day_of_week' => $assignment->day_of_week,
            ];
        })->toArray();

        // Drop and recreate column with new enum
        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->dropColumn('day_of_week');
        });

        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->enum('day_of_week', [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday'
            ])->after('end_date');
        });

        // Restore data
        foreach ($existingAssignments as $data) {
            TeachingAssignment::where('id', $data['id'])
                ->update(['day_of_week' => $data['day_of_week']]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * ⚠️ Warning: This will convert weekday values to 'saturday'
     */
    public function down(): void
    {
        // Store existing data and convert weekdays to saturday
        $existingAssignments = TeachingAssignment::all()->map(function ($assignment) {
            $dayOfWeek = $assignment->day_of_week;

            // Convert weekdays to saturday (default fallback)
            if (!in_array($dayOfWeek, ['saturday', 'sunday'])) {
                $dayOfWeek = 'saturday';
            }

            return [
                'id' => $assignment->id,
                'day_of_week' => $dayOfWeek,
            ];
        })->toArray();

        // Drop and recreate with old enum
        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->dropColumn('day_of_week');
        });

        Schema::table('teaching_assignments', function (Blueprint $table) {
            $table->enum('day_of_week', ['saturday', 'sunday'])
                ->after('end_date');
        });

        // Restore converted data
        foreach ($existingAssignments as $data) {
            TeachingAssignment::where('id', $data['id'])
                ->update(['day_of_week' => $data['day_of_week']]);
        }
    }
};
