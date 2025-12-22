<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeachingAssignment;
use App\Models\Lecturer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TeachingAssignmentController extends Controller
{
    /**
     * Get list of teaching assignments with pagination and filters
     * Support role-based filtering: lecturers see only their schedules, students see their class schedules, admins see all
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = TeachingAssignment::with('lecturer');

            // Role-based filtering - ONLY for non-admin users
            if ($user) {
                // Eager load role to avoid N+1 queries
                if (!$user->relationLoaded('role')) {
                    $user->load('role');
                }

                // Check if user has admin role or specific permissions
                $isAdmin = false;

                // Check if user has admin role
                if ($user->role && ($user->role->name === 'admin' || $user->role->name === 'training_manager')) {
                    $isAdmin = true;
                }

                // Check permission (only if method exists)
                if (!$isAdmin && method_exists($user, 'hasPermission')) {
                    try {
                        if ($user->hasPermission('teaching_assignments', 'view_all')) {
                            $isAdmin = true;
                        }
                    } catch (\Exception $e) {
                        \Log::warning('hasPermission check failed in index: ' . $e->getMessage());
                    }
                }

                // If not admin, filter by lecturer_id
                if (!$isAdmin) {
                    // Priority 1: Check if user has direct lecturer_id
                    if ($user->lecturer_id) {
                        $query->where('lecturer_id', $user->lecturer_id);
                        \Log::info("Filtering teaching assignments for lecturer_id: {$user->lecturer_id}");
                    } else {
                        // Priority 2: Try to match by name
                        $lecturer = \App\Models\Lecturer::where('hoTen', $user->name)->first();

                        if ($lecturer) {
                            $query->where('lecturer_id', $lecturer->id);
                            \Log::info("Filtering teaching assignments by name match, lecturer_id: {$lecturer->id}");
                        } else {
                            // Priority 3: Check if user is a student
                            $student = \DB::table('hoc_vien')
                                ->where('email', $user->email)
                                ->orWhereRaw("CONCAT(hoDem, ' ', ten) = ?", [$user->name])
                                ->first();

                            if ($student && isset($student->idLop)) {
                                $lop = \App\Models\classes::find($student->idLop);
                                if ($lop) {
                                    $query->where(function($q) use ($lop) {
                                        $q->where('class_name', $lop->tenLop)
                                          ->orWhere('lop_id', $lop->id);
                                    });
                                    \Log::info("Filtering teaching assignments for student class: {$lop->tenLop}");
                                }
                            } else {
                                // User is neither lecturer nor student, return empty results
                                $query->whereRaw('1 = 0');
                                \Log::info("User is neither lecturer nor student, returning empty results");
                            }
                        }
                    }
                }
            }

            if ($request->has('lecturer_id')) {
                $query->byLecturer($request->lecturer_id);
            }

            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            if ($request->has('day_of_week')) {
                $query->byDayOfWeek($request->day_of_week);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->dateRange($request->start_date, $request->end_date);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('course_name', 'like', "%{$search}%")
                      ->orWhere('course_code', 'like', "%{$search}%")
                      ->orWhere('class_name', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'start_date');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $assignments = $query->paginate($perPage);

            return response()->json($assignments);
        } catch (\Exception $e) {
            \Log::error('Error in index: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teaching assignments',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get a single teaching assignment
     */
    public function show(int $id): JsonResponse
    {
        $assignment = TeachingAssignment::with('lecturer')->findOrFail($id);
        return response()->json($assignment);
    }

    /**
     * Create a new teaching assignment
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lecturer_id' => 'required|exists:lecturers,id',
            'course_name' => 'required|string|max:255',
            'course_code' => 'nullable|string|max:50',
            'credits' => 'nullable|integer|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'day_of_week' => 'required|in:saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'class_name' => 'nullable|string|max:100',
            'student_count' => 'nullable|integer|min:0',
            'status' => 'nullable|in:scheduled,ongoing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for conflicts
        $hasConflict = TeachingAssignment::hasConflict(
            $request->lecturer_id,
            $request->day_of_week,
            $request->start_time,
            $request->end_time,
            $request->start_date,
            $request->end_date
        );

        if ($hasConflict) {
            return response()->json([
                'success' => false,
                'message' => 'Giảng viên đã có lịch giảng dạy trùng thời gian này',
            ], 409);
        }

        $assignment = TeachingAssignment::create($request->all());
        $assignment->load('lecturer');

        return response()->json([
            'success' => true,
            'message' => 'Tạo lịch giảng dạy thành công',
            'data' => $assignment
        ], 201);
    }

    /**
     * Update a teaching assignment
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $assignment = TeachingAssignment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'lecturer_id' => 'sometimes|required|exists:lecturers,id',
            'course_name' => 'sometimes|required|string|max:255',
            'course_code' => 'nullable|string|max:50',
            'credits' => 'nullable|integer|min:0',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'day_of_week' => 'sometimes|required|in:saturday,sunday',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'class_name' => 'nullable|string|max:100',
            'student_count' => 'nullable|integer|min:0',
            'status' => 'nullable|in:scheduled,ongoing,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for conflicts if time-related fields are being updated
        if ($request->has(['lecturer_id', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date'])) {
            $hasConflict = TeachingAssignment::hasConflict(
                $request->get('lecturer_id', $assignment->lecturer_id),
                $request->get('day_of_week', $assignment->day_of_week),
                $request->get('start_time', $assignment->start_time),
                $request->get('end_time', $assignment->end_time),
                $request->get('start_date', $assignment->start_date),
                $request->get('end_date', $assignment->end_date),
                $id
            );

            if ($hasConflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Giảng viên đã có lịch giảng dạy trùng thời gian này',
                ], 409);
            }
        }

        $assignment->update($request->all());
        $assignment->load('lecturer');

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật lịch giảng dạy thành công',
            'data' => $assignment
        ]);
    }

    /**
     * Delete a teaching assignment
     */
    public function destroy(int $id): JsonResponse
    {
        $assignment = TeachingAssignment::findOrFail($id);
        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa lịch giảng dạy thành công'
        ]);
    }

    /**
     * Get lecturer's schedule (calendar view)
     */
    public function lecturerSchedule(Request $request, int $lecturerId): JsonResponse
    {
        $lecturer = Lecturer::findOrFail($lecturerId);

        $query = TeachingAssignment::where('lecturer_id', $lecturerId)
            ->where('status', '!=', 'cancelled');

        if ($request->has('month') && $request->has('year')) {
            $startDate = "{$request->year}-{$request->month}-01";
            $endDate = date('Y-m-t', strtotime($startDate));
            $query->dateRange($startDate, $endDate);
        }

        $assignments = $query->orderBy('start_date')->orderBy('start_time')->get();

        return response()->json([
            'success' => true,
            'lecturer' => $lecturer,
            'assignments' => $assignments
        ]);
    }

    /**
     * Check for schedule conflicts
     */
    public function checkConflict(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lecturer_id' => 'required|exists:lecturers,id',
            'day_of_week' => 'required|in:saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'exclude_id' => 'nullable|exists:teaching_assignments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $hasConflict = TeachingAssignment::hasConflict(
            $request->lecturer_id,
            $request->day_of_week,
            $request->start_time,
            $request->end_time,
            $request->start_date,
            $request->end_date,
            $request->exclude_id
        );

        return response()->json([
            'success' => true,
            'has_conflict' => $hasConflict
        ]);
    }

    /**
     * Get upcoming teaching assignments (for notifications)
     * Returns assignments that are today or in the next 7 days
     */
    public function getUpcoming(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $today = now()->startOfDay();
            $nextWeek = now()->addDays(7)->endOfDay();

            $query = TeachingAssignment::with('lecturer')
                ->whereBetween('start_date', [$today, $nextWeek])
                ->whereIn('status', ['scheduled', 'ongoing'])
                ->orderBy('start_date')
                ->orderBy('start_time');

            // Role-based filtering - ONLY for non-admin users
            if ($user) {
                // Eager load role to avoid N+1 queries
                if (!$user->relationLoaded('role')) {
                    $user->load('role');
                }

                // Check if user is admin
                $isAdmin = false;

                if ($user->role && $user->role->name === 'admin') {
                    $isAdmin = true;
                }

                try {
                    if ($user->hasPermission('teaching_assignments', 'view')) {
                        $isAdmin = true;
                    }
                } catch (\Exception $e) {
                    \Log::warning('hasPermission check failed in getUpcoming: ' . $e->getMessage());
                }

                // Only apply filtering if NOT admin
                if (!$isAdmin) {
                    // Check if user has direct lecturer_id
                    if ($user->lecturer_id) {
                        $query->where('lecturer_id', $user->lecturer_id);
                    } else {
                        // Fallback: Try to match by name
                        $lecturer = \App\Models\Lecturer::where('hoTen', $user->name)->first();

                        if ($lecturer) {
                            $query->where('lecturer_id', $lecturer->id);
                        } else {
                            // Check if user is a student
                            $student = \DB::table('students')
                                ->where('email', $user->email)
                                ->orWhereRaw("CONCAT(hoDem, ' ', ten) = ?", [$user->name])
                                ->first();

                            if ($student && $student->idLop) {
                                $lop = \App\Models\classes::find($student->idLop);
                                if ($lop) {
                                    $query->where(function($q) use ($lop) {
                                        $q->where('class_name', $lop->class_name)
                                          ->orWhere('lop_id', $lop->id)
                                          ->orWhere('class_id', $lop->id);
                                    });
                                }
                            } else {
                                // User is neither lecturer nor student, return empty results
                                $query->whereRaw('1 = 0');
                            }
                        }
                    }
                }
            }

            $assignments = $query->get();

            return response()->json([
                'success' => true,
                'data' => $assignments
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getUpcoming: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming schedules',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get today's teaching assignments (for notifications)
     */
    public function getToday(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $today = now()->format('Y-m-d');
            $dayOfWeek = now()->dayOfWeek; // 0 = Sunday, 6 = Saturday

            // Convert to our format
            $dayName = null;
            if ($dayOfWeek === 6) {
                $dayName = 'saturday';
            } elseif ($dayOfWeek === 0) {
                $dayName = 'sunday';
            }

            $query = TeachingAssignment::with('lecturer')
                ->where('start_date', '<=', $today)
                ->where('end_date', '>=', $today)
                ->whereIn('status', ['scheduled', 'ongoing'])
                ->orderBy('start_time');

            if ($dayName) {
                $query->where('day_of_week', $dayName);
            }

            // Role-based filtering - ONLY for non-admin users
            if ($user) {
                // Eager load role to avoid N+1 queries
                if (!$user->relationLoaded('role')) {
                    $user->load('role');
                }

                // Check if user is admin
                $isAdmin = false;

                if ($user->role && $user->role->name === 'admin') {
                    $isAdmin = true;
                }

                try {
                    if ($user->hasPermission('teaching_assignments', 'view')) {
                        $isAdmin = true;
                    }
                } catch (\Exception $e) {
                    // If hasPermission fails, continue with non-admin flow
                    \Log::warning('hasPermission check failed: ' . $e->getMessage());
                }

                // Only apply filtering if NOT admin
                if (!$isAdmin) {
                    // Check if user has direct lecturer_id
                    if ($user->lecturer_id) {
                        $query->where('lecturer_id', $user->lecturer_id);
                    } else {
                        // Fallback: Try to match by name
                        $lecturer = \App\Models\Lecturer::where('hoTen', $user->name)->first();

                        if ($lecturer) {
                            $query->where('lecturer_id', $lecturer->id);
                        } else {
                            // Check if user is a student
                            $student = \DB::table('students')
                                ->where('email', $user->email)
                                ->orWhereRaw("CONCAT(hoDem, ' ', ten) = ?", [$user->name])
                                ->first();

                            if ($student && $student->idLop) {
                                $lop = \App\Models\classes::find($student->idLop);
                                if ($lop) {
                                    $query->where(function($q) use ($lop) {
                                        $q->where('class_name', $lop->class_name)
                                          ->orWhere('lop_id', $lop->id)
                                          ->orWhere('class_id', $lop->id);
                                    });
                                }
                            } else {
                                // User is neither lecturer nor student, return empty results
                                $query->whereRaw('1 = 0');
                            }
                        }
                    }
                }
            }

            $assignments = $query->get();

            return response()->json([
                'success' => true,
                'data' => $assignments,
                'today' => $today,
                'day_of_week' => $dayName
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getToday: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch today schedules',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
