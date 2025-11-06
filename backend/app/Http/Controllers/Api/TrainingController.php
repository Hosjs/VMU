<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class TrainingController extends Controller
{
    private const API_BASE_URL = 'http://203.162.246.113:8088/KeHoachDaoTao';

    private const EDUCATION_TYPES = [
        'thac-sy' => 'ThacSy',
        'tien-sy' => 'TienSy'
    ];

    /**
     * Get training plan (course registrations)
     */
    public function getCourseRegistrations(Request $request): JsonResponse
    {
        return $this->fetchTrainingData($request);
    }

    /**
     * Get study plans
     */
    public function getStudyPlans(Request $request): JsonResponse
    {
        return $this->fetchTrainingData($request);
    }

    /**
     * Private method to fetch training data from external API
     */
    private function fetchTrainingData(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'education_type' => 'required|string|in:thac-sy,tien-sy',
            'nam_vao' => 'required|integer|min:2000|max:2100',
            'ma_nganh' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $educationType = self::EDUCATION_TYPES[$request->education_type];
            $url = sprintf(
                '%s/%s?NamVao=%d&MaNganh=%s',
                self::API_BASE_URL,
                $educationType,
                $request->nam_vao,
                $request->ma_nganh
            );

            $response = Http::timeout(30)->get($url);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch training plan from external API',
                    'data' => []
                ], $response->status());
            }

            $data = $response->json();

            return response()->json([
                'success' => true,
                'data' => $data ?? [],
                'meta' => [
                    'education_type' => $request->education_type,
                    'nam_vao' => $request->nam_vao,
                    'ma_nganh' => $request->ma_nganh,
                    'total' => is_array($data) ? count($data) : 0
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching training plan',
                'error' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get available education types
     */
    public function getEducationTypes(): JsonResponse
    {
        $data = [];
        foreach (self::EDUCATION_TYPES as $key => $value) {
            $data[] = [
                'key' => $key,
                'value' => $value,
                'label' => $key === 'thac-sy' ? 'Thạc sỹ' : 'Tiến sỹ'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get available years
     */
    public function getAvailableYears(): JsonResponse
    {
        $currentYear = (int) date('Y');
        $years = [];

        for ($year = $currentYear; $year >= 2000; $year--) {
            $years[] = [
                'value' => $year,
                'label' => (string) $year
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $years
        ]);
    }
}
