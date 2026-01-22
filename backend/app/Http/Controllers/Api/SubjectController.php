<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectEnrollment;
use App\Models\HocVien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Subject::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('maMon', 'like', "%{$search}%")
                      ->orWhere('tenMon', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 20);
            $subjects = $query->orderBy('tenMon')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $subjects->items(),
                'meta' => [
                    'current_page' => $subjects->currentPage(),
                    'from' => $subjects->firstItem(),
                    'last_page' => $subjects->lastPage(),
                    'per_page' => $subjects->perPage(),
                    'to' => $subjects->lastItem(),
                    'total' => $subjects->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching subjects',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'maMon' => 'required|string|max:20|unique:subjects,maMon',
            'tenMon' => 'required|string|max:255',
            'soTinChi' => 'required|integer|min:1|max:10',
            'moTa' => 'nullable|string',
        ], [
            'maMon.required' => 'Mã môn học là bắt buộc',
            'maMon.unique' => 'Mã môn học đã tồn tại',
            'tenMon.required' => 'Tên môn học là bắt buộc',
            'soTinChi.required' => 'Số tín chỉ là bắt buộc',
            'soTinChi.min' => 'Số tín chỉ phải từ 1 đến 10',
            'soTinChi.max' => 'Số tín chỉ phải từ 1 đến 10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $subject = Subject::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $subject,
                'message' => 'Tạo môn học thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating subject',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'maMon' => 'required|string|max:20|unique:subjects,maMon,' . $id,
            'tenMon' => 'required|string|max:255',
            'soTinChi' => 'required|integer|min:1|max:10',
            'moTa' => 'nullable|string',
        ], [
            'maMon.required' => 'Mã môn học là bắt buộc',
            'maMon.unique' => 'Mã môn học đã tồn tại',
            'tenMon.required' => 'Tên môn học là bắt buộc',
            'soTinChi.required' => 'Số tín chỉ là bắt buộc',
            'soTinChi.min' => 'Số tín chỉ phải từ 1 đến 10',
            'soTinChi.max' => 'Số tín chỉ phải từ 1 đến 10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $subject->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $subject,
                'message' => 'Cập nhật môn học thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating subject',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $subject = Subject::find($id);

            if (!$subject) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subject not found',
                ], 404);
            }

            // Check if subject has enrollments
            if ($subject->enrollments()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa môn học đã có sinh viên đăng ký',
                ], 400);
            }

            $subject->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa môn học thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting subject',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getSubjectsByMajorAndYear(Request $request)
    {
        try {
            $majorId = $request->get('major_id');
            $namHoc = $request->get('nam_hoc');

            if (!$majorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'major_id is required',
                ], 400);
            }

            $query = Subject::whereIn('id', function($subQuery) use ($majorId) {
                $subQuery->select('subject_id')
                    ->from('major_subjects')
                    ->where('major_id', $majorId)
                    ->whereNull('deleted_at');
            });

            if ($namHoc) {
                $query->withCount(['enrollments as enrolled_students_count' => function($q) use ($namHoc, $majorId) {
                    $q->where('namHoc', $namHoc)
                      ->where('major_id', $majorId);
                }]);
            } else {
                $query->withCount(['enrollments as enrolled_students_count' => function($q) use ($majorId) {
                    $q->where('major_id', $majorId);
                }]);
            }

            $subjects = $query->orderBy('tenMon')->get();

            \Log::info('getSubjectsByMajorAndYear', [
                'major_id' => $majorId,
                'nam_hoc' => $namHoc,
                'subjects_count' => $subjects->count(),
                'subject_ids' => $subjects->pluck('id')->toArray(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $subjects,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getSubjectsByMajorAndYear: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error fetching subjects',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getEnrolledStudents(Request $request, $subjectId)
    {
        try {
            $namHoc = $request->get('nam_hoc');
            $majorId = $request->get('major_id');

            $query = SubjectEnrollment::where('subject_id', $subjectId)
                ->with(['student.nganh', 'student.trinhDoDaoTao']);

            if ($namHoc) {
                $query->where('namHoc', $namHoc);
            }

            if ($majorId) {
                $query->where('major_id', $majorId);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('student', function($q) use ($search) {
                    $q->where('maHV', 'like', "%{$search}%")
                      ->orWhere('hoDem', 'like', "%{$search}%")
                      ->orWhere('ten', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 20);
            $enrollments = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $enrollments->items(),
                'meta' => [
                    'current_page' => $enrollments->currentPage(),
                    'from' => $enrollments->firstItem(),
                    'last_page' => $enrollments->lastPage(),
                    'per_page' => $enrollments->perPage(),
                    'to' => $enrollments->lastItem(),
                    'total' => $enrollments->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching enrolled students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function enrollStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'maHV' => 'required|exists:students,maHV',
            'subject_id' => 'required|exists:subjects,id',
            'major_id' => 'required|exists:majors,id',
            'namHoc' => 'required|integer|min:2000|max:2100',
            'hocKy' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $enrollment = SubjectEnrollment::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $enrollment->load(['student', 'subject', 'major']),
                'message' => 'Đăng ký môn học thành công',
            ], 201);
        } catch (\Exception $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Học sinh đã đăng ký môn học này rồi',
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error enrolling student',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkEnrollStudents(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'maHVs' => 'required|array',
            'maHVs.*' => 'exists:students,maHV',
            'subject_id' => 'required|exists:subjects,id',
            'major_id' => 'required|exists:majors,id',
            'namHoc' => 'required|integer|min:2000|max:2100',
            'hocKy' => 'nullable|string|max:10',
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

            $enrollments = [];
            $duplicates = [];

            foreach ($request->maHVs as $maHV) {
                $exists = SubjectEnrollment::where('maHV', $maHV)
                    ->where('subject_id', $request->subject_id)
                    ->where('namHoc', $request->namHoc)
                    ->exists();

                if ($exists) {
                    $duplicates[] = $maHV;
                    continue;
                }

                $enrollments[] = SubjectEnrollment::create([
                    'maHV' => $maHV,
                    'subject_id' => $request->subject_id,
                    'major_id' => $request->major_id,
                    'namHoc' => $request->namHoc,
                    'hocKy' => $request->hocKy,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $enrollments,
                'message' => count($enrollments) . ' học sinh đã được đăng ký',
                'duplicates' => $duplicates,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error enrolling students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function unenrollStudent(Request $request, $enrollmentId)
    {
        try {
            $enrollment = SubjectEnrollment::findOrFail($enrollmentId);
            $enrollment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa đăng ký môn học thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error unenrolling student',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkUnenrollStudents(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'enrollment_ids' => 'required|array',
            'enrollment_ids.*' => 'exists:subject_enrollments,id',
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

            SubjectEnrollment::whereIn('id', $request->enrollment_ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($request->enrollment_ids) . ' học sinh đã được xóa khỏi môn học',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error unenrolling students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAvailableStudents(Request $request)
    {
        try {
            $subjectId = $request->get('subject_id');
            $namHoc = $request->get('nam_hoc');
            $majorId = $request->get('major_id');

            if (!$subjectId || !$namHoc || !$majorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'subject_id, nam_hoc, and major_id are required',
                ], 400);
            }

            // Get major info to filter by maNganh
            $major = \App\Models\Major::find($majorId);
            if (!$major) {
                return response()->json([
                    'success' => false,
                    'message' => 'Major not found',
                ], 404);
            }

            $enrolledStudentIds = SubjectEnrollment::where('subject_id', $subjectId)
                ->where('namHoc', $namHoc)
                ->pluck('maHV');

            // ✅ FIX: Filter by maNganh and trangThai, not by namVaoTruong
            // Students can enroll in courses regardless of their enrollment year
            $query = HocVien::where('maNganh', $major->maNganh)
                ->where('trangThai', 'DangHoc')  // Only active students
                ->whereNotIn('maHV', $enrolledStudentIds)
                ->with(['nganh', 'trinhDoDaoTao']);

            \Log::info('getAvailableStudents query', [
                'subject_id' => $subjectId,
                'nam_hoc' => $namHoc,
                'major_id' => $majorId,
                'major_maNganh' => $major->maNganh,
                'enrolled_count' => $enrolledStudentIds->count(),
            ]);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('maHV', 'like', "%{$search}%")
                      ->orWhere('hoDem', 'like', "%{$search}%")
                      ->orWhere('ten', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $perPage = $request->get('per_page', 20);
            $students = $query->orderBy('hoDem')->paginate($perPage);

            \Log::info('getAvailableStudents result', [
                'total_found' => $students->total(),
                'sample_ids' => $students->pluck('maHV')->take(5)->toArray(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $students->items(),
                'meta' => [
                    'current_page' => $students->currentPage(),
                    'from' => $students->firstItem(),
                    'last_page' => $students->lastPage(),
                    'per_page' => $students->perPage(),
                    'to' => $students->lastItem(),
                    'total' => $students->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching available students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
