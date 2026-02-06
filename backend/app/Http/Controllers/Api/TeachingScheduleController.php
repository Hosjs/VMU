<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeachingSchedule;
use App\Models\Major;
use App\Models\KhoaHoc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TeachingScheduleController extends Controller
{
    /**
     * Get all teaching schedules with filters
     */
    public function index(Request $request)
    {
        try {
            $query = TeachingSchedule::with(['major', 'khoaHoc']);

            // Filter by semester code
            if ($request->has('semester_code') && $request->semester_code) {
                $query->bySemesterCode($request->semester_code);
            }

            // Filter by major
            if ($request->has('major_id') && $request->major_id) {
                $query->byMajor($request->major_id);
            }

            // Filter by khoa hoc
            if ($request->has('khoa_hoc_id') && $request->khoa_hoc_id) {
                $query->byKhoaHoc($request->khoa_hoc_id);
            }

            // Order by stt
            $query->orderBy('stt', 'asc');

            $schedules = $query->get();

            return response()->json([
                'success' => true,
                'data' => $schedules,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách lịch giảng dạy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single teaching schedule
     */
    public function show($id)
    {
        try {
            $schedule = TeachingSchedule::with(['major', 'khoaHoc'])->find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch giảng dạy',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $schedule,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin lịch giảng dạy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk save teaching schedules (for DataGrid)
     */
    public function bulkSave(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'major_id' => 'required|exists:majors,id',
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'semester_code' => 'required|string|max:50',
            'schedules' => 'required|array|min:1',
            'schedules.*.stt' => 'required|integer',
            'schedules.*.ten_hoc_phan' => 'required|string|max:255',
            'schedules.*.so_tin_chi' => 'required|integer|min:1',
            'schedules.*.can_bo_giang_day' => 'required|string|max:500',
            'schedules.*.tuan' => 'nullable|string|max:100',
            'schedules.*.ngay' => 'nullable|string|max:255',
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

            $majorId = $request->major_id;
            $khoaHocId = $request->khoa_hoc_id;
            $semesterCode = $request->semester_code;

            // Delete existing schedules for this semester code, major and khoa hoc
            TeachingSchedule::where('semester_code', $semesterCode)
                ->where('major_id', $majorId)
                ->where('khoa_hoc_id', $khoaHocId)
                ->delete();

            // Insert new schedules
            $savedSchedules = [];
            foreach ($request->schedules as $scheduleData) {
                $schedule = TeachingSchedule::create([
                    'major_id' => $majorId,
                    'khoa_hoc_id' => $khoaHocId,
                    'semester_code' => $semesterCode,
                    'stt' => $scheduleData['stt'],
                    'ten_hoc_phan' => $scheduleData['ten_hoc_phan'],
                    'so_tin_chi' => $scheduleData['so_tin_chi'],
                    'can_bo_giang_day' => $scheduleData['can_bo_giang_day'],
                    'tuan' => $scheduleData['tuan'] ?? null,
                    'ngay' => $scheduleData['ngay'] ?? null,
                    'ghi_chu' => $scheduleData['ghi_chu'] ?? null,
                ]);
                $savedSchedules[] = $schedule;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lưu lịch giảng dạy thành công',
                'data' => $savedSchedules,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lưu lịch giảng dạy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a single teaching schedule
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'stt' => 'sometimes|integer',
            'ten_hoc_phan' => 'sometimes|string|max:255',
            'so_tin_chi' => 'sometimes|integer|min:1',
            'can_bo_giang_day' => 'sometimes|string|max:500',
            'tuan' => 'nullable|string|max:100',
            'ngay' => 'nullable|string|max:255',
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
            $schedule = TeachingSchedule::find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch giảng dạy',
                ], 404);
            }

            $schedule->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật lịch giảng dạy thành công',
                'data' => $schedule->load(['major', 'khoaHoc']),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật lịch giảng dạy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a teaching schedule
     */
    public function destroy($id)
    {
        try {
            $schedule = TeachingSchedule::find($id);

            if (!$schedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy lịch giảng dạy',
                ], 404);
            }

            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa lịch giảng dạy thành công',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa lịch giảng dạy',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get unique semester codes
     */
    public function getSemesterCodes()
    {
        try {
            $semesterCodes = TeachingSchedule::select('semester_code')
                ->distinct()
                ->orderBy('semester_code', 'desc')
                ->pluck('semester_code');

            return response()->json([
                'success' => true,
                'data' => $semesterCodes,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách mã kỳ học',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
