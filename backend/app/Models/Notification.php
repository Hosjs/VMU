<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'user_id',
        'recipient_roles',
        'sender_id',
        'notifiable_type',
        'notifiable_id',
        'additional_data',
        'is_read',
        'read_at',
        'priority',
        'is_recurring',
        'scheduled_at',
        'expires_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_recurring' => 'boolean',
        'read_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // =====================
    // RELATIONSHIPS
    // =====================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function notifiable()
    {
        return $this->morphTo();
    }

    // =====================
    // SCOPES
    // =====================

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForRoles($query, $roles)
    {
        if (!is_array($roles)) {
            $roles = [$roles];
        }

        return $query->where(function ($q) use ($roles) {
            foreach ($roles as $role) {
                $q->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$role]);
            }
        });
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    // =====================
    // METHODS
    // =====================

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);
    }

    public static function createForServiceRequest($serviceRequest, $priority = 'high')
    {
        return self::create([
            'type' => 'service_request',
            'title' => 'Yêu cầu dịch vụ mới',
            'message' => "Khách hàng {$serviceRequest->customer_name} đã gửi yêu cầu dịch vụ cho xe {$serviceRequest->license_plate}",
            'recipient_roles' => 'admin,manager',
            'notifiable_type' => ServiceRequest::class,
            'notifiable_id' => $serviceRequest->id,
            'priority' => $priority,
            'additional_data' => json_encode([
                'service_request_code' => $serviceRequest->code,
                'customer_phone' => $serviceRequest->customer_phone,
                'license_plate' => $serviceRequest->license_plate,
            ]),
        ]);
    }

    public function getAdditionalDataAttribute($value)
    {
        return $value ? json_decode($value, true) : null;
    }

    public function setAdditionalDataAttribute($value)
    {
        $this->attributes['additional_data'] = is_array($value) ? json_encode($value) : $value;
    }
}

