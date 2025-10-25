<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HocVien extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hoc_vien';
    protected $primaryKey = 'maHV';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'maHV',
        'hoDem',
        'ten',
        'ngaySinh',
        'gioiTinh',
        'soGiayToTuyThan',
        'dienThoai',
        'email',
        'quocTich',
        'danToc',
        'tonGiao',
        'maTrinhDoDaoTao',
        'maNganh',
        'trangThai',
        'ngayNhapHoc',
        'namVaoTruong',
        'idLop',
        'createdBy',
    ];

    protected $casts = [
        'ngaySinh' => 'date',
        'ngayNhapHoc' => 'datetime',
        'namVaoTruong' => 'integer',
    ];

    protected $appends = ['hoTenDayDu'];

    /**
     * Relationships
     */
    public function trinhDoDaoTao()
    {
        return $this->belongsTo(TrinhDoDaoTao::class, 'maTrinhDoDaoTao', 'maTrinhDoDaoTao');
    }

    public function nganh()
    {
        return $this->belongsTo(NganhHoc::class, 'maNganh', 'maNganh');
    }

    public function lop()
    {
        return $this->belongsTo(Lop::class, 'idLop', 'id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }

    /**
     * Accessors
     */
    public function getHoTenDayDuAttribute()
    {
        return trim($this->hoDem . ' ' . $this->ten);
    }

    /**
     * Scopes
     */
    public function scopeSearch($query, $search)
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('maHV', 'like', "%{$search}%")
              ->orWhere('hoDem', 'like', "%{$search}%")
              ->orWhere('ten', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('dienThoai', 'like', "%{$search}%");
        });
    }

    public function scopeByNamVao($query, $namVao)
    {
        if (!$namVao) {
            return $query;
        }

        return $query->where('namVaoTruong', $namVao);
    }

    public function scopeByNganh($query, $maNganh)
    {
        if (!$maNganh) {
            return $query;
        }

        return $query->where('maNganh', $maNganh);
    }

    public function scopeByTrinhDo($query, $maTrinhDo)
    {
        if (!$maTrinhDo) {
            return $query;
        }

        return $query->where('maTrinhDoDaoTao', $maTrinhDo);
    }

    public function scopeByTrangThai($query, $trangThai)
    {
        if (!$trangThai) {
            return $query;
        }

        return $query->where('trangThai', $trangThai);
    }

    public function scopeByGioiTinh($query, $gioiTinh)
    {
        if (!$gioiTinh) {
            return $query;
        }

        return $query->where('gioiTinh', $gioiTinh);
    }
}

