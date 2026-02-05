<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KhoaHoc extends Model
{
    protected $table = 'khoa_hoc';

    public $timestamps = false;

    // Không dùng auto-increment vì id là integer thường
    public $incrementing = false;

    protected $fillable = [
        'id',
        'ma_khoa_hoc',
        'nam_hoc',
        'hoc_ky',
        'dot',
        'ngay_bat_dau',
        'ngay_ket_thuc',
        'ghi_chu',
    ];

    protected $casts = [
        'nam_hoc' => 'integer',
        'hoc_ky' => 'integer',
        'dot' => 'integer',
        'ngay_bat_dau' => 'date:Y-m-d',
        'ngay_ket_thuc' => 'date:Y-m-d',
    ];

    /**
     * Boot method để tự động tạo ID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                // Lấy ID lớn nhất hiện tại và +1
                $maxId = self::max('id') ?? 0;
                $model->id = $maxId + 1;
            }
        });
    }

    /**
     * Get classes belonging to this academic term
     */
    public function classes()
    {
        return $this->hasMany(Classes::class, 'khoaHoc_id', 'id');
    }
}
