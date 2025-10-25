<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NganhHoc extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'nganh_hoc';
    protected $primaryKey = 'maNganh';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'maNganh',
        'tenNganh',
        'moTa',
        'trangThai',
        'createdBy',
    ];

    protected $casts = [
        'trangThai' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function hocViens()
    {
        return $this->hasMany(HocVien::class, 'maNganh', 'maNganh');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }
}

