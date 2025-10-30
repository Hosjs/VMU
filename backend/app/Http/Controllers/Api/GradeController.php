<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GradeController extends Controller
{
    public function getGradesByMaHV(Request $request)
    {
        $maHV = $request->query('MaHV');

        if (!$maHV) {
            return response()->json(['error' => 'MaHV is required'], 400);
        }

        $response = Http::get("http://203.162.246.113:8088/DiemHocTap/TheoMaHV", [
            'MaHV' => $maHV,
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to fetch data from external API'], $response->status());
        }

        $data = $response->json();
        // Nếu API trả về object có key 'data', lấy đúng mảng đó
        if (is_array($data) && isset($data['data'])) {
            return response()->json($data['data']);
        }
        // Nếu API trả về mảng trực tiếp
        if (is_array($data)) {
            return response()->json($data);
        }
        // Nếu không có dữ liệu, trả về mảng rỗng
        return response()->json([]);
    }
}
