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
     */
    public function index(Request $request): JsonResponse
    {
        $query = TeachingAssignment::with('lecturer');

        // Apply filters
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
}
