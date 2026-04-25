<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeeklySchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Return upcoming weekly + exam schedules for the current user.
     * Time window defaults to the next 24 hours but caller can pass ?hours=N.
     */
    public function upcomingSchedules(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $hours = max(1, min((int) $request->input('hours', 24), 24 * 14));
        $now = Carbon::now();
        $horizon = $now->copy()->addHours($hours);

        $lecturerId = $user->lecturer_id ?? null;

        $weekly = collect();
        if ($lecturerId) {
            // weekly_schedules don't carry a concrete datetime column; we match by week + day label
            // when available. To keep the endpoint useful without schema change, return the next N
            // rows for this lecturer in the active term (client can filter by time_slot text).
            $weekly = WeeklySchedule::where('lecturer_id', $lecturerId)
                ->orderByDesc('id')
                ->limit(20)
                ->get(['id', 'subject_name', 'time_slot', 'room', 'week_number', 'khoa_hoc_id']);
        }

        $exams = collect();
        if (class_exists(\App\Models\ExamSchedule::class)) {
            $query = \App\Models\ExamSchedule::whereBetween('exam_start', [$now, $horizon])
                ->orderBy('exam_start');
            if ($lecturerId) {
                $query->where(function ($q) use ($lecturerId) {
                    $q->where('supervisor_1_id', $lecturerId)
                      ->orWhere('supervisor_2_id', $lecturerId);
                });
            }
            $exams = $query->get();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'now' => $now->toIso8601String(),
                'horizon' => $horizon->toIso8601String(),
                'weekly_hint' => $weekly,
                'exams' => $exams,
                'total' => $weekly->count() + $exams->count(),
            ],
        ]);
    }
}
