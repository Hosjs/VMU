<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrinhDoDaoTao;
use Illuminate\Http\JsonResponse;

class TrinhDoDaoTaoController extends Controller
{
    /**
     * Lấy danh sách trình độ đào tạo (dùng cho dropdown filter)
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $trinhDo = TrinhDoDaoTao::select('maTrinhDoDaoTao', 'tenTrinhDo')
                ->orderBy('tenTrinhDo', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $trinhDo,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải danh sách trình độ đào tạo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
