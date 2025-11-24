<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubjectStudent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    /**
     * Get grades by student code (MaHV) from database
     * Organized by semester, major, and subject
     */
    public function getGradesByMaHV(Request $request)
    {
        $maHV = $request->query('MaHV');

        if (!$maHV) {
            return response()->json(['error' => 'MaHV is required'], 400);
        }

        try {
            // Get student info directly from students table
            $student = DB::table('students')
                ->where('maHV', $maHV)
                ->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy học viên với mã: ' . $maHV
                ], 404);
            }

            // Get grades from database with relationships
            $grades = SubjectStudent::where('student_id', $maHV)
                ->with(['subject.majors'])
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'MaLopHoc' => $item->subject->maMon ?? '',
                        'TenLopHoc' => $item->subject->tenMon ?? '',
                        'hocPhanChu' => $item->diem_chu,
                        'tenMon' => $item->subject->tenMon ?? '',
                        'soTinChiThucHoc' => $item->subject->soTinChi ?? 0,
                        'soTinChi' => $item->subject->soTinChi ?? 0,
                        'diem' => $item->diem,
                        'x' => $item->x,
                        'y' => $item->y,
                        'z' => $item->z,
                        'HeSo' => 1,
                        'DiemHe4' => $item->diem_he4,
                        'GhiChu' => $item->diem >= 5 ? 'Đạt' : 'Không đạt',
                        'ghiChu' => $item->diem >= 5 ? 'Đạt' : 'Không đạt',
                        'maMon' => $item->subject->maMon ?? '',
                        'major' => $item->subject->majors->first()->tenNganh ?? null,
                        'major_id' => $item->subject->majors->first()->maNganh ?? null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $grades,
                'student' => [
                    'maHV' => $student->maHV,
                    'hoTen' => trim(($student->hoDem ?? '') . ' ' . ($student->ten ?? '')),
                    'maNganh' => $student->maNganh ?? null,
                ],
                'summary' => $this->calculateSummary($grades)
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching grades from database: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu điểm từ database',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Calculate GPA and credit summary
     */
    private function calculateSummary($grades)
    {
        $totalCredits = $grades->sum('soTinChiThucHoc');
        $totalScore = $grades->sum(function ($grade) {
            return $grade['diem'] * $grade['soTinChiThucHoc'];
        });
        $totalScore4 = $grades->sum(function ($grade) {
            return $grade['DiemHe4'] * $grade['soTinChiThucHoc'];
        });

        return [
            'totalCredits' => $totalCredits,
            'gpa' => $totalCredits > 0 ? round($totalScore / $totalCredits, 2) : 0,
            'gpa4' => $totalCredits > 0 ? round($totalScore4 / $totalCredits, 2) : 0,
            'totalSubjects' => $grades->count(),
            'passedSubjects' => $grades->filter(fn($g) => $g['diem'] >= 5)->count(),
            'failedSubjects' => $grades->filter(fn($g) => $g['diem'] < 5)->count(),
        ];
    }

    /**
     * Get grades grouped by semester and major
     */
    public function getGradesGrouped(Request $request)
    {
        $maHV = $request->query('MaHV');

        if (!$maHV) {
            return response()->json(['error' => 'MaHV is required'], 400);
        }

        try {
            // Get student info directly from students table
            $student = DB::table('students')
                ->leftJoin('nganh_hoc', 'students.maNganh', '=', 'nganh_hoc.maNganh')
                ->where('students.maHV', $maHV)
                ->select('students.*', 'nganh_hoc.tenNganh')
                ->first();

            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy học viên'
                ], 404);
            }

            // Get grades grouped by major
            $grades = SubjectStudent::where('student_id', $maHV)
                ->with(['subject.majors'])
                ->get()
                ->groupBy(function ($item) {
                    $major = $item->subject->majors->first();
                    return $major ? $major->tenNganh : 'Chưa phân loại';
                })
                ->map(function ($items, $majorName) {
                    return [
                        'major' => $majorName,
                        'subjects' => $items->map(function ($item) {
                            return [
                                'maMon' => $item->subject->maMon ?? '',
                                'tenMon' => $item->subject->tenMon ?? '',
                                'soTinChi' => $item->subject->soTinChi ?? 0,
                                'x' => $item->x,
                                'y' => $item->y,
                                'z' => $item->z,
                                'diem' => $item->diem,
                                'diem_he4' => $item->diem_he4,
                                'diem_chu' => $item->diem_chu,
                                'ghiChu' => $item->diem >= 5 ? 'Đạt' : 'Không đạt',
                            ];
                        })->values(),
                        'totalCredits' => $items->sum(fn($i) => $i->subject->soTinChi ?? 0),
                        'averageGrade' => $items->avg('diem'),
                    ];
                });

            return response()->json([
                'success' => true,
                'student' => [
                    'maHV' => $student->maHV,
                    'hoTen' => trim(($student->hoDem ?? '') . ' ' . ($student->ten ?? '')),
                    'tenNganh' => $student->tenNganh ?? 'N/A',
                ],
                'data' => $grades->values(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching grouped grades: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy dữ liệu từ database',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}

