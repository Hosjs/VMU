<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WeeklySchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'weekly_schedules';

    protected $fillable = [
        'stt',
        'week_number',
        'khoa_hoc_id',
        'class_id',
        'subject_id',
        'subject_name',
        'lecturer_id',
        'lecturer_name',
        'time_slot',
        'room',
        'ghi_chu',
    ];

    protected $casts = [
        'stt' => 'integer',
        'khoa_hoc_id' => 'integer',
        'class_id' => 'integer',
        'subject_id' => 'integer',
        'lecturer_id' => 'integer',
    ];

    /**
     * Relationship: Weekly schedule belongs to Class
     */
    public function class()
    {
        return $this->belongsTo(classes::class, 'class_id', 'id');
    }

    /**
     * Relationship: Weekly schedule belongs to KhoaHoc (Semester)
     */
    public function khoaHoc()
    {
        return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id', 'id');
    }

    /**
     * Relationship: Weekly schedule belongs to Subject (optional)
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    /**
     * Relationship: Weekly schedule belongs to Lecturer (optional)
     */
    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class, 'lecturer_id', 'id');
    }

    /**
     * Scope: Filter by khoa_hoc_id (semester)
     */
    public function scopeByKhoaHoc($query, $khoaHocId)
    {
        if ($khoaHocId) {
            return $query->where('khoa_hoc_id', $khoaHocId);
        }
        return $query;
    }

    /**
     * Scope: Filter by week number
     */
    public function scopeByWeekNumber($query, $weekNumber)
    {
        if ($weekNumber) {
            return $query->where('week_number', $weekNumber);
        }
        return $query;
    }

    /**
     * Scope: Filter by class
     */
    public function scopeByClass($query, $classId)
    {
        if ($classId) {
            return $query->where('class_id', $classId);
        }
        return $query;
    }

    /**
     * Scope: Filter by multiple class IDs
     */
    public function scopeByClasses($query, $classIds)
    {
        if ($classIds && is_array($classIds) && count($classIds) > 0) {
            return $query->whereIn('class_id', $classIds);
        }
        return $query;
    }
}
