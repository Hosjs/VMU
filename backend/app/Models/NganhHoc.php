<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NganhHoc extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'majors';
    protected $primaryKey = 'maNganh';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'maNganh',
        'tenNganh',
        'ghiChu',
        'parent_id',
        'thoi_gian_dao_tao',
    ];

    /**
     * Relationships
     */
    public function hocViens()
    {
        return $this->hasMany(HocVien::class, 'maNganh', 'maNganh');
    }

    public function parent()
    {
        return $this->belongsTo(NganhHoc::class, 'parent_id', 'id');
    }

    public function children()
    {
        return $this->hasMany(NganhHoc::class, 'parent_id', 'id');
    }
}

