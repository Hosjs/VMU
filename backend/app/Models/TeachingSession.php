<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeachingSession extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'teaching_assignment_id',
        'lecturer_id',
        'class_id',
        'session_date',
        'start_time',
        'end_time',
        'room',
        'session_number',
        'status',
        'notes',
        'cancellation_reason',
        'actual_start_time',
        'actual_end_time',
    ];

    protected $casts = [
        'session_date' => 'date',
        'session_number' => 'integer',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
    ];

    public function teachingAssignment()
    {
        return $this->belongsTo(TeachingAssignment::class);
    }

    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class);
    }

    public function class()
    {
        return $this->belongsTo(classes::class, 'class_id');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('session_date', $date);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('session_date', [$startDate, $endDate]);
    }

    public function scopeByLecturer($query, $lecturerId)
    {
        return $query->where('lecturer_id', $lecturerId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
