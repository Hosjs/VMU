<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email')
            ->orderByDesc('created_at');

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', $request->input('auditable_type'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }
        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        return response()->json($query->paginate($request->integer('per_page', 50)));
    }

    public function forEntity(Request $request, string $auditableType, int $auditableId): JsonResponse
    {
        // Map short names (e.g. "weekly_schedule") to FQCN to avoid exposing internals in URL.
        $map = [
            'weekly_schedule' => \App\Models\WeeklySchedule::class,
            'teaching_schedule' => \App\Models\TeachingSchedule::class,
            'exam_schedule' => \App\Models\ExamSchedule::class,
        ];
        $type = $map[$auditableType] ?? null;
        if (!$type) {
            return response()->json(['success' => false, 'message' => 'Unknown auditable type'], 404);
        }

        $logs = AuditLog::with('user:id,name,email')
            ->where('auditable_type', $type)
            ->where('auditable_id', $auditableId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }
}
