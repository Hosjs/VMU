<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\TeachingAssignment;
use App\Models\TeachingSession;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tạo teaching_sessions từ teaching_assignments hiện có
     * Mỗi assignment sẽ được chia thành nhiều sessions dựa trên day_of_week
     */
    public function up(): void
    {
        echo "\n🔄 Generating sessions from existing assignments...\n\n";

        $assignments = TeachingAssignment::all();
        $totalSessions = 0;

        foreach ($assignments as $assignment) {
            echo "📋 Processing Assignment #{$assignment->id}: {$assignment->course_name}\n";
            echo "   Start: {$assignment->start_date->format('Y-m-d')}, End: {$assignment->end_date->format('Y-m-d')}\n";
            echo "   Day: {$assignment->day_of_week}\n";

            $sessions = $this->createSessionsForAssignment($assignment);
            $totalSessions += $sessions;

            echo "   ✅ Created {$sessions} sessions\n\n";
        }

        echo "✅ Total: Generated {$totalSessions} sessions from {$assignments->count()} assignments\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "\n⚠️  Deleting all generated sessions...\n";
        TeachingSession::truncate();
        echo "✅ Done\n";
    }

    /**
     * Helper: Tạo sessions cho 1 assignment
     */
    private function createSessionsForAssignment(TeachingAssignment $assignment): int
    {
        $currentDate = $assignment->start_date->copy();
        $sessionNumber = 1;
        $sessionsCreated = 0;

        // Map day_of_week string to PHP day number
        $dayMapping = [
            'sunday' => 0,
            'monday' => 1,
            'tuesday' => 2,
            'wednesday' => 3,
            'thursday' => 4,
            'friday' => 5,
            'saturday' => 6,
        ];

        $targetDay = $dayMapping[$assignment->day_of_week] ?? null;

        if ($targetDay === null) {
            echo "   ⚠️  Unknown day_of_week: {$assignment->day_of_week}\n";
            return 0;
        }

        while ($currentDate <= $assignment->end_date) {
            // Check if current date matches target day of week
            if ($currentDate->dayOfWeek === $targetDay) {
                TeachingSession::create([
                    'teaching_assignment_id' => $assignment->id,
                    'lecturer_id' => $assignment->lecturer_id,
                    'class_id' => $assignment->class_id,
                    'session_date' => $currentDate->format('Y-m-d'),
                    'start_time' => $assignment->start_time,
                    'end_time' => $assignment->end_time,
                    'room' => $assignment->room,
                    'session_number' => $sessionNumber,
                    'status' => 'scheduled',
                ]);

                $sessionsCreated++;
                $sessionNumber++;
            }

            $currentDate->addDay();
        }

        return $sessionsCreated;
    }
};
