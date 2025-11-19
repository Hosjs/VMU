<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassStudent extends Model
{
    use SoftDeletes;

    protected $table = 'class_students';

    protected $fillable = [
        'class_id',
        'student_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the class that owns the enrollment
     * Using raw DB table name 'classes'
     */
    public function class(): BelongsTo
    {
        // Note: Using DB table directly since there may not be a Class model
        return $this->belongsTo(\stdClass::class, 'class_id');
    }

    /**
     * Get the student that owns the enrollment
     * Using students table with maHV as foreign key
     */
    public function student(): BelongsTo
    {
        // Note: Using DB table directly since student is in 'students' table
        return $this->belongsTo(\stdClass::class, 'student_id', 'maHV');
    }

    /**
     * Scope to filter by class
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope to filter by student
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }
}
