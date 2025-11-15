<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeachingAssignment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lecturer_id',
        'lop_id',
        'course_code',
        'course_name',
        'credits',
        'start_date',
        'end_date',
        'day_of_week',
        'start_time',
        'end_time',
        'room',
        'class_name',
        'student_count',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'student_count' => 'integer',
        'credits' => 'integer',
    ];

    /**
     * Relationship: Assignment belongs to Lecturer
     */
    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class);
    }

    /**
     * Relationship: Assignment belongs to Lop (Class)
     */
    public function lop()
    {
        return $this->belongsTo(Lop::class, 'lop_id', 'id');
    }

    /**
     * Scope: Filter by lecturer
     */
    public function scopeByLecturer($query, $lecturerId)
    {
        if ($lecturerId) {
            return $query->where('lecturer_id', $lecturerId);
        }
        return $query;
    }

    /**
     * Scope: Filter by status
     */
    public function scopeByStatus($query, $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }
        return $query;
    }

    /**
     * Scope: Filter by day of week
     */
    public function scopeByDayOfWeek($query, $dayOfWeek)
    {
        if ($dayOfWeek) {
            return $query->where('day_of_week', $dayOfWeek);
        }
        return $query;
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate && $endDate) {
            return $query->whereBetween('start_date', [$startDate, $endDate]);
        }
        return $query;
    }

    /**
     * Check if there's a conflict with existing assignment
     */
    public static function hasConflict($lecturerId, $dayOfWeek, $startTime, $endTime, $startDate, $endDate, $excludeId = null)
    {
        $query = self::where('lecturer_id', $lecturerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($q2) use ($startDate, $endDate) {
                      $q2->where('start_date', '<=', $startDate)
                         ->where('end_date', '>=', $endDate);
                  });
            })
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_time', '<=', $startTime)
                         ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
