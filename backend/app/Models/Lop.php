<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lop extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'lop';

    protected $fillable = [
        'tenLop',
        'maTrinhDoDaoTao',
        'maNganhHoc',
        'khoaHoc',
        'idGiaoVienChuNhiem',
        'trangThai',
        'createdBy',
    ];

    /**
     * Relationships
     */
    public function trinhDoDaoTao()
    {
        return $this->belongsTo(TrinhDoDaoTao::class, 'maTrinhDoDaoTao', 'maTrinhDoDaoTao');
    }

    public function nganhHoc()
    {
        return $this->belongsTo(NganhHoc::class, 'maNganhHoc', 'maNganh');
    }

    public function hocViens()
    {
        return $this->hasMany(HocVien::class, 'idLop', 'id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }
}

