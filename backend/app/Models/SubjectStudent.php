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

    /**
     * Get the student that owns the enrollment
     */
    public function student(): BelongsTo
    {
        // Using students table with maHV as foreign key
        return $this->belongsTo(\stdClass::class, 'student_id', 'maHV');
    }

    /**
     * Get the subject that owns the enrollment
     */
    public function subject(): BelongsTo
    {
        // Using subjects table
        return $this->belongsTo(\stdClass::class, 'subject_id');
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
}

