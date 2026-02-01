<?php

namespace App\Observers;

use App\Models\TeachingAssignment;
use App\Models\TeachingSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class TeachingAssignmentObserver
{
    /**
     * Handle the TeachingAssignment "created" event.
     * Auto-generate sessions when assignment is created
     */
    public function created(TeachingAssignment $assignment): void
    {
        Log::info("🆕 TeachingAssignment created: {$assignment->id}, auto-generating sessions...");

        $this->generateSessions($assignment);
    }

    /**
     * Handle the TeachingAssignment "updated" event.
     * Regenerate sessions if dates or day_of_week changed
     */
    public function updated(TeachingAssignment $assignment): void
    {
        // Check if critical fields changed (dates, day_of_week)
        $criticalFields = ['start_date', 'end_date', 'day_of_week'];
        $hasChanges = false;

        foreach ($criticalFields as $field) {
            if ($assignment->isDirty($field)) {
                $hasChanges = true;
                break;
            }
        }

        if ($hasChanges) {
            Log::info("📝 TeachingAssignment updated: {$assignment->id}, regenerating sessions...");

            // Delete old sessions
            TeachingSession::where('teaching_assignment_id', $assignment->id)->delete();

            // Generate new sessions
            $this->generateSessions($assignment);
        } else {
            // Only update non-critical fields in existing sessions
            if ($assignment->isDirty(['start_time', 'end_time', 'room'])) {
                Log::info("🔧 TeachingAssignment updated: {$assignment->id}, updating session details...");

                TeachingSession::where('teaching_assignment_id', $assignment->id)
                    ->update([
                        'start_time' => $assignment->start_time,
                        'end_time' => $assignment->end_time,
                        'room' => $assignment->room,
                    ]);
            }
        }
    }

    /**
     * Handle the TeachingAssignment "deleted" event.
     * Auto-delete related sessions
     */
    public function deleted(TeachingAssignment $assignment): void
    {
        Log::info("🗑️ TeachingAssignment deleted: {$assignment->id}, deleting sessions...");

        TeachingSession::where('teaching_assignment_id', $assignment->id)->delete();
    }

    /**
     * Handle the TeachingAssignment "restored" event.
     * Regenerate sessions when assignment is restored
     */
    public function restored(TeachingAssignment $assignment): void
    {
        Log::info("♻️ TeachingAssignment restored: {$assignment->id}, regenerating sessions...");

        $this->generateSessions($assignment);
    }

    /**
     * Generate sessions for an assignment
     */
    private function generateSessions(TeachingAssignment $assignment): void
    {
        try {
            // Skip if assignment is soft deleted
            if ($assignment->trashed()) {
                Log::warning("⚠️ Assignment {$assignment->id} is soft deleted, skipping session generation");
                return;
            }

            $currentDate = Carbon::parse($assignment->start_date);
            $endDate = Carbon::parse($assignment->end_date);
            $sessionNumber = 1;
            $sessionsCreated = 0;

            // Map day_of_week to PHP day number
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
                Log::warning("⚠️ Invalid day_of_week: {$assignment->day_of_week} for assignment {$assignment->id}");
                return;
            }

            // Loop through dates and create sessions
            while ($currentDate <= $endDate) {
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

            Log::info("✅ Created {$sessionsCreated} sessions for assignment {$assignment->id}");
        } catch (\Exception $e) {
            Log::error("❌ Error generating sessions for assignment {$assignment->id}: {$e->getMessage()}");
        }
    }
}
