<?php

namespace App\Http\Controllers\Api\Common;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get notifications for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);
        $unreadOnly = $request->get('unread_only');
        $type = $request->get('type');

        // ✅ 1 query duy nhất với all conditions
        $query = Notification::query()
            ->with(['sender:id,name', 'notifiable'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id);
                // Only check role if user has one
                if ($user->role) {
                    $q->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
                }
            })
            ->notExpired();

        // Filters with when()
        $query->when($unreadOnly, fn($q) => $q->unread())
              ->when($type, fn($q) => $q->byType($type));

        // Sort by priority and date
        $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')")
              ->orderBy('created_at', 'desc');

        // ✅ Trả về trực tiếp Laravel pagination
        return $query->paginate($perPage);
    }

    /**
     * Get unread count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id);
            // Only check role if user has one
            if ($user->role) {
                $q->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
            }
        })
        ->unread()
        ->notExpired()
        ->count();

        return response()->json([
            'success' => true,
            'data' => ['count' => $count]
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'message' => 'Đã đánh dấu đã đọc',
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id);
            // Only check role if user has one
            if ($user->role) {
                $q->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
            }
        })
        ->unread()
        ->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'Đã đánh dấu tất cả là đã đọc']);
    }

    /**
     * Delete notification
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Đã xóa thông báo']);
    }
}
