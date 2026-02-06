<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeachingSchedule extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'teaching_schedules';

    protected $fillable = [
        'major_id',
        'khoa_hoc_id',
        'semester_code',
        'stt',
        'ten_hoc_phan',
        'so_tin_chi',
        'can_bo_giang_day',
        'tuan',
        'ngay',
        'ghi_chu',
    ];

    protected $casts = [
        'major_id' => 'integer',
        'khoa_hoc_id' => 'integer',
        'stt' => 'integer',
        'so_tin_chi' => 'integer',
    ];

    /**
     * Relationship: Teaching schedule belongs to Major
     */
    public function major()
    {
        return $this->belongsTo(Major::class, 'major_id', 'id');
    }

    /**
     * Relationship: Teaching schedule belongs to KhoaHoc (semester/course)
     */
    public function khoaHoc()
    {
        return $this->belongsTo(KhoaHoc::class, 'khoa_hoc_id', 'id');
    }

    /**
     * Scope: Filter by semester code
     */
    public function scopeBySemesterCode($query, $semesterCode)
    {
        if ($semesterCode) {
            return $query->where('semester_code', $semesterCode);
        }
        return $query;
    }

    /**
     * Scope: Filter by major
     */
    public function scopeByMajor($query, $majorId)
    {
        if ($majorId) {
            return $query->where('major_id', $majorId);
        }
        return $query;
    }

    /**
     * Scope: Filter by khoa hoc
     */
    public function scopeByKhoaHoc($query, $khoaHocId)
    {
        if ($khoaHocId) {
            return $query->where('khoa_hoc_id', $khoaHocId);
        }
        return $query;
    }
}
