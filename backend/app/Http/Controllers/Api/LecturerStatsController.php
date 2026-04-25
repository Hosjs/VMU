<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LecturerAbsence;
use App\Models\WeeklySchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LecturerStatsController extends Controller
{
    public function teachingStats(Request $request, int $id): JsonResponse
    {
        $khoaHocId = $request->input('khoa_hoc_id');

        $base = WeeklySchedule::where('lecturer_id', $id);
        if ($khoaHocId) {
            $base->where('khoa_hoc_id', $khoaHocId);
        }

        $totalSessions = (clone $base)->count();

        $bySubject = (clone $base)
            ->selectRaw('subject_id, subject_name, COUNT(*) as sessions')
            ->groupBy('subject_id', 'subject_name')
            ->get();

        $byClass = (clone $base)
            ->selectRaw('class_id, COUNT(*) as sessions')
            ->whereNotNull('class_id')
            ->groupBy('class_id')
            ->with('class:id,class_name')
            ->get()
            ->map(fn ($row) => [
                'class_id' => $row->class_id,
                'class_name' => $row->class?->class_name,
                'sessions' => $row->sessions,
            ]);

        $absences = LecturerAbsence::where('lecturer_id', $id)
            ->orderByDesc('absence_date')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_sessions' => $totalSessions,
                'by_subject' => $bySubject,
                'by_class' => $byClass,
                'absences' => $absences,
                'absences_count' => $absences->count(),
            ],
        ]);
    }
}
