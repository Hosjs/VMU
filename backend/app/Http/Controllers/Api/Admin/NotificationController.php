<?php

namespace App\Http\Controllers\Api\Admin;

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
        $query = Notification::query();

        // Filter by user or role
        $query->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
        });

        // Filter by read status
        if ($request->has('unread_only') && $request->unread_only) {
            $query->unread();
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Not expired
        $query->notExpired();

        // Order by priority and date
        $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')")
              ->orderBy('created_at', 'desc');

        // Paginate
        $perPage = $request->get('per_page', 15);
        $notifications = $query->with(['sender', 'notifiable'])->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Get unread count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
        })
        ->unread()
        ->notExpired()
        ->count();

        return response()->json(['count' => $count]);
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
            $q->where('user_id', $user->id)
              ->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
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

    /**
     * Get latest notifications for real-time updates (SSE endpoint)
     */
    public function stream(Request $request)
    {
        $user = $request->user();

        // Set headers for SSE
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        // Disable output buffering
        if (ob_get_level()) {
            ob_end_clean();
        }

        $lastId = $request->get('lastId', 0);

        // Get new notifications
        $notifications = Notification::where('id', '>', $lastId)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereRaw("FIND_IN_SET(?, recipient_roles)", [$user->role->name]);
            })
            ->notExpired()
            ->orderBy('created_at', 'desc')
            ->with(['sender', 'notifiable'])
            ->get();

        if ($notifications->isNotEmpty()) {
            echo "data: " . json_encode([
                'notifications' => $notifications,
                'lastId' => $notifications->first()->id,
                'count' => $notifications->count(),
            ]) . "\n\n";
            flush();
        }

        return response()->noContent();
    }
}
