<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            self::recordAudit($model, 'created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            if (empty($changes)) {
                return;
            }
            $original = array_intersect_key($model->getOriginal(), $changes);
            self::recordAudit($model, 'updated', $original, $changes);
        });

        static::deleted(function ($model) {
            self::recordAudit($model, 'deleted', $model->getOriginal(), null);
        });
    }

    protected static function recordAudit($model, string $event, ?array $old, ?array $new): void
    {
        try {
            AuditLog::create([
                'user_id' => Auth::id(),
                'auditable_type' => get_class($model),
                'auditable_id' => $model->getKey(),
                'event' => $event,
                'old_values' => $old,
                'new_values' => $new,
                'ip_address' => Request::ip(),
                'user_agent' => substr((string) Request::userAgent(), 0, 500),
            ]);
        } catch (\Throwable $e) {
            // Audit must never break the main write path.
            logger()->warning('Audit log failed: ' . $e->getMessage());
        }
    }
}
