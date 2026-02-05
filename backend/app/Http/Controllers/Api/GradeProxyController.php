<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GradeProxyController extends Controller
{
    /**
     * External API base URL
     */
    private const EXTERNAL_API_BASE = 'http://203.162.246.113:8088';

    /**
     * Get grades by student code (maHV) from external API
     * Acts as a proxy to bypass CORS issues
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGradesByMaHV(Request $request)
    {
        $maHV = $request->query('MaHV');

        if (!$maHV) {
            return response()->json([
                'success' => false,
                'message' => 'Mã học viên không được để trống',
                'data' => [],
            ], 400);
        }

        try {
            // Call external API
            $response = Http::timeout(10)
                ->get(self::EXTERNAL_API_BASE . '/DiemHocTap/TheoMaHV', [
                    'MaHV' => $maHV,
                ]);

            // Check if request was successful
            if (!$response->successful()) {
                Log::error('External API error', [
                    'maHV' => $maHV,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Không thể lấy điểm từ hệ thống bên ngoài',
                    'data' => [],
                ], $response->status());
            }

            // Get response data - external API returns array directly
            $data = $response->json();

            // Return data in consistent format
            return response()->json([
                'success' => true,
                'data' => is_array($data) ? $data : [$data],
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Connection timeout to external API', [
                'maHV' => $maHV,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Kết nối đến hệ thống điểm quá thời gian chờ',
                'data' => [],
            ], 504);

        } catch (\Exception $e) {
            Log::error('Error calling external API', [
                'maHV' => $maHV,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy điểm: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Health check for external API
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkApiHealth()
    {
        try {
            $response = Http::timeout(5)
                ->get(self::EXTERNAL_API_BASE . '/DiemHocTap/TheoMaHV', [
                    'MaHV' => 'TEST',
                ]);

            return response()->json([
                'success' => true,
                'message' => 'External API is reachable',
                'status' => $response->status(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'External API is not reachable',
                'error' => $e->getMessage(),
            ], 503);
        }
    }
}
