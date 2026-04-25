<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LecturerAbsence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LecturerAbsenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LecturerAbsence::with(['lecturer:id,hoTen', 'recorder:id,name'])
            ->orderByDesc('absence_date');

        if ($request->filled('lecturer_id')) {
            $query->where('lecturer_id', $request->integer('lecturer_id'));
        }
        if ($request->filled('from')) {
            $query->where('absence_date', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->where('absence_date', '<=', $request->date('to'));
        }

        return response()->json($query->paginate($request->integer('per_page', 25)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lecturer_id' => 'required|exists:lecturers,id',
            'absence_date' => 'required|date',
            'reason' => 'required|in:sick,personal,official,other',
            'note' => 'nullable|string|max:1000',
            'weekly_schedule_id' => 'nullable|exists:weekly_schedules,id',
        ]);
        $data['recorded_by'] = $request->user()?->id;
        $absence = LecturerAbsence::create($data);

        return response()->json([
            'success' => true,
            'data' => $absence->load('lecturer:id,hoTen'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $absence = LecturerAbsence::findOrFail($id);
        $data = $request->validate([
            'absence_date' => 'sometimes|date',
            'reason' => 'sometimes|in:sick,personal,official,other',
            'note' => 'nullable|string|max:1000',
        ]);
        $absence->update($data);

        return response()->json(['success' => true, 'data' => $absence]);
    }

    public function destroy(int $id): JsonResponse
    {
        LecturerAbsence::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Đã xoá bản ghi nghỉ']);
    }
}
