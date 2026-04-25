<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklySchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassStatsController extends Controller
{
    public function studyStats(Request $request, int $id): JsonResponse
    {
        $khoaHocId = $request->input('khoa_hoc_id');

        $base = WeeklySchedule::where('class_id', $id);
        if ($khoaHocId) {
            $base->where('khoa_hoc_id', $khoaHocId);
        }

        $totalSessions = (clone $base)->count();

        $bySubject = (clone $base)
            ->selectRaw('subject_id, subject_name, COUNT(*) as sessions')
            ->groupBy('subject_id', 'subject_name')
            ->orderByDesc('sessions')
            ->get();

        $byLecturer = (clone $base)
            ->selectRaw('lecturer_id, lecturer_name, COUNT(*) as sessions')
            ->groupBy('lecturer_id', 'lecturer_name')
            ->orderByDesc('sessions')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_sessions' => $totalSessions,
                'by_subject' => $bySubject,
                'by_lecturer' => $byLecturer,
            ],
        ]);
    }
}
