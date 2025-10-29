<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    private $externalApiUrl = 'http://203.162.246.113:8088';

    /**
     * Lấy danh sách phòng học/lớp học
     * GET /api/rooms
     */
    public function index(Request $request)
    {
        try {
            $allRooms = [];

            // Lặp qua tất cả ID từ 3 đến 147 để lấy toàn bộ dữ liệu
            for ($id = 3; $id <= 147; $id++) {
                try {
                    $response = Http::timeout(10)->get("{$this->externalApiUrl}/LopHoc/MaLop", [
                        'ID' => $id
                    ]);

                    if ($response->successful()) {
                        $data = $response->json();

                        // API trả về array, merge vào danh sách tổng
                        if (is_array($data) && count($data) > 0) {
                            $allRooms = array_merge($allRooms, $data);
                        }
                    }
                } catch (\Exception $e) {
                    // Log lỗi nhưng tiếp tục với ID tiếp theo
                    Log::warning("Failed to fetch room with ID {$id}: " . $e->getMessage());
                    continue;
                }
            }

            // Loại bỏ trùng lặp dựa trên ID của room
            $uniqueRooms = [];
            $seenIds = [];

            foreach ($allRooms as $room) {
                if (!in_array($room['id'], $seenIds)) {
                    $uniqueRooms[] = $room;
                    $seenIds[] = $room['id'];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $uniqueRooms,
                'message' => 'Lấy danh sách phòng học thành công',
                'total' => count($uniqueRooms)
            ]);

        } catch (\Exception $e) {
            Log::error('Room API Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi lấy danh sách phòng học',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một phòng học
     * GET /api/rooms/{id}
     */
    public function show($id)
    {
        try {
            $response = Http::timeout(10)->get("{$this->externalApiUrl}/LopHoc/MaLop", [
                'ID' => $id
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy phòng học',
                ], 404);
            }

            $data = $response->json();

            // API trả về array, lấy phần tử đầu tiên
            $room = is_array($data) && count($data) > 0 ? $data[0] : null;

            if (!$room) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy phòng học',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $room,
                'message' => 'Lấy thông tin phòng học thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Room Detail API Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi lấy thông tin phòng học',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

