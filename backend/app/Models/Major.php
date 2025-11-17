<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Major extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'majors';

    const DELETED_AT = 'deleted_in';

    protected $fillable = [
        'maNganh',
        'tenNganh',
        'thoi_gian_dao_tao',
        'ghiChu',
        'parent_id',
    ];

    protected $casts = [
        'thoi_gian_dao_tao' => 'decimal:1',
        'parent_id' => 'integer',
    ];

    // ✅ Chỉ append các accessor CẦN THIẾT, không trùng với database columns
    protected $appends = [
        'ma',
        'tenNganhHoc',
        'mo_ta',
        'thoiGianDaoTao',
        'daoTaoThacSy',
        'daoTaoTienSy',
        'is_active',
    ];

    /**
     * Accessor để tương thích với frontend (camelCase)
     */
    public function getMaAttribute()
    {
        return $this->maNganh;
    }

    public function getTenNganhHocAttribute()
    {
        return $this->tenNganh;
    }

    public function getMoTaAttribute()
    {
        return $this->ghiChu;
    }

    public function getThoiGianDaoTaoAttribute()
    {
        $value = $this->getAttributes()['thoi_gian_dao_tao'] ?? null;
        return $value ? (float) $value : null;
    }

    // Phân biệt Thạc sỹ và Tiến sỹ dựa trên mã ngành
    public function getDaoTaoThacSyAttribute()
    {
        return $this->maNganh && str_starts_with($this->maNganh, '8');
    }

    public function getDaoTaoTienSyAttribute()
    {
        return $this->maNganh && str_starts_with($this->maNganh, '9');
    }

    public function getIsActiveAttribute()
    {
        return true; // Mặc định là active
    }

    /**
     * Relationships
     */
    public function parent()
    {
        return $this->belongsTo(Major::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Major::class, 'parent_id');
    }

    public function students()
    {
        return $this->hasMany(HocVien::class, 'maNganh', 'maNganh');
    }

    /**
     * Các môn học trong ngành
     */
    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'major_subjects', 'major_id', 'subject_id');
    }
}
