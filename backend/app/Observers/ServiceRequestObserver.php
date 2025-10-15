<?php

namespace App\Observers;

use App\Models\ServiceRequest;
use App\Models\Notification;

class ServiceRequestObserver
{
    /**
     * Handle the ServiceRequest "created" event.
     */
    public function created(ServiceRequest $serviceRequest): void
    {
        // Tạo thông báo cho admin và manager khi có yêu cầu mới
        Notification::createForServiceRequest($serviceRequest, 'high');
    }

    /**
     * Handle the ServiceRequest "updated" event.
     */
    public function updated(ServiceRequest $serviceRequest): void
    {
        // Nếu trạng thái thay đổi, tạo thông báo
        if ($serviceRequest->isDirty('status')) {
            $statusMessages = [
                'pending' => 'đang chờ xử lý',
                'contacted' => 'đã liên hệ',
                'scheduled' => 'đã lên lịch',
                'in_progress' => 'đang xử lý',
                'completed' => 'đã hoàn thành',
                'cancelled' => 'đã hủy',
            ];

            $statusText = $statusMessages[$serviceRequest->status] ?? $serviceRequest->status;

            Notification::create([
                'type' => 'service_request_status',
                'title' => 'Cập nhật trạng thái yêu cầu',
                'message' => "Yêu cầu {$serviceRequest->code} đã chuyển sang trạng thái: {$statusText}",
                'recipient_roles' => 'admin,manager',
                'notifiable_type' => ServiceRequest::class,
                'notifiable_id' => $serviceRequest->id,
                'priority' => 'normal',
                'additional_data' => json_encode([
                    'service_request_code' => $serviceRequest->code,
                    'old_status' => $serviceRequest->getOriginal('status'),
                    'new_status' => $serviceRequest->status,
                ]),
            ]);
        }

        // Nếu được assign cho ai đó, thông báo cho người đó
        if ($serviceRequest->isDirty('assigned_to') && $serviceRequest->assigned_to) {
            Notification::create([
                'type' => 'service_request_assigned',
                'title' => 'Bạn được giao yêu cầu mới',
                'message' => "Bạn được giao xử lý yêu cầu {$serviceRequest->code} từ khách hàng {$serviceRequest->customer_name}",
                'user_id' => $serviceRequest->assigned_to,
                'notifiable_type' => ServiceRequest::class,
                'notifiable_id' => $serviceRequest->id,
                'priority' => 'high',
                'additional_data' => json_encode([
                    'service_request_code' => $serviceRequest->code,
                    'customer_name' => $serviceRequest->customer_name,
                    'license_plate' => $serviceRequest->license_plate,
                ]),
            ]);
        }
    }
}

