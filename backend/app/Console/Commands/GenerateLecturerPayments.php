<?php

namespace App\Console\Commands;

use App\Models\LecturerPayment;
use App\Models\TeachingAssignment;
use App\Models\PaymentRate;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerateLecturerPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:generate
                            {--semester= : Semester code (e.g., 2024.1)}
                            {--lecturer= : Specific lecturer ID}
                            {--force : Force regenerate even if payment exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-generate lecturer payment records from teaching assignments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $semesterCode = $this->option('semester');
        $lecturerId = $this->option('lecturer');
        $force = $this->option('force');

        $this->info('🚀 Starting payment generation...');
        $this->info('');

        // Get teaching assignments
        $query = TeachingAssignment::with(['lop', 'lecturer'])
            ->whereNotNull('lecturer_id')
            ->whereNotNull('end_date');

        // Filter by semester if specified
        if ($semesterCode) {
            $year = intval(explode('.', $semesterCode)[0]);
            $query->where(function($q) use ($year) {
                $q->whereHas('lop', function($lopQuery) use ($year) {
                    $lopQuery->where('khoaHoc_id', $year);
                })
                ->orWhereNull('lop_id');
            });
            $this->info("📅 Semester filter: {$semesterCode} (Year: {$year})");
        }

        // Filter by lecturer if specified
        if ($lecturerId) {
            $query->where('lecturer_id', $lecturerId);
            $this->info("👤 Lecturer filter: ID {$lecturerId}");
        }

        // Only get completed assignments (end_date has passed)
        $query->where('end_date', '<=', Carbon::now());

        $assignments = $query->get();

        $this->info("📊 Found {$assignments->count()} completed teaching assignments");
        $this->info('');

        if ($assignments->isEmpty()) {
            $this->warn('⚠️  No completed teaching assignments found!');
            return 0;
        }

        $bar = $this->output->createProgressBar($assignments->count());
        $bar->start();

        $created = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($assignments as $assignment) {
            try {
                // Determine semester code
                $semester = $semesterCode;
                if (!$semester && $assignment->lop) {
                    $year = $assignment->lop->khoaHoc_id;
                    $month = Carbon::parse($assignment->start_date)->month;
                    $term = $month <= 6 ? '1' : '2';
                    $semester = "{$year}.{$term}";
                }

                if (!$semester) {
                    $semester = Carbon::parse($assignment->start_date)->format('Y') . '.1';
                }

                // Check if payment already exists
                $exists = LecturerPayment::where('teaching_assignment_id', $assignment->id)
                    ->where('lecturer_id', $assignment->lecturer_id)
                    ->exists();

                if ($exists && !$force) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Calculate sessions
                if ($assignment->start_date && $assignment->end_date) {
                    $startDate = Carbon::parse($assignment->start_date);
                    $endDate = Carbon::parse($assignment->end_date);
                    $weeks = max(1, $startDate->diffInWeeks($endDate));
                    $totalSessions = $weeks;
                } else {
                    $totalSessions = 15; // Default
                }

                // Get payment rate
                $educationLevel = $assignment->lop ? $assignment->lop->maTrinhDoDaoTao : '';
                $rate = $this->getPaymentRate($educationLevel, $semester);

                // Create payment record
                $payment = LecturerPayment::create([
                    'lecturer_id' => $assignment->lecturer_id,
                    'teaching_assignment_id' => $assignment->id,
                    'lop_id' => $assignment->lop_id,
                    'semester_code' => $semester,
                    'subject_code' => $assignment->course_code,
                    'subject_name' => $assignment->course_name,
                    'education_level' => $educationLevel,
                    'credits' => $assignment->credits ?? 0,
                    'class_name' => $assignment->class_name,
                    'student_count' => $assignment->student_count ?? 0,
                    'start_date' => $assignment->start_date,
                    'end_date' => $assignment->end_date,
                    'completion_date' => $assignment->end_date,
                    'theory_sessions' => $totalSessions,
                    'practical_sessions' => 0,
                    'total_sessions' => $totalSessions,
                    'hourly_rate' => $rate->theory_rate ?? 95000,
                    'insurance_rate' => $rate->insurance_rate ?? 10,
                    'payment_status' => 'pending',
                    'created_by' => 1, // System
                ]);

                $created++;

            } catch (\Exception $e) {
                $this->error("\n❌ Error processing assignment {$assignment->id}: " . $e->getMessage());
                $errors++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->info('');
        $this->info('');

        // Summary
        $this->info('✅ Payment Generation Complete!');
        $this->info('');
        $this->table(
            ['Status', 'Count'],
            [
                ['Created', $created],
                ['Skipped (already exists)', $skipped],
                ['Errors', $errors],
                ['Total Processed', $assignments->count()],
            ]
        );

        if ($created > 0) {
            $this->info('');
            $this->info("💰 Successfully created {$created} payment record(s)");
        }

        return 0;
    }

    /**
     * Get payment rate for education level and semester
     */
    private function getPaymentRate($educationLevel, $semester)
    {
        // Try to find specific rate
        $rate = PaymentRate::where('education_level', $educationLevel)
            ->where('semester_code', $semester)
            ->where('is_active', true)
            ->first();

        // Fallback to any active rate
        if (!$rate) {
            $rate = PaymentRate::where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->first();
        }

        // Fallback to default values
        if (!$rate) {
            $rate = new PaymentRate([
                'theory_rate' => 95000,
                'practical_rate' => 95000,
                'insurance_rate' => 10,
            ]);
        }

        return $rate;
    }
}

