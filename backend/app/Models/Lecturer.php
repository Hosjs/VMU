<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lecturer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'lecturers';

    protected $fillable = [
        'hoTen',
        'trinhDoChuyenMon',
        'hocHam',
        'maNganh',
        'ghiChu',
    ];

    protected $casts = [
        'maNganh' => 'integer',
    ];

    /**
     * Relationship: Lecturer belongs to Major
     */
    public function major()
    {
        return $this->belongsTo(Major::class, 'maNganh', 'id');
    }

    /**
     * Scope: Search by name
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where('hoTen', 'like', "%{$search}%");
        }
        return $query;
    }

    /**
     * Scope: Filter by major (maNganh)
     */
    public function scopeByNganh($query, $maNganh)
    {
        if ($maNganh) {
            return $query->where('maNganh', $maNganh);
        }
        return $query;
    }

    /**
     * Scope: Filter by academic rank (hocHam)
     */
    public function scopeByHocHam($query, $hocHam)
    {
        if ($hocHam) {
            return $query->where('hocHam', $hocHam);
        }
        return $query;
    }

    /**
     * Scope: Filter by professional qualification (trinhDoChuyenMon)
     */
    public function scopeByTrinhDoChuyenMon($query, $trinhDoChuyenMon)
    {
        if ($trinhDoChuyenMon) {
            return $query->where('trinhDoChuyenMon', $trinhDoChuyenMon);
        }
        return $query;
    }
}
