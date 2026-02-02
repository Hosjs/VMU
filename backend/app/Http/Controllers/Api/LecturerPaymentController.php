<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LecturerPayment;
use App\Models\Lecturer;
use App\Models\PaymentRate;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LecturerPaymentController extends Controller
{
    /**
     * Get list of lecturer payments with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = LecturerPayment::with(['lecturer', 'lop', 'teachingAssignment', 'creator', 'approver']);

            // Role-based filtering
            if ($user) {
                $isAdmin = false;
                if ($user->role && in_array($user->role->name, ['admin', 'accountant', 'finance_manager'])) {
                    $isAdmin = true;
                }

                // Non-admin users can only see their own payments
                if (!$isAdmin && $user->lecturer_id) {
                    $query->where('lecturer_id', $user->lecturer_id);
                }
            }

            // Filters
            if ($request->has('lecturer_id')) {
                $query->byLecturer($request->lecturer_id);
            }

            if ($request->has('semester_code')) {
                $query->bySemester($request->semester_code);
            }

            if ($request->has('payment_status')) {
                $query->byStatus($request->payment_status);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->dateRange($request->start_date, $request->end_date);
            }

            // Search
            if ($request->has('search')) {
                $query->search($request->search);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $payments = $query->paginate($perPage);

            return response()->json($payments);
        } catch (\Exception $e) {
            \Log::error('Error in LecturerPaymentController@index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payments',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a single payment
     */
    public function show(int $id): JsonResponse
    {
        try {
            $payment = LecturerPayment::with(['lecturer', 'lop', 'teachingAssignment', 'creator', 'approver', 'updater'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found'
            ], 404);
        }
    }

    /**
     * Create a new payment
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lecturer_id' => 'required|exists:lecturers,id',
            'semester_code' => 'required|string|max:50',
            'subject_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'hourly_rate' => 'required|numeric|min:0',
            'insurance_rate' => 'nullable|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['created_by'] = $request->user()->id;
            $data['payment_status'] = 'pending';

            $payment = LecturerPayment::create($data);
            $payment->load(['lecturer', 'lop', 'teachingAssignment']);

            return response()->json([
                'success' => true,
                'message' => 'Tạo bản kê thanh toán thành công',
                'data' => $payment
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating payment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update a payment
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $payment = LecturerPayment::findOrFail($id);

            // Only allow editing if status is pending
            if ($payment->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể sửa bản kê đã được duyệt hoặc thanh toán'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'lecturer_id' => 'sometimes|required|exists:lecturers,id',
                'semester_code' => 'sometimes|required|string|max:50',
                'subject_name' => 'sometimes|required|string|max:255',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after_or_equal:start_date',
                'hourly_rate' => 'sometimes|required|numeric|min:0',
                'insurance_rate' => 'nullable|numeric|min:0|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->all();
            $data['updated_by'] = $request->user()->id;

            $payment->update($data);
            $payment->load(['lecturer', 'lop', 'teachingAssignment']);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật bản kê thanh toán thành công',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating payment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment'
            ], 500);
        }
    }

    /**
     * Delete a payment
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $payment = LecturerPayment::findOrFail($id);

            // Only allow deletion if status is pending
            if ($payment->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa bản kê đã được duyệt hoặc thanh toán'
                ], 403);
            }

            $payment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa bản kê thanh toán thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment'
            ], 500);
        }
    }

    /**
     * Approve a payment
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        try {
            $payment = LecturerPayment::findOrFail($id);

            if ($payment->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bản kê này đã được xử lý'
                ], 403);
            }

            $payment->update([
                'payment_status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            $payment->load(['lecturer', 'lop', 'approver']);

            return response()->json([
                'success' => true,
                'message' => 'Duyệt thanh toán thành công',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve payment'
            ], 500);
        }
    }

    /**
     * Reject a payment
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'rejection_reason' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vui lòng nhập lý do từ chối',
                    'errors' => $validator->errors()
                ], 422);
            }

            $payment = LecturerPayment::findOrFail($id);

            if ($payment->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Bản kê này đã được xử lý'
                ], 403);
            }

            $payment->update([
                'payment_status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Từ chối thanh toán thành công',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject payment'
            ], 500);
        }
    }

    /**
     * Mark payment as paid
     */
    public function markAsPaid(Request $request, int $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'payment_date' => 'required|date',
                'payment_method' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $payment = LecturerPayment::findOrFail($id);

            if ($payment->payment_status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Chỉ có thể thanh toán cho bản kê đã được duyệt'
                ], 403);
            }

            $payment->update([
                'payment_status' => 'paid',
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'updated_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã đánh dấu là đã thanh toán',
                'data' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark as paid'
            ], 500);
        }
    }

    /**
     * Calculate payment from teaching assignment
     */
    public function calculateFromAssignment(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'teaching_assignment_id' => 'required|exists:teaching_assignments,id',
                'semester_code' => 'required|string',
                'hourly_rate' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $assignment = TeachingAssignment::with('lecturer', 'lop')->findOrFail($request->teaching_assignment_id);

            // Calculate hours based on dates
            $startDate = \Carbon\Carbon::parse($assignment->start_date);
            $endDate = \Carbon\Carbon::parse($assignment->end_date);
            $weeks = $startDate->diffInWeeks($endDate);

            // Assume each session is 3 hours
            $sessionsPerWeek = 1; // Once per week
            $hoursPerSession = 3;
            $totalSessions = $weeks * $sessionsPerWeek;
            $totalHours = $totalSessions * $hoursPerSession;

            $data = [
                'lecturer_id' => $assignment->lecturer_id,
                'teaching_assignment_id' => $assignment->id,
                'lop_id' => $assignment->lop_id,
                'semester_code' => $request->semester_code,
                'subject_code' => $assignment->course_code,
                'subject_name' => $assignment->course_name,
                'credits' => $assignment->credits,
                'class_name' => $assignment->class_name,
                'student_count' => $assignment->student_count,
                'start_date' => $assignment->start_date,
                'end_date' => $assignment->end_date,
                'theory_sessions' => $totalSessions,
                'total_sessions' => $totalSessions,
                'teaching_hours_start' => $totalHours / 2,
                'teaching_hours_end' => $totalHours / 2,
                'hourly_rate' => $request->hourly_rate,
                'insurance_rate' => $request->insurance_rate ?? 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Tính toán thành công'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error calculating payment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate payment'
            ], 500);
        }
    }

    /**
     * Get summary for a lecturer
     */
    public function getLecturerSummary(Request $request, int $lecturerId): JsonResponse
    {
        try {
            $lecturer = Lecturer::findOrFail($lecturerId);

            $query = LecturerPayment::where('lecturer_id', $lecturerId);

            if ($request->has('semester_code')) {
                $query->where('semester_code', $request->semester_code);
            }

            $summary = [
                'lecturer' => $lecturer,
                'total_payments' => $query->count(),
                'pending_count' => (clone $query)->where('payment_status', 'pending')->count(),
                'approved_count' => (clone $query)->where('payment_status', 'approved')->count(),
                'paid_count' => (clone $query)->where('payment_status', 'paid')->count(),
                'total_amount' => (clone $query)->sum('total_amount'),
                'total_insurance' => (clone $query)->sum('insurance_amount'),
                'total_net_amount' => (clone $query)->sum('net_amount'),
                'paid_amount' => (clone $query)->where('payment_status', 'paid')->sum('net_amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get summary'
            ], 500);
        }
    }

    /**
     * Get payment statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $query = LecturerPayment::query();

            if ($request->has('semester_code')) {
                $query->where('semester_code', $request->semester_code);
            }

            $stats = [
                'total_payments' => $query->count(),
                'pending_count' => (clone $query)->where('payment_status', 'pending')->count(),
                'approved_count' => (clone $query)->where('payment_status', 'approved')->count(),
                'paid_count' => (clone $query)->where('payment_status', 'paid')->count(),
                'rejected_count' => (clone $query)->where('payment_status', 'rejected')->count(),
                'total_amount' => (clone $query)->sum('total_amount'),
                'total_insurance' => (clone $query)->sum('insurance_amount'),
                'total_net_amount' => (clone $query)->sum('net_amount'),
                'paid_amount' => (clone $query)->where('payment_status', 'paid')->sum('net_amount'),
                'pending_amount' => (clone $query)->where('payment_status', 'pending')->sum('net_amount'),
                'approved_amount' => (clone $query)->where('payment_status', 'approved')->sum('net_amount'),
            ];

            // Get by lecturer
            $byLecturer = (clone $query)
                ->select('lecturer_id',
                    DB::raw('COUNT(*) as payment_count'),
                    DB::raw('SUM(net_amount) as total_net_amount'))
                ->groupBy('lecturer_id')
                ->with('lecturer:id,hoTen')
                ->limit(10)
                ->get();

            $stats['by_lecturer'] = $byLecturer;

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics'
            ], 500);
        }
    }

    /**
     * Get available semesters from teaching assignments and classes
     * Similar to grade-management's approach of extracting years from classes
     */
    public function getAvailableSemesters(Request $request): JsonResponse
    {
        try {
            $semesters = [];

            // 1. Get semesters from lecturer payments (existing data)
            $paymentSemesters = LecturerPayment::select('semester_code')
                ->distinct()
                ->whereNotNull('semester_code')
                ->where('semester_code', '!=', '')
                ->pluck('semester_code')
                ->toArray();

            // 2. Get from teaching assignments if they have semester field
            // (Similar to how grade-management gets khoaHoc from classes)
            $assignmentClasses = DB::table('teaching_assignments')
                ->join('classes', 'teaching_assignments.lop_id', '=', 'classes.id')
                ->select('classes.khoaHoc_id')
                ->distinct()
                ->whereNotNull('classes.khoaHoc_id')
                ->get();

            // Extract years and create semester patterns
            foreach ($assignmentClasses as $class) {
                if ($class->khoaHoc_id) {
                    $year = is_numeric($class->khoaHoc_id) ? $class->khoaHoc_id : intval($class->khoaHoc_id);
                    if ($year > 2000) {
                        $semesters[] = "{$year}.1";
                        $semesters[] = "{$year}.2";
                    }
                }
            }

            // 3. Get from classes table directly (khoaHoc_id field)
            $classYears = DB::table('classes')
                ->select('khoaHoc_id')
                ->distinct()
                ->whereNotNull('khoaHoc_id')
                ->get();

            foreach ($classYears as $class) {
                if ($class->khoaHoc_id) {
                    $year = is_numeric($class->khoaHoc_id) ? $class->khoaHoc_id : intval($class->khoaHoc_id);
                    if ($year > 2000) {
                        $semesters[] = "{$year}.1";
                        $semesters[] = "{$year}.2";
                    }
                }
            }

            // 4. Add default current and last year
            $currentYear = date('Y');
            $lastYear = $currentYear - 1;

            $defaultSemesters = [
                "$currentYear.1",
                "$currentYear.2",
                "$lastYear.1",
                "$lastYear.2",
            ];

            // Merge all sources: payments + teaching assignments + classes + defaults
            $allSemesters = array_unique(array_merge($paymentSemesters, $semesters, $defaultSemesters));

            // Sort descending (newest first)
            rsort($allSemesters);

            $result = array_map(function($semester) {
                return [
                    'value' => $semester,
                    'label' => $semester
                ];
            }, $allSemesters);

            return response()->json([
                'success' => true,
                'data' => array_values($result)
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting semesters: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get semesters'
            ], 500);
        }
    }

    /**
     * Get available subjects by semester
     */
    public function getAvailableSubjects(Request $request): JsonResponse
    {
        try {
            $semesterCode = $request->get('semester_code');

            if (!$semesterCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'semester_code is required'
                ], 422);
            }

            // Extract year from semester code (e.g., "2025.1" -> 2025)
            $year = intval(explode('.', $semesterCode)[0]);

            \Log::info('Getting available subjects', [
                'semester_code' => $semesterCode,
                'year' => $year
            ]);

            // Get subjects from teaching assignments (primary source)
            $assignmentSubjects = TeachingAssignment::select('course_code', 'course_name')
                ->when($year > 2000, function($query) use ($year) {
                    // Try to filter by year if we have class relationship
                    return $query->where(function($q) use ($year) {
                        $q->whereHas('lop', function($lopQuery) use ($year) {
                            $lopQuery->where('khoaHoc_id', $year);
                        })
                        ->orWhereNull('lop_id'); // Include assignments without class
                    });
                })
                ->whereNotNull('course_code')
                ->whereNotNull('course_name')
                ->where('course_code', '!=', '')
                ->where('course_name', '!=', '')
                ->distinct()
                ->get();

            // Also get from existing payments as secondary source
            $paymentSubjects = LecturerPayment::select('subject_code as course_code', 'subject_name as course_name')
                ->where('semester_code', $semesterCode)
                ->whereNotNull('subject_code')
                ->whereNotNull('subject_name')
                ->where('subject_code', '!=', '')
                ->where('subject_name', '!=', '')
                ->distinct()
                ->get();

            // Merge both sources
            $allSubjects = collect();

            // Add from teaching assignments
            foreach ($assignmentSubjects as $subject) {
                $key = $subject->course_code;
                if (!$allSubjects->has($key)) {
                    $allSubjects->put($key, [
                        'value' => $subject->course_code,
                        'label' => $subject->course_code . ' - ' . $subject->course_name,
                        'subject_name' => $subject->course_name,
                        'subject_code' => $subject->course_code
                    ]);
                }
            }

            // Add from payments (won't duplicate due to key check)
            foreach ($paymentSubjects as $subject) {
                $key = $subject->course_code;
                if (!$allSubjects->has($key)) {
                    $allSubjects->put($key, [
                        'value' => $subject->course_code,
                        'label' => $subject->course_code . ' - ' . $subject->course_name,
                        'subject_name' => $subject->course_name,
                        'subject_code' => $subject->course_code
                    ]);
                }
            }

            // If no results with year filter, get ALL from teaching assignments
            if ($allSubjects->isEmpty()) {
                \Log::warning('No subjects found with year filter, getting all subjects from teaching assignments');
                $allSubjects = TeachingAssignment::select('course_code', 'course_name')
                    ->whereNotNull('course_code')
                    ->whereNotNull('course_name')
                    ->where('course_code', '!=', '')
                    ->where('course_name', '!=', '')
                    ->distinct()
                    ->get()
                    ->mapWithKeys(function($subject) {
                        return [$subject->course_code => [
                            'value' => $subject->course_code,
                            'label' => $subject->course_code . ' - ' . $subject->course_name,
                            'subject_name' => $subject->course_name,
                            'subject_code' => $subject->course_code
                        ]];
                    });
            }

            $result = $allSubjects
                ->sortBy('value')
                ->values()
                ->toArray();

            \Log::info('Available subjects result', [
                'count' => count($result),
                'semester_code' => $semesterCode
            ]);

            return response()->json([
                'success' => true,
                'data' => $result,
                'debug' => [
                    'semester_code' => $semesterCode,
                    'year' => $year,
                    'count' => count($result)
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting subjects: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get subjects: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get teaching assignments for auto-fill by lecturer and semester
     */
    public function getTeachingAssignmentsForAutoFill(Request $request): JsonResponse
    {
        try {
            $lecturerId = $request->get('lecturer_id');
            $semesterCode = $request->get('semester_code');

            if (!$lecturerId || !$semesterCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'lecturer_id and semester_code are required'
                ], 422);
            }

            // Extract year from semester code (e.g., "2024.1" -> 2024)
            $year = intval(explode('.', $semesterCode)[0]);

            \Log::info('Getting teaching assignments', [
                'lecturer_id' => $lecturerId,
                'semester_code' => $semesterCode,
                'year' => $year
            ]);

            // First, try to get assignments matching the year
            $query = TeachingAssignment::with(['lop', 'lecturer'])
                ->where('lecturer_id', $lecturerId);

            // Try to filter by year if possible
            $yearFilteredQuery = clone $query;
            $yearFilteredQuery->where(function($q) use ($year) {
                $q->whereHas('lop', function($lopQuery) use ($year) {
                    $lopQuery->where('khoaHoc_id', $year);
                })
                ->orWhereNull('lop_id'); // Include assignments without class
            });

            $assignments = $yearFilteredQuery->get();

            // Track if we used fallback (for better filtering logic)
            $usedFallback = false;

            // If no results with year filter, get ALL assignments for this lecturer
            if ($assignments->isEmpty()) {
                \Log::warning('No assignments found with year filter, getting all assignments for lecturer');
                $assignments = $query->get();
                $usedFallback = true;
            }

            \Log::info('Teaching assignments query result', [
                'count' => $assignments->count(),
                'lecturer_id' => $lecturerId,
                'used_fallback' => $usedFallback
            ]);

            $assignments = $assignments
                ->map(function($assignment) use ($semesterCode, $year, $usedFallback) {
                    $lop = $assignment->lop;

                    // Only skip if has lop and year doesn't match AND we didn't use fallback
                    // If we used fallback, show ALL assignments regardless of year
                    if (!$usedFallback && $lop && $lop->khoaHoc_id && $lop->khoaHoc_id != $year) {
                        return null;
                    }

                    // Calculate sessions based on dates
                    if ($assignment->start_date && $assignment->end_date) {
                        $startDate = \Carbon\Carbon::parse($assignment->start_date);
                        $endDate = \Carbon\Carbon::parse($assignment->end_date);
                        $weeks = max(1, ceil($startDate->diffInWeeks($endDate)));
                        $totalSessions = (int) $weeks; // Ensure integer
                    } else {
                        $totalSessions = 15; // Default 15 sessions
                    }

                    return [
                        'value' => $assignment->id,
                        'label' => ($assignment->course_code ?? 'N/A') . ' - ' . ($assignment->course_name ?? 'Chưa có tên') . ' (' . ($assignment->class_name ?? 'Chưa gán lớp') . ')',
                        'assignment_id' => $assignment->id,
                        'subject_code' => $assignment->course_code ?? '',
                        'subject_name' => $assignment->course_name ?? '',
                        'class_name' => $assignment->class_name ?? '',
                        'education_level' => $lop ? $lop->maTrinhDoDaoTao : '',
                        'credits' => $assignment->credits ?? 0,
                        'student_count' => $assignment->student_count ?? 0,
                        'start_date' => $assignment->start_date ? $assignment->start_date->format('Y-m-d') : '',
                        'end_date' => $assignment->end_date ? $assignment->end_date->format('Y-m-d') : '',
                        'theory_sessions' => (int) $totalSessions,
                        'practical_sessions' => 0,
                        'total_sessions' => (int) $totalSessions,
                    ];
                })
                ->filter() // Remove null values
                ->values(); // Re-index array

            return response()->json([
                'success' => true,
                'data' => $assignments,
                'debug' => [
                    'lecturer_id' => $lecturerId,
                    'semester_code' => $semesterCode,
                    'year' => $year,
                    'count' => $assignments->count()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error getting teaching assignments for auto-fill: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get teaching assignments: ' . $e->getMessage()
            ], 500);
        }
    }
}

