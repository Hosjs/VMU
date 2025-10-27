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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relationship với User (người tạo)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }

    /**
     * Scope để lọc các trình độ đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('trangThai', true);
    }
}

