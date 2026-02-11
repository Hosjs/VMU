<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MajorSubject;
use App\Models\Major;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MajorSubjectController extends Controller
{
    /**
     * Get list of major-subjects with pagination, search, and filters
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('major_subjects as ms')
                ->join('majors as m', 'ms.major_id', '=', 'm.id')
                ->join('subjects as s', 'ms.subject_id', '=', 's.id')
                ->whereNull('m.deleted_in')
                ->select(
                    'ms.id',
                    'ms.major_id',
                    'ms.subject_id',
                    'm.maNganh',
                    'm.tenNganh',
                    's.maMon',
                    's.tenMon',
                    's.soTinChi',
                    'ms.created_at',
                    'ms.updated_at'
                );

            // Search
            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('m.tenNganh', 'like', "%{$search}%")
                        ->orWhere('m.maNganh', 'like', "%{$search}%")
                        ->orWhere('s.tenMon', 'like', "%{$search}%")
                        ->orWhere('s.maMon', 'like', "%{$search}%");
                });
            }

            // Filter by major
            if ($request->has('major_id') && $request->major_id != '') {
                $query->where('ms.major_id', $request->major_id);
            }

            // Filter by maNganh
            if ($request->has('maNganh') && $request->maNganh != '') {
                $query->where('m.maNganh', $request->maNganh);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'ms.created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 20);
            $page = $request->get('page', 1);

            $total = $query->count();
            $data = $query->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'total' => $total,
                    'per_page' => (int) $perPage,
                    'current_page' => (int) $page,
                    'last_page' => ceil($total / $perPage),
                    'from' => (($page - 1) * $perPage) + 1,
                    'to' => min($page * $perPage, $total),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching major-subjects: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách môn học theo ngành',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get a single major-subject
     */
    public function show($id)
    {
        try {
            $majorSubject = DB::table('major_subjects as ms')
                ->join('majors as m', 'ms.major_id', '=', 'm.id')
                ->join('subjects as s', 'ms.subject_id', '=', 's.id')
                ->where('ms.id', $id)
                ->select(
                    'ms.id',
                    'ms.major_id',
                    'ms.subject_id',
                    'm.maNganh',
                    'm.tenNganh',
                    's.maMon',
                    's.tenMon',
                    's.soTinChi',
                    'ms.created_at',
                    'ms.updated_at'
                )
                ->first();

            if (!$majorSubject) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy dữ liệu',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $majorSubject,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching major-subject: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Create a new major-subject relationship
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'major_id' => 'required|integer|exists:majors,id',
            'subject_id' => 'required|integer|exists:subjects,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check if already exists
            $exists = MajorSubject::where('major_id', $request->major_id)
                ->where('subject_id', $request->subject_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Môn học này đã được thêm vào ngành này rồi',
                ], 422);
            }

            DB::beginTransaction();

            $majorSubject = MajorSubject::create([
                'major_id' => $request->major_id,
                'subject_id' => $request->subject_id,
            ]);

            DB::commit();

            // Get full data
            $data = DB::table('major_subjects as ms')
                ->join('majors as m', 'ms.major_id', '=', 'm.id')
                ->join('subjects as s', 'ms.subject_id', '=', 's.id')
                ->where('ms.id', $majorSubject->id)
                ->select(
                    'ms.id',
                    'ms.major_id',
                    'ms.subject_id',
                    'm.maNganh',
                    'm.tenNganh',
                    's.maMon',
                    's.tenMon',
                    's.soTinChi',
                    'ms.created_at',
                    'ms.updated_at'
                )
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Thêm môn học vào ngành thành công',
                'data' => $data,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating major-subject: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm môn học vào ngành',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Delete a major-subject relationship
     */
    public function destroy($id)
    {
        try {
            $majorSubject = MajorSubject::findOrFail($id);

            DB::beginTransaction();
            $majorSubject->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa môn học khỏi ngành thành công',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error deleting major-subject: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa môn học khỏi ngành',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk assign subjects to a major
     */
    public function bulkAssign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'major_id' => 'required|integer|exists:majors,id',
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'required|integer|exists:subjects,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $added = 0;
            $skipped = 0;

            foreach ($request->subject_ids as $subjectId) {
                $exists = MajorSubject::where('major_id', $request->major_id)
                    ->where('subject_id', $subjectId)
                    ->exists();

                if (!$exists) {
                    MajorSubject::create([
                        'major_id' => $request->major_id,
                        'subject_id' => $subjectId,
                    ]);
                    $added++;
                } else {
                    $skipped++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Đã thêm {$added} môn học, bỏ qua {$skipped} môn đã tồn tại",
                'data' => [
                    'added' => $added,
                    'skipped' => $skipped,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error bulk assigning subjects: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thêm môn học hàng loạt',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get subjects that can be assigned to a major (subjects not yet assigned)
     */
    public function getAvailableSubjects($majorId)
    {
        try {
            $assignedSubjectIds = MajorSubject::where('major_id', $majorId)
                ->pluck('subject_id')
                ->toArray();

            $query = Subject::query();

            if (!empty($assignedSubjectIds)) {
                $query->whereNotIn('id', $assignedSubjectIds);
            }

            $subjects = $query->select('id', 'maMon', 'tenMon', 'soTinChi')
                ->orderBy('tenMon')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $subjects,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching available subjects: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách môn học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get simplified list of subjects by major for autocomplete
     * ✅ FIXED: Handle both numeric ID and string maNganh
     * Convert maNganh to majors.id before querying major_subjects
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubjectsByMajor(Request $request)
    {
        try {
            $majorId = $request->query('major_id');

            if (!$majorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'major_id is required',
                ], 400);
            }

            // ✅ FIX: Determine actual majors.id
            // If major_id is string (maNganh like "8480201"), convert to majors.id first
            $actualMajorId = null;

            if (is_numeric($majorId)) {
                // Check if it's already a valid majors.id
                $major = DB::table('majors')->where('id', $majorId)->first();

                if ($major) {
                    $actualMajorId = $major->id;
                } else {
                    // Maybe it's a maNganh that looks numeric (like "8480201")
                    $major = DB::table('majors')->where('maNganh', $majorId)->first();
                    if ($major) {
                        $actualMajorId = $major->id;
                    }
                }
            } else {
                // It's a string code like "CNTT" or "8480201" - find by maNganh
                $major = DB::table('majors')->where('maNganh', $majorId)->first();
                if ($major) {
                    $actualMajorId = $major->id;
                }
            }

            if (!$actualMajorId) {
                \Log::warning('Major not found', ['major_id' => $majorId]);
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Major not found',
                ]);
            }

            // Now query major_subjects with the actual majors.id
            $subjects = DB::table('major_subjects as ms')
                ->join('subjects as s', 'ms.subject_id', '=', 's.id')
                ->where('ms.major_id', $actualMajorId)
                ->select(
                    's.id',
                    's.maMon',
                    's.tenMon',
                    's.soTinChi'
                )
                ->orderBy('s.tenMon', 'asc')
                ->get();

            \Log::info('getSubjectsByMajor', [
                'input_major_id' => $majorId,
                'actual_major_id' => $actualMajorId,
                'is_numeric' => is_numeric($majorId),
                'subjects_count' => $subjects->count(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $subjects,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching subjects by major: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách môn học',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}

