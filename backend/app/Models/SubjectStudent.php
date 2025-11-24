<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectStudent extends Model
{
    protected $table = 'subject_students';

    protected $fillable = [
        'student_id',
        'subject_id',
        'x',
        'y',
        'z',
    ];

    protected $casts = [
        'x' => 'float',
        'y' => 'float',
        'z' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['diem', 'diem_he4', 'diem_chu'];

    /**
     * Get the student that owns the enrollment
     */
    public function student(): BelongsTo
    {
        // Using students table with maHV as foreign key
        return $this->belongsTo(\stdClass::class, 'student_id', 'maHV')
            ->from('students');
    }

    /**
     * Get the subject that owns the enrollment
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    /**
     * Calculate final grade (điểm hệ 10)
     * Formula: (x * 0.1) + (y * 0.2) + (z * 0.7)
     */
    public function getDiemAttribute(): float
    {
        if (is_null($this->x) || is_null($this->y) || is_null($this->z)) {
            return 0;
        }
        return round(($this->x * 0.1) + ($this->y * 0.2) + ($this->z * 0.7), 2);
    }

    /**
     * Convert grade to 4-point scale
     */
    public function getDiemHe4Attribute(): float
    {
        $diem = $this->diem;

        if ($diem >= 8.5) return 4.0;
        if ($diem >= 8.0) return 3.5;
        if ($diem >= 7.0) return 3.0;
        if ($diem >= 6.5) return 2.5;
        if ($diem >= 5.5) return 2.0;
        if ($diem >= 5.0) return 1.5;
        if ($diem >= 4.0) return 1.0;
        return 0;
    }

    /**
     * Convert grade to letter grade
     */
    public function getDiemChuAttribute(): string
    {
        $diem = $this->diem;

        if ($diem >= 8.5) return 'A';
        if ($diem >= 8.0) return 'B+';
        if ($diem >= 7.0) return 'B';
        if ($diem >= 6.5) return 'C+';
        if ($diem >= 5.5) return 'C';
        if ($diem >= 5.0) return 'D+';
        if ($diem >= 4.0) return 'D';
        return 'F';
    }

    /**
     * Scope to filter by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope to filter by subject
     */
    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    /**
     * Scope to filter by subject code (maMon)
     */
    public function scopeBySubjectCode($query, $maMon)
    {
        return $query->whereHas('subject', function($q) use ($maMon) {
            $q->where('maMon', $maMon);
        });
    }

    /**
     * Get students for a specific subject
     */
    public static function getStudentsBySubject($subjectId)
    {
        return self::where('subject_id', $subjectId)
            ->with('student')
            ->get();
    }

    /**
     * Get subjects for a specific student
     */
    public static function getSubjectsByStudent($studentId)
    {
        return self::where('student_id', $studentId)
            ->with('subject')
            ->get();
    }

    /**
     * Check if a student is enrolled in a subject
     */
    public static function isEnrolled($studentId, $subjectId): bool
    {
        return self::where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->exists();
    }

    /**
     * Get grades for a specific student with subject details
     */
    public static function getGradesByStudent($studentId)
    {
        return self::where('student_id', $studentId)
            ->with(['subject.majors'])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'student_id' => $item->student_id,
                    'subject_id' => $item->subject_id,
                    'maMon' => $item->subject->maMon ?? '',
                    'tenMon' => $item->subject->tenMon ?? '',
                    'soTinChi' => $item->subject->soTinChi ?? 0,
                    'x' => $item->x,
                    'y' => $item->y,
                    'z' => $item->z,
                    'diem' => $item->diem,
                    'diem_he4' => $item->diem_he4,
                    'diem_chu' => $item->diem_chu,
                    'majors' => $item->subject->majors ?? [],
                ];
            });
    }
}
