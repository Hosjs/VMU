<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentRate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'subject_type',
        'education_level',
        'semester_code',
        'theory_rate',
        'practical_rate',
        'insurance_rate',
        'description',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'theory_rate' => 'decimal:2',
        'practical_rate' => 'decimal:2',
        'insurance_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship: Rate created by User
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Rate updated by User
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope: Filter active rates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filter by subject type
     */
    public function scopeBySubjectType($query, $subjectType)
    {
        if ($subjectType) {
            return $query->where('subject_type', $subjectType);
        }
        return $query;
    }

    /**
     * Scope: Filter by education level
     */
    public function scopeByEducationLevel($query, $educationLevel)
    {
        if ($educationLevel) {
            return $query->where('education_level', $educationLevel);
        }
        return $query;
    }

    /**
     * Scope: Filter by semester
     */
    public function scopeBySemester($query, $semesterCode)
    {
        if ($semesterCode) {
            return $query->where('semester_code', $semesterCode);
        }
        return $query;
    }

    /**
     * Scope: Search by name
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('subject_type', 'like', "%{$search}%")
                  ->orWhere('education_level', 'like', "%{$search}%");
            });
        }
        return $query;
    }
}
