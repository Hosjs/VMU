<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Invoice;
use App\Models\ServiceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BadgeController extends Controller
{
    /**
     * Lấy số đếm cho tất cả badge trên sidebar
     * Số liệu động dựa theo role và trạng thái
     */
    public function getCounts(Request $request)
    {
        $user = Auth::user();
        $role = $user->role->name ?? 'employee';

        $counts = [
            'orders' => 0,
            'invoices' => 0,
            'service_requests' => 0,
            'work_orders' => 0,
            'notifications' => 0,
        ];

        switch ($role) {
            case 'admin':
                // Admin: Đếm đơn hàng chưa xác nhận + đang thực hiện
                $counts['orders'] = Order::whereIn('status', ['draft', 'quoted', 'confirmed', 'in_progress'])
                    ->count();

                // Hóa đơn chưa thanh toán hoặc thanh toán 1 phần
                $counts['invoices'] = Invoice::whereIn('payment_status', ['pending', 'partial'])
                    ->whereIn('status', ['draft', 'pending', 'sent'])
                    ->count();

                // Yêu cầu dịch vụ chưa xử lý
                $counts['service_requests'] = ServiceRequest::whereIn('status', ['pending', 'quoted'])
                    ->count();

                break;

            case 'manager':
                // Manager: Đơn hàng cần quản lý
                $counts['orders'] = Order::whereIn('status', ['confirmed', 'in_progress'])
                    ->count();

                // Yêu cầu dịch vụ cần xử lý
                $counts['service_requests'] = ServiceRequest::whereIn('status', ['pending', 'quoted', 'approved'])
                    ->count();

                break;

            case 'accountant':
                // Accountant: Hóa đơn cần xử lý
                $counts['invoices'] = Invoice::whereIn('payment_status', ['pending', 'partial'])
                    ->whereIn('status', ['draft', 'pending', 'sent'])
                    ->count();

                // Đơn hàng cần quyết toán
                $counts['orders'] = Order::where('status', 'completed')
                    ->whereIn('payment_status', ['pending', 'partial'])
                    ->count();

                break;

            case 'mechanic':
                // Mechanic: Lệnh sửa chữa được giao
                $counts['work_orders'] = Order::where('type', 'service')
                    ->where('technician_id', $user->id)
                    ->whereIn('status', ['confirmed', 'in_progress'])
                    ->count();

                // Yêu cầu dịch vụ được giao
                $counts['service_requests'] = ServiceRequest::where('assigned_to', $user->id)
                    ->whereIn('status', ['approved', 'in_progress'])
                    ->count();

                break;

            case 'employee':
                // Employee: Công việc được giao
                $counts['work_orders'] = Order::where(function($query) use ($user) {
                        $query->where('salesperson_id', $user->id)
                              ->orWhere('technician_id', $user->id);
                    })
                    ->whereIn('status', ['confirmed', 'in_progress'])
                    ->count();

                break;

            default:
                break;
        }

        // Đếm thông báo chưa đọc (tất cả role)
        $counts['notifications'] = $user->notifications()
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'data' => $counts,
            'role' => $role,
        ]);
    }

    /**
     * Lấy số đếm cho một loại badge cụ thể
     */
    public function getCount(Request $request, $type)
    {
        $user = Auth::user();
        $role = $user->role->name ?? 'employee';
        $count = 0;

        switch ($type) {
            case 'orders':
                if ($role === 'admin') {
                    $count = Order::whereIn('status', ['draft', 'quoted', 'confirmed', 'in_progress'])->count();
                } elseif ($role === 'manager') {
                    $count = Order::whereIn('status', ['confirmed', 'in_progress'])->count();
                } elseif ($role === 'accountant') {
                    $count = Order::where('status', 'completed')
                        ->whereIn('payment_status', ['pending', 'partial'])
                        ->count();
                }
                break;

            case 'invoices':
                if (in_array($role, ['admin', 'accountant'])) {
                    $count = Invoice::whereIn('payment_status', ['pending', 'partial'])
                        ->whereIn('status', ['draft', 'pending', 'sent'])
                        ->count();
                }
                break;

            case 'service_requests':
                if ($role === 'admin') {
                    $count = ServiceRequest::whereIn('status', ['pending', 'quoted'])->count();
                } elseif ($role === 'manager') {
                    $count = ServiceRequest::whereIn('status', ['pending', 'quoted', 'approved'])->count();
                } elseif ($role === 'mechanic') {
                    $count = ServiceRequest::where('assigned_to', $user->id)
                        ->whereIn('status', ['approved', 'in_progress'])
                        ->count();
                }
                break;

            case 'work_orders':
                if ($role === 'mechanic') {
                    $count = Order::where('type', 'service')
                        ->where('technician_id', $user->id)
                        ->whereIn('status', ['confirmed', 'in_progress'])
                        ->count();
                } elseif ($role === 'employee') {
                    $count = Order::where(function($query) use ($user) {
                            $query->where('salesperson_id', $user->id)
                                  ->orWhere('technician_id', $user->id);
                        })
                        ->whereIn('status', ['confirmed', 'in_progress'])
                        ->count();
                }
                break;

            case 'notifications':
                $count = $user->notifications()->where('is_read', false)->count();
                break;

            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid badge type',
                ], 400);
        }

        return response()->json([
            'success' => true,
            'type' => $type,
            'count' => $count,
            'role' => $role,
        ]);
    }
}

