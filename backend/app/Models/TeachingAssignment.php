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
        'student_count' => 'integer',
        'credits' => 'integer',
    ];

    /**
     * Format start_time as H:i for API responses
     */
    protected function startTime(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn ($value) => $value ? date('H:i', strtotime($value)) : null,
            set: fn ($value) => $value,
        );
    }

    /**
     * Format end_time as H:i for API responses
     */
    protected function endTime(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn ($value) => $value ? date('H:i', strtotime($value)) : null,
            set: fn ($value) => $value,
        );
    }

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
        return $this->belongsTo(classes::class, 'lop_id', 'id');
    }

    /**
     * Relationship: Assignment has many Sessions
     */
    public function sessions()
    {
        return $this->hasMany(TeachingSession::class);
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
     * Get assignments that OVERLAP with the given date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate && $endDate) {
            // Assignment overlaps with range if:
            // 1. Assignment starts before range ends AND
            // 2. Assignment ends after range starts
            return $query->where(function($q) use ($startDate, $endDate) {
                $q->where('start_date', '<=', $endDate)
                  ->where('end_date', '>=', $startDate);
            });
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
