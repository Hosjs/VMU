<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExamScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ExamSchedule::with(['supervisor1:id,hoTen', 'supervisor2:id,hoTen'])
            ->orderBy('exam_start');

        if ($request->filled('khoa_hoc_id')) {
            $query->where('khoa_hoc_id', $request->integer('khoa_hoc_id'));
        }
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->integer('class_id'));
        }
        if ($request->filled('from')) {
            $query->where('exam_start', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->where('exam_start', '<=', $request->input('to'));
        }

        return response()->json($query->paginate($request->integer('per_page', 50)));
    }

    public function show(int $id): JsonResponse
    {
        $exam = ExamSchedule::with(['supervisor1:id,hoTen', 'supervisor2:id,hoTen'])
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $exam]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatePayload($request);
        $this->assertNoConflicts($data);

        $exam = ExamSchedule::create($data);

        return response()->json(['success' => true, 'data' => $exam], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $exam = ExamSchedule::findOrFail($id);
        $data = $this->validatePayload($request, $id);
        $this->assertNoConflicts(array_merge($exam->toArray(), $data), $id);

        $exam->update($data);

        return response()->json(['success' => true, 'data' => $exam]);
    }

    public function destroy(int $id): JsonResponse
    {
        ExamSchedule::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Đã xoá lịch thi']);
    }

    private function validatePayload(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'khoa_hoc_id' => 'required|exists:khoa_hoc,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'subject_name' => 'required|string|max:255',
            'class_id' => 'nullable',
            'class_name' => 'nullable|string|max:100',
            'exam_start' => 'required|date',
            'exam_end' => 'required|date|after:exam_start',
            'room_id' => 'nullable',
            'room' => 'nullable|string|max:100',
            'supervisor_1_id' => 'nullable|exists:lecturers,id',
            'supervisor_2_id' => 'nullable|exists:lecturers,id|different:supervisor_1_id',
            'exam_type' => ['required', Rule::in(['regular', 'retake', 'makeup'])],
            'note' => 'nullable|string|max:1000',
        ]);
    }

    /**
     * Business constraints that go beyond simple field rules:
     *   - A supervisor can't be in two rooms at the same time.
     *   - A class can't sit two exams at overlapping times.
     */
    private function assertNoConflicts(array $data, ?int $ignoreId = null): void
    {
        $start = $data['exam_start'];
        $end = $data['exam_end'];

        $overlap = fn ($query) => $query
            ->where('exam_start', '<', $end)
            ->where('exam_end', '>', $start);

        foreach (['supervisor_1_id', 'supervisor_2_id'] as $field) {
            if (!empty($data[$field])) {
                $exists = ExamSchedule::when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                    ->where(function ($q) use ($field, $data) {
                        $q->where('supervisor_1_id', $data[$field])
                          ->orWhere('supervisor_2_id', $data[$field]);
                    })
                    ->where($overlap)
                    ->exists();
                if ($exists) {
                    abort(response()->json([
                        'success' => false,
                        'message' => 'Giảng viên đã coi thi phòng khác trong khung giờ này',
                    ], 422));
                }
            }
        }

        if (!empty($data['class_id'])) {
            $exists = ExamSchedule::when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->where('class_id', $data['class_id'])
                ->where($overlap)
                ->exists();
            if ($exists) {
                abort(response()->json([
                    'success' => false,
                    'message' => 'Lớp đã có lịch thi môn khác trong khung giờ này',
                ], 422));
            }
        }
    }
}
