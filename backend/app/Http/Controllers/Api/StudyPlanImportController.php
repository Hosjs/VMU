<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class StudyPlanImportController extends Controller
{
    private const API_BASE_URL = 'http://203.162.246.113:8088/KeHoachDaoTao';
    private const EDUCATION_TYPES = [
        'thac-sy' => 'ThacSy',
        'tien-sy' => 'TienSy',
    ];

    /**
     * Import (preview) study plan from the previous semester/year for the same major.
     * Returns the external plan so the frontend can preview and let the user confirm save.
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'education_type' => 'required|string|in:thac-sy,tien-sy',
            'target_nam_vao' => 'required|integer|min:2000|max:2100',
            'ma_nganh' => 'required|string',
            'years_back' => 'nullable|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $sourceYear = $request->integer('target_nam_vao') - $request->integer('years_back', 1);
        $educationType = self::EDUCATION_TYPES[$request->input('education_type')];
        $url = sprintf(
            '%s/%s?NamVao=%d&MaNganh=%s',
            self::API_BASE_URL,
            $educationType,
            $sourceYear,
            $request->input('ma_nganh'),
        );

        try {
            $response = Http::timeout(30)->get($url);
            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể tải dữ liệu từ API ngoài',
                    'source_year' => $sourceYear,
                ], 502);
            }

            $data = $response->json() ?? [];
            return response()->json([
                'success' => true,
                'data' => [
                    'source_year' => $sourceYear,
                    'target_year' => $request->integer('target_nam_vao'),
                    'ma_nganh' => $request->input('ma_nganh'),
                    'items' => $data,
                    'count' => is_array($data) ? count($data) : 0,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi gọi API: ' . $e->getMessage(),
            ], 500);
        }
    }
}
