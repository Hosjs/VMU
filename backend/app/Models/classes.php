<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class classes extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'class_name',
        'maTrinhDoDaoTao',
        'major_id',
        'khoaHoc_id',
        'lecurer_id',
        'trangThai',
        'createdBy',
    ];

    // Alias for backward compatibility
    protected $appends = ['tenLop', 'maNganhHoc', 'khoaHoc', 'idGiaoVienChuNhiem'];

    /**
     * Accessors for backward compatibility
     */
    public function getTenLopAttribute()
    {
        return $this->class_name;
    }

    public function getMaNganhHocAttribute()
    {
        return $this->major_id;
    }

    public function getKhoaHocAttribute()
    {
        return $this->khoaHoc_id;
    }

    public function getIdGiaoVienChuNhiemAttribute()
    {
        return $this->lecurer_id;
    }

    /**
     * Mutators for backward compatibility
     */
    public function setTenLopAttribute($value)
    {
        $this->attributes['class_name'] = $value;
    }

    public function setMaNganhHocAttribute($value)
    {
        $this->attributes['major_id'] = $value;
    }

    public function setKhoaHocAttribute($value)
    {
        $this->attributes['khoaHoc_id'] = $value;
    }

    public function setIdGiaoVienChuNhiemAttribute($value)
    {
        $this->attributes['lecurer_id'] = $value;
    }

    /**
     * Relationships
     */
    public function trinhDoDaoTao()
    {
        return $this->belongsTo(TrinhDoDaoTao::class, 'maTrinhDoDaoTao', 'maTrinhDoDaoTao');
    }

    /**
     * @deprecated Use major() instead
     */
    public function nganhHoc()
    {
        return $this->major();
    }

    /**
     * Relationship to Major (Ngành học)
     * ✅ Fixed: Now references majors.id (not maNganh)
     */
    public function major()
    {
        return $this->belongsTo(Major::class, 'major_id', 'id');
    }

    public function hocViens()
    {
        return $this->hasMany(HocVien::class, 'idLop', 'id');
    }

    public function giaoVienChuNhiem()
    {
        return $this->belongsTo(Lecturer::class, 'lecurer_id', 'id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }

    /**
     * Scope: Filter by khóa học
     */
    public function scopeByKhoaHoc($query, $khoaHoc)
    {
        return $query->where('khoaHoc_id', $khoaHoc);
    }

    /**
     * Scope: Filter by major
     */
    public function scopeByMajor($query, $majorId)
    {
        return $query->where('major_id', $majorId);
    }

    /**
     * Scope: Active classes only
     */
    public function scopeActive($query)
    {
        return $query->where('trangThai', 'DangHoc');
    }
}
