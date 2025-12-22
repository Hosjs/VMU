<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LecturerPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lecturer_id',
        'teaching_assignment_id',
        'lop_id',
        'semester_code',
        'subject_code',
        'subject_name',
        'education_level',
        'credits',
        'class_name',
        'student_count',
        'start_date',
        'end_date',
        'completion_date',
        'teaching_hours_start',
        'teaching_hours_end',
        'practical_hours',
        'theory_sessions',
        'practical_sessions',
        'total_sessions',
        'hourly_rate',
        'total_amount',
        'insurance_rate',
        'insurance_amount',
        'net_amount',
        'payment_status',
        'payment_date',
        'payment_method',
        'bank_account',
        'bank_name',
        'notes',
        'rejection_reason',
        'created_by',
        'updated_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'completion_date' => 'date',
        'payment_date' => 'date',
        'approved_at' => 'datetime',
        'credits' => 'integer',
        'student_count' => 'integer',
        'theory_sessions' => 'integer',
        'practical_sessions' => 'integer',
        'total_sessions' => 'integer',
        'teaching_hours_start' => 'decimal:2',
        'teaching_hours_end' => 'decimal:2',
        'practical_hours' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'insurance_rate' => 'decimal:2',
        'insurance_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
    ];

    /**
     * Relationship: Payment belongs to Lecturer
     */
    public function lecturer()
    {
        return $this->belongsTo(Lecturer::class);
    }

    /**
     * Relationship: Payment belongs to TeachingAssignment
     */
    public function teachingAssignment()
    {
        return $this->belongsTo(TeachingAssignment::class);
    }

    /**
     * Relationship: Payment belongs to Class (Lop)
     */
    public function lop()
    {
        return $this->belongsTo(classes::class, 'lop_id');
    }

    /**
     * Relationship: Payment created by User
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Payment updated by User
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Payment approved by User
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope: Filter by lecturer
     */
    public function scopeByLecturer($query, $lecturerId)
    {
        if ($lecturerId) {
            return $query->where('lecturer_id', $lecturerId);
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
     * Scope: Filter by payment status
     */
    public function scopeByStatus($query, $status)
    {
        if ($status) {
            return $query->where('payment_status', $status);
        }
        return $query;
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        if ($startDate && $endDate) {
            return $query->whereBetween('start_date', [$startDate, $endDate]);
        }
        return $query;
    }

    /**
     * Scope: Search by various fields
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('subject_name', 'like', "%{$search}%")
                  ->orWhere('subject_code', 'like', "%{$search}%")
                  ->orWhere('class_name', 'like', "%{$search}%")
                  ->orWhere('semester_code', 'like', "%{$search}%")
                  ->orWhereHas('lecturer', function ($q2) use ($search) {
                      $q2->where('hoTen', 'like', "%{$search}%");
                  });
            });
        }
        return $query;
    }

    public function calculateTotalAmount()
    {
        // Calculate theory amount: sessions * 3 hours * rate
        $theoryAmount = $this->theory_sessions * 3 * $this->hourly_rate;

        // Calculate practical amount: sessions * 3 hours * rate
        $practicalAmount = $this->practical_sessions * 3 * $this->hourly_rate;

        // Total amount
        $this->total_amount = $theoryAmount + $practicalAmount;

        return $this->total_amount;
    }

    /**
     * Calculate insurance amount
     */
    public function calculateInsuranceAmount()
    {
        $this->insurance_amount = ($this->total_amount * $this->insurance_rate) / 100;
        return $this->insurance_amount;
    }

    /**
     * Calculate net amount (total - insurance)
     */
    public function calculateNetAmount()
    {
        $this->net_amount = $this->total_amount - $this->insurance_amount;
        return $this->net_amount;
    }

    /**
     * Auto-calculate all amounts
     */
    public function autoCalculate()
    {
        $this->calculateTotalAmount();
        $this->calculateInsuranceAmount();
        $this->calculateNetAmount();
    }

    /**
     * Boot method to auto-calculate on save
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($payment) {
            $payment->autoCalculate();
            $payment->total_sessions = $payment->theory_sessions + $payment->practical_sessions;
        });
    }
}

