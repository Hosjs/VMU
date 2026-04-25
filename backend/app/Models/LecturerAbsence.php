<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LecturerAbsence extends Model
{
    protected $fillable = [
        'lecturer_id',
        'absence_date',
        'reason',
        'note',
        'weekly_schedule_id',
        'recorded_by',
    ];

    protected $casts = [
        'absence_date' => 'date:Y-m-d',
    ];

    public function lecturer(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class);
    }

    public function weeklySchedule(): BelongsTo
    {
        return $this->belongsTo(WeeklySchedule::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
