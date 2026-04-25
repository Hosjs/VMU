<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamSchedule extends Model
{
    use SoftDeletes, Auditable;

    protected $fillable = [
        'khoa_hoc_id',
        'subject_id',
        'subject_name',
        'class_id',
        'class_name',
        'exam_start',
        'exam_end',
        'room_id',
        'room',
        'supervisor_1_id',
        'supervisor_2_id',
        'exam_type',
        'note',
    ];

    protected $casts = [
        'exam_start' => 'datetime',
        'exam_end' => 'datetime',
    ];

    public function khoaHoc(): BelongsTo
    {
        return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function supervisor1(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class, 'supervisor_1_id');
    }

    public function supervisor2(): BelongsTo
    {
        return $this->belongsTo(Lecturer::class, 'supervisor_2_id');
    }
}
