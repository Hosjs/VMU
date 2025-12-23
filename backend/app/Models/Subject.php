<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'maMon',
        'tenMon',
        'soTinChi',
        'moTa',
    ];

    /**
     * Các ngành học có môn này
     */
    public function majors()
    {
        return $this->belongsToMany(Major::class, 'major_subjects', 'subject_id', 'major_id');
    }

    public function enrollments()
    {
        return $this->hasMany(SubjectEnrollment::class, 'subject_id');
    }

    public function students()
    {
        return $this->belongsToMany(HocVien::class, 'subject_enrollments', 'subject_id', 'maHV')
            ->withPivot('namHoc', 'hocKy', 'trangThai')
            ->withTimestamps();
    }
}
