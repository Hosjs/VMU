<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TeachingAssignment;
use App\Models\TeachingSession;
use Carbon\Carbon;

class GenerateTeachingSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sessions:generate
                            {--assignment-id= : Generate sessions for specific assignment ID}
                            {--force : Force regeneration (delete existing sessions)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate teaching sessions from teaching assignments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting session generation...');
        $this->newLine();

        $assignmentId = $this->option('assignment-id');
        $force = $this->option('force');

        // Get assignments to process
        if ($assignmentId) {
            $assignments = TeachingAssignment::where('id', $assignmentId)->get();

            if ($assignments->isEmpty()) {
                $this->error("❌ Assignment with ID {$assignmentId} not found!");
                return 1;
            }
        } else {
            $assignments = TeachingAssignment::all();

            if ($assignments->isEmpty()) {
                $this->warn('⚠️  No teaching assignments found.');
                $this->info('ℹ️  Run "php artisan db:seed" to create demo data first.');
                return 0;
            }
        }

        $this->info("📋 Found {$assignments->count()} assignment(s) to process");
        $this->newLine();

        // Check for existing sessions
        $existingCount = TeachingSession::whereIn('teaching_assignment_id', $assignments->pluck('id'))->count();

        if ($existingCount > 0 && !$force) {
            $this->warn("⚠️  Found {$existingCount} existing sessions.");

            if (!$this->confirm('Do you want to regenerate them? (This will delete existing sessions)', false)) {
                $this->info('Operation cancelled.');
                return 0;
            }

            $force = true;
        }

        // Delete existing sessions if force mode
        if ($force && $existingCount > 0) {
            $this->warn("🗑️  Deleting {$existingCount} existing sessions...");
            TeachingSession::whereIn('teaching_assignment_id', $assignments->pluck('id'))->delete();
            $this->info('✅ Deleted existing sessions');
            $this->newLine();
        }

        // Process each assignment
        $totalSessions = 0;
        $bar = $this->output->createProgressBar($assignments->count());
        $bar->start();

        foreach ($assignments as $assignment) {
            $sessions = $this->createSessionsForAssignment($assignment);
            $totalSessions += $sessions;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info("🎉 Successfully generated {$totalSessions} sessions from {$assignments->count()} assignment(s)!");
        $this->newLine();

        // Show statistics
        $this->showStatistics();

        return 0;
    }

    /**
     * Create sessions for one assignment
     */
    private function createSessionsForAssignment(TeachingAssignment $assignment): int
    {
        $currentDate = Carbon::parse($assignment->start_date);
        $endDate = Carbon::parse($assignment->end_date);
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
            $this->warn("⚠️  Unknown day_of_week: {$assignment->day_of_week} for assignment #{$assignment->id}");
            return 0;
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

        return $sessionsCreated;
    }

    /**
     * Show statistics after generation
     */
    private function showStatistics(): void
    {
        $this->info('📊 Statistics:');
        $this->table(
            ['Status', 'Count'],
            [
                ['Scheduled', TeachingSession::where('status', 'scheduled')->count()],
                ['In Progress', TeachingSession::where('status', 'in_progress')->count()],
                ['Completed', TeachingSession::where('status', 'completed')->count()],
                ['Cancelled', TeachingSession::where('status', 'cancelled')->count()],
                ['Rescheduled', TeachingSession::where('status', 'rescheduled')->count()],
                ['<fg=cyan>TOTAL</>', '<fg=cyan>' . TeachingSession::count() . '</>'],
            ]
        );

        $this->newLine();
        $this->info('💡 Tips:');
        $this->line('  - Use --assignment-id=X to generate sessions for specific assignment');
        $this->line('  - Use --force to regenerate existing sessions');
        $this->line('  - Check calendar at: /lecturer/calendar');
    }
}
