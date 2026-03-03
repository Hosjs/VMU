<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklySchedule;
use App\Models\classes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class WeeklyScheduleController extends Controller
{
    /**
     * Get all weekly schedules with filters
     */
    public function index(Request $request)
    {
        try {
            // Use separate with() calls to make debugging easier
            $query = WeeklySchedule::with([
                'class',
                'khoaHoc',
                'subject',
                'lecturer'
            ]);

            // Filter by khoa_hoc_id
            if ($request->has('khoa_hoc_id') && $request->khoa_hoc_id) {
                $query->byKhoaHoc($request->khoa_hoc_id);
            }

            // Filter by week_number
            if ($request->has('week_number') && $request->week_number) {
                $query->byWeekNumber($request->week_number);
            }

            // Filter by class_id
            if ($request->has('class_id') && $request->class_id) {
                $query->byClass($request->class_id);
            }

            // Filter by multiple class_ids (comma-separated)
            if ($request->has('class_ids') && $request->class_ids) {
                $classIds = explode(',', $request->class_ids);
                $query->byClasses($classIds);
            }

            // Sort by stt
            $query->orderBy('stt', 'asc');

            $schedules = $query->get();

            // Try to load nested relationships (optional, may fail if data is incomplete)
            try {
                $schedules->load('class.major', 'class.khoaHoc');
            } catch (\Exception $e) {
                \Log::warning('Could not load nested relationships for weekly schedules: ' . $e->getMessage());
                // Continue without nested relationships
            }

            return response()->json([
                'success' => true,
                'data' => $schedules,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error in WeeklyScheduleController@index: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách lịch học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get a single weekly schedule
     */
    public function show($id)
    {
        try {
            $schedule = WeeklySchedule::with(['class', 'class.major', 'class.khoaHoc', 'subject', 'lecturer'])->find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch học',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $schedule,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin lịch học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk save weekly schedules for a specific week and class(es)
     */
    public function bulkSave(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'week_number' => 'required|string|max:20',
            'khoa_hoc_id' => 'required|integer|exists:khoa_hoc,id',
            'schedules' => 'required|array|min:1',
            'schedules.*.stt' => 'required|integer',
            'schedules.*.class_ids' => 'required|array|min:1',
            'schedules.*.class_ids.*' => 'required|integer|exists:classes,id',
            'schedules.*.subject_name' => 'nullable|string|max:255',
            'schedules.*.lecturer_name' => 'nullable|string|max:255',
            'schedules.*.time_slot' => 'nullable|string|max:255',
            'schedules.*.room' => 'nullable|string|max:100',
            'schedules.*.ghi_chu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $weekNumber = $request->week_number;
            $khoaHocId = $request->khoa_hoc_id;
            $schedulesData = $request->schedules;

            // Collect all class_ids to delete existing schedules
            $allClassIds = [];
            foreach ($schedulesData as $scheduleData) {
                $allClassIds = array_merge($allClassIds, $scheduleData['class_ids']);
            }
            $allClassIds = array_unique($allClassIds);

            // Delete existing schedules for this week, semester and all classes
            WeeklySchedule::where('week_number', $weekNumber)
                ->where('khoa_hoc_id', $khoaHocId)
                ->whereIn('class_id', $allClassIds)
                ->delete();

            // Create new schedules - each row has its own class_ids
            $createdSchedules = [];
            foreach ($schedulesData as $scheduleData) {
                $rowClassIds = $scheduleData['class_ids'];

                foreach ($rowClassIds as $classId) {
                    $schedule = WeeklySchedule::create([
                        'stt' => $scheduleData['stt'],
                        'week_number' => $weekNumber,
                        'khoa_hoc_id' => $khoaHocId,
                        'class_id' => $classId,
                        'subject_id' => $scheduleData['subject_id'] ?? null,
                        'subject_name' => $scheduleData['subject_name'] ?? null,
                        'lecturer_id' => $scheduleData['lecturer_id'] ?? null,
                        'lecturer_name' => $scheduleData['lecturer_name'] ?? null,
                        'time_slot' => $scheduleData['time_slot'] ?? null,
                        'room' => $scheduleData['room'] ?? null,
                        'ghi_chu' => $scheduleData['ghi_chu'] ?? null,
                    ]);

                    $createdSchedules[] = $schedule;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lưu lịch học thành công',
                'data' => $createdSchedules,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu lịch học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a single weekly schedule
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stt' => 'sometimes|required|integer',
            'week_number' => 'sometimes|required|string|max:20',
            'class_id' => 'sometimes|required|integer|exists:classes,id',
            'subject_id' => 'nullable|integer',
            'subject_name' => 'nullable|string|max:255',
            'lecturer_id' => 'nullable|integer',
            'lecturer_name' => 'nullable|string|max:255',
            'time_slot' => 'nullable|string|max:255',
            'room' => 'nullable|string|max:100',
            'ghi_chu' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $schedule = WeeklySchedule::find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch học',
                ], 404);
            }

            $schedule->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật lịch học thành công',
                'data' => $schedule->load(['class', 'subject', 'lecturer']),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật lịch học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete weekly schedules by class (soft delete)
     * Used when removing a class from a specific week schedule
     */
    public function deleteByClass(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'week_number' => 'required|string',
            'khoa_hoc_id' => 'required|integer',
            'class_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $deletedCount = WeeklySchedule::where('week_number', $request->week_number)
                ->where('khoa_hoc_id', $request->khoa_hoc_id)
                ->where('class_id', $request->class_id)
                ->delete(); // This is soft delete because model uses SoftDeletes trait

            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$deletedCount} lịch học của lớp",
                'deleted_count' => $deletedCount,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa lịch học theo lớp',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a weekly schedule
     */
    public function destroy($id)
    {
        try {
            $schedule = WeeklySchedule::find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch học',
                ], 404);
            }

            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa lịch học thành công',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa lịch học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available week numbers
     */
    public function getWeekNumbers()
    {
        try {
            $weekNumbers = WeeklySchedule::select('week_number')
                ->distinct()
                ->orderBy('week_number', 'asc')
                ->pluck('week_number');

            return response()->json([
                'success' => true,
                'data' => $weekNumbers,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách tuần',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get week list for a specific khoa_hoc (semester)
     * Calculates weeks based on start and end dates
     */
    public function getWeeksBySemester(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'khoa_hoc_id' => 'required|integer|exists:khoa_hoc,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $khoaHoc = \App\Models\KhoaHoc::find($request->khoa_hoc_id);

            if (!$khoaHoc || !$khoaHoc->ngay_bat_dau || !$khoaHoc->ngay_ket_thuc) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kỳ học không có ngày bắt đầu hoặc kết thúc',
                ], 400);
            }

            $startDate = \Carbon\Carbon::parse($khoaHoc->ngay_bat_dau);
            $endDate = \Carbon\Carbon::parse($khoaHoc->ngay_ket_thuc);

            // Calculate total weeks
            $totalWeeks = $startDate->diffInWeeks($endDate) + 1;

            // Generate week list
            $weeks = [];
            for ($i = 1; $i <= $totalWeeks; $i++) {
                $weekStartDate = $startDate->copy()->addWeeks($i - 1);
                $weekEndDate = $weekStartDate->copy()->endOfWeek();

                // Make sure end date doesn't exceed semester end date
                if ($weekEndDate->greaterThan($endDate)) {
                    $weekEndDate = $endDate->copy();
                }

                $weeks[] = [
                    'week_number' => $i,
                    'week_label' => "Tuần {$i}",
                    'start_date' => $weekStartDate->format('Y-m-d'),
                    'end_date' => $weekEndDate->format('Y-m-d'),
                    'display_label' => "Tuần {$i} ({$weekStartDate->format('d/m')} - {$weekEndDate->format('d/m')})",
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'khoa_hoc' => [
                        'id' => $khoaHoc->id,
                        'ma_khoa_hoc' => $khoaHoc->ma_khoa_hoc,
                        'ngay_bat_dau' => $khoaHoc->ngay_bat_dau->format('Y-m-d'),
                        'ngay_ket_thuc' => $khoaHoc->ngay_ket_thuc->format('Y-m-d'),
                    ],
                    'total_weeks' => $totalWeeks,
                    'weeks' => $weeks,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tính danh sách tuần',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
