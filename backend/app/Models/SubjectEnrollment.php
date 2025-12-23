<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubjectEnrollment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'maHV',
        'subject_id',
        'major_id',
        'namHoc',
        'hocKy',
        'trangThai',
    ];

    protected $casts = [
        'namHoc' => 'integer',
    ];

    public function student()
    {
        return $this->belongsTo(HocVien::class, 'maHV', 'maHV');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function major()
    {
        return $this->belongsTo(Major::class, 'major_id');
    }
}
