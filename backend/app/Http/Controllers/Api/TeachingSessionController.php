<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeachingSession;
use App\Models\TeachingAssignment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TeachingSessionController extends Controller
{
    /**
     * Lấy danh sách sessions với filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = TeachingSession::with(['teachingAssignment', 'lecturer']);

            // Filter by lecturer
            if ($request->has('lecturer_id')) {
                $query->byLecturer($request->lecturer_id);
            }

            // Filter by date range
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->dateRange($request->start_date, $request->end_date);
            }

            // Filter by status
            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            // Filter by teaching_assignment_id
            if ($request->has('teaching_assignment_id')) {
                $query->where('teaching_assignment_id', $request->teaching_assignment_id);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'session_date');
            $sortDirection = $request->get('sort_direction', 'asc');
            $query->orderBy($sortBy, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $sessions = $query->paginate($perPage);

            return response()->json($sessions);
        } catch (\Exception $e) {
            \Log::error('Error fetching sessions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sessions'
            ], 500);
        }
    }

    /**
     * Lấy chi tiết 1 session
     */
    public function show(int $id): JsonResponse
    {
        $session = TeachingSession::with(['teachingAssignment', 'lecturer'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $session
        ]);
    }

    /**
     * Tạo session mới
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'teaching_assignment_id' => 'required|exists:teaching_assignments,id',
            'session_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:50',
            'session_number' => 'nullable|integer|min:1',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled,rescheduled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Auto-fill lecturer_id from parent assignment if not provided
        if (!$request->has('lecturer_id')) {
            $assignment = TeachingAssignment::find($request->teaching_assignment_id);
            $request->merge(['lecturer_id' => $assignment->lecturer_id]);
        }

        $session = TeachingSession::create($request->all());
        $session->load(['teachingAssignment', 'lecturer']);

        return response()->json([
            'success' => true,
            'message' => 'Tạo buổi học thành công',
            'data' => $session
        ], 201);
    }

    /**
     * Cập nhật session (đổi lịch, đổi phòng, v.v.)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $session = TeachingSession::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'session_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i',
            'room' => 'nullable|string|max:50',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled,rescheduled',
            'notes' => 'nullable|string',
            'cancellation_reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $session->update($request->all());
        $session->load(['teachingAssignment', 'lecturer']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật buổi học thành công',
            'data' => $session
        ]);
    }

    /**
     * Xóa session
     */
    public function destroy(int $id): JsonResponse
    {
        $session = TeachingSession::findOrFail($id);
        $session->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa buổi học thành công'
        ]);
    }

    /**
     * Tạo sessions tự động từ teaching_assignment
     * Tạo tất cả các buổi học dựa trên start_date, end_date và day_of_week
     */
    public function generateSessions(Request $request, int $assignmentId): JsonResponse
    {
        try {
            $assignment = TeachingAssignment::findOrFail($assignmentId);

            // Check if sessions already exist
            $existingCount = TeachingSession::where('teaching_assignment_id', $assignmentId)->count();
            if ($existingCount > 0 && !$request->has('force')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sessions already exist. Use force=true to regenerate.'
                ], 400);
            }

            // Delete existing sessions if force=true
            if ($request->has('force') && $request->force) {
                TeachingSession::where('teaching_assignment_id', $assignmentId)->delete();
            }

            // Generate sessions
            $sessions = $this->createSessionsForAssignment($assignment);

            return response()->json([
                'success' => true,
                'message' => "Đã tạo {$sessions->count()} buổi học",
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            \Log::error('Error generating sessions: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate sessions'
            ], 500);
        }
    }

    /**
     * Helper: Tạo sessions cho 1 assignment
     */
    private function createSessionsForAssignment(TeachingAssignment $assignment)
    {
        $sessions = collect();
        $currentDate = $assignment->start_date->copy();
        $sessionNumber = 1;

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

        $targetDay = $dayMapping[$assignment->day_of_week];

        while ($currentDate <= $assignment->end_date) {
            // Check if current date matches target day of week
            if ($currentDate->dayOfWeek === $targetDay) {
                $session = TeachingSession::create([
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

                $sessions->push($session);
                $sessionNumber++;
            }

            $currentDate->addDay();
        }

        return $sessions;
    }

    /**
     * Tự động cập nhật trạng thái các buổi học đã qua
     * Bao gồm cả sessions có status "scheduled" và "rescheduled"
     */
    private function autoUpdatePastSessions(): void
    {
        try {
            $today = now()->format('Y-m-d');

            // Update past sessions to completed (both scheduled and rescheduled)
            TeachingSession::where('session_date', '<', $today)
                ->whereIn('status', ['scheduled', 'rescheduled'])
                ->update(['status' => 'completed']);

            // Check each teaching assignment to see if all sessions are completed
            $assignments = TeachingAssignment::whereHas('sessions')->get();

            foreach ($assignments as $assignment) {
                $totalSessions = $assignment->sessions()->count();
                $completedSessions = $assignment->sessions()->where('status', 'completed')->count();

                // If all sessions are completed, mark assignment as in_exam
                if ($totalSessions > 0 && $totalSessions === $completedSessions) {
                    if ($assignment->status !== 'in_exam' && $assignment->status !== 'paid') {
                        $assignment->update(['status' => 'in_exam']);
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error auto-updating past sessions: ' . $e->getMessage());
        }
    }
}
