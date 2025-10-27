<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NganhHocController extends Controller
{
    private const EXTERNAL_API_URL = 'http://203.162.246.113:8088';

    /**
     * Proxy: Lấy danh sách ngành học từ API external
     *
     * @return JsonResponse
     */
    public function getDanhSach(): JsonResponse
    {
        try {
            $response = Http::timeout(10)
                ->get(self::EXTERNAL_API_URL . '/NganhHoc/DanhSach');

            if ($response->failed()) {
                Log::error('External API failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Không thể kết nối đến API ngành học',
                    'data' => [],
                ], 500);
            }

            $data = $response->json();

            // Xử lý các format response khác nhau
            if (is_array($data)) {
                $nganhHocList = $data;
            } elseif (isset($data['data']) && is_array($data['data'])) {
                $nganhHocList = $data['data'];
            } elseif (isset($data['success']) && isset($data['data'])) {
                $nganhHocList = $data['data'];
            } else {
                $nganhHocList = [];
            }

            return response()->json([
                'success' => true,
                'data' => $nganhHocList,
                'message' => 'Lấy danh sách ngành học thành công',
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching ngành học from external API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống khi tải danh sách ngành học',
                'error' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Lấy chi tiết ngành học theo mã
     *
     * @param string $maNganh
     * @return JsonResponse
     */
    public function show(string $maNganh): JsonResponse
    {
        try {
            $response = Http::timeout(10)
                ->get(self::EXTERNAL_API_URL . '/NganhHoc/DanhSach');

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể kết nối đến API ngành học',
                ], 500);
            }

            $data = $response->json();
            $nganhHocList = is_array($data) ? $data : ($data['data'] ?? []);

            $nganhHoc = collect($nganhHocList)->firstWhere('maNganh', $maNganh);

            if (!$nganhHoc) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy ngành học',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $nganhHoc,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching ngành học detail', [
                'maNganh' => $maNganh,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

