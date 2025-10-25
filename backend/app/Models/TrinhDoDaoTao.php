<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrinhDoDaoTao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'trinh_do_dao_tao';
    protected $primaryKey = 'maTrinhDoDaoTao';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'maTrinhDoDaoTao',
        'tenTrinhDo',
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
        return $this->hasMany(HocVien::class, 'maTrinhDoDaoTao', 'maTrinhDoDaoTao');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }
}

