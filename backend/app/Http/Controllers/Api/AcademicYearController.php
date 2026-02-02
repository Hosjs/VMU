<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AcademicYearController extends Controller
{
    /**
     * Get all academic years (khoa hoc) that are currently in use
     */
    public function index()
    {
        try {
            // Get distinct academic years from classes table
            $years = DB::table('classes')
                ->select('khoaHoc_id as nam_hoc')
                ->whereNotNull('khoaHoc_id')
                ->whereNull('deleted_at')
                ->groupBy('khoaHoc_id')
                ->orderBy('khoaHoc_id', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->nam_hoc,
                        'nam_hoc' => $item->nam_hoc,
                        'ten_khoa_hoc' => 'Năm học ' . $item->nam_hoc . '-' . ($item->nam_hoc + 1),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $years,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching academic years: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách năm học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get active academic years (just the year numbers)
     */
    public function getActiveYears()
    {
        try {
            $years = DB::table('classes')
                ->select('khoaHoc_id')
                ->whereNotNull('khoaHoc_id')
                ->whereNull('deleted_at')
                ->groupBy('khoaHoc_id')
                ->orderBy('khoaHoc_id', 'desc')
                ->pluck('khoaHoc_id')
                ->map(function ($year) {
                    return (int) $year;
                })
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'years' => $years,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching active years: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách năm học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Create a new academic year with classes for selected majors
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nam_hoc' => 'required|integer|min:2000|max:2100',
            'major_ids' => 'array',
            'major_ids.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $namHoc = $request->nam_hoc;
            $majorIds = $request->major_ids ?? [];

            // Check if year already exists in classes
            $exists = DB::table('classes')
                ->where('khoaHoc_id', $namHoc)
                ->whereNull('deleted_at')
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Năm học này đã tồn tại',
                ], 400);
            }

            // Create classes for each selected major
            $createdClasses = [];

            if (!empty($majorIds)) {
                foreach ($majorIds as $maNganh) {
                    // Get major info
                    $major = DB::table('majors')
                        ->where('maNganh', $maNganh)
                        ->whereNull('deleted_in')
                        ->first();

                    if (!$major) {
                        \Log::warning("Major not found: {$maNganh}");
                        continue;
                    }

                    // Create class name based on major and year
                    // Format: [Major Code] [Year].1
                    $majorCode = $this->extractMajorCode($major->tenNganh);
                    $className = "{$majorCode} {$namHoc}.1";

                    // Check if class name already exists
                    $classExists = DB::table('classes')
                        ->where('class_name', $className)
                        ->whereNull('deleted_at')
                        ->exists();

                    if ($classExists) {
                        // Try with .2, .3, etc.
                        $counter = 2;
                        while ($classExists && $counter <= 10) {
                            $className = "{$majorCode} {$namHoc}.{$counter}";
                            $classExists = DB::table('classes')
                                ->where('class_name', $className)
                                ->whereNull('deleted_at')
                                ->exists();
                            $counter++;
                        }
                    }

                    // Insert new class
                    $classId = DB::table('classes')->insertGetId([
                        'class_name' => $className,
                        'major_id' => $major->id,
                        'khoaHoc_id' => $namHoc,
                        'maTrinhDoDaoTao' => 'DaiHoc', // Default to DaiHoc
                        'trangThai' => 'DangHoc',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $createdClasses[] = [
                        'id' => $classId,
                        'name' => $className,
                        'major' => $major->tenNganh,
                    ];

                    \Log::info("Created class: {$className} (ID: {$classId})");
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $namHoc,
                    'nam_hoc' => $namHoc,
                    'ten_khoa_hoc' => 'Năm học ' . $namHoc . '-' . ($namHoc + 1),
                    'classes_created' => count($createdClasses),
                    'classes' => $createdClasses,
                ],
                'message' => count($createdClasses) > 0
                    ? "Năm học mới đã được thêm vào hệ thống với " . count($createdClasses) . " lớp học"
                    : "Năm học mới đã được thêm vào hệ thống",
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error creating academic year: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo năm học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Extract major code from major name
     * Example: "Công nghệ thông tin" -> "CNTT"
     */
    private function extractMajorCode($tenNganh)
    {
        // Map of common major names to codes
        $majorCodes = [
            'Công nghệ thông tin' => 'CNTT',
            'Quản lý kinh tế' => 'QLKT',
            'Quản lý tài chính' => 'QLTC',
            'Quản lý vận tải' => 'QLVT',
            'Quản lý môi trường' => 'QLMT',
            'Quản lý sản xuất' => 'QLSX',
            'Kỹ thuật tàu thủy' => 'KTTT',
            'Kỹ thuật điện tử' => 'KTĐT',
            'Kỹ thuật xây dựng' => 'KTXD',
            'Kỹ thuật môi trường' => 'KTMT',
            'Kỹ thuật điều khiển' => 'KTĐH',
        ];

        // Try to find exact match
        if (isset($majorCodes[$tenNganh])) {
            return $majorCodes[$tenNganh];
        }

        // Try partial match
        foreach ($majorCodes as $name => $code) {
            if (stripos($tenNganh, $name) !== false) {
                return $code;
            }
        }

        // If no match, create code from first letters
        $words = explode(' ', $tenNganh);
        $code = '';
        foreach ($words as $word) {
            if (strlen($word) > 0 && $word !== '-') {
                $code .= strtoupper(mb_substr($word, 0, 1));
            }
        }

        return $code ?: 'LH'; // Default to 'LH' (Lớp Học)
    }

    /**
     * Delete an academic year
     * This will only work if no classes are using this year
     */
    public function destroy($id)
    {
        try {
            // Check if any classes are using this year
            $count = DB::table('classes')
                ->where('khoaHoc_id', $id)
                ->whereNull('deleted_at')
                ->count();

            if ($count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Không thể xóa năm học này vì đang có {$count} lớp học sử dụng",
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Năm học đã được xóa thành công',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting academic year: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa năm học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
