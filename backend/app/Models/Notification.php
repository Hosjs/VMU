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
        'read_at' => 'datetime',
        'is_recurring' => 'boolean',
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
    // ACCESSORS
    // =====================

    public function getRecipientRolesArrayAttribute()
    {
        return $this->recipient_roles ? explode(',', $this->recipient_roles) : [];
    }

    public function getAdditionalDataArrayAttribute()
    {
        if (!$this->additional_data) return [];

        $items = explode('|', $this->additional_data);
        $result = [];
        foreach ($items as $item) {
            $parts = explode('=', $item, 2);
            if (count($parts) === 2) {
                $result[$parts[0]] = $parts[1];
            }
        }
        return $result;
    }

    public function getIsExpiredAttribute()
    {
        return $this->expires_at && $this->expires_at < now();
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

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at');
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>=', now());
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
}
