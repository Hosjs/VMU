<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\ServiceRequest;
use App\Models\Service;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\VehicleServiceHistory;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompleteDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Tạo dữ liệu test HOÀN CHỈNH theo workflow:
     * 1. Khách hàng gửi yêu cầu dịch vụ
     * 2. Admin nhận và tìm gara liên kết
     * 3. Gara báo giá (settlement price)
     * 4. Admin báo lại khách (quote price)
     * 5. Thực hiện dịch vụ
     * 6. Lưu lịch sử với giá thực tế, bảo hành, lịch bảo dưỡng
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // ==================== KHÁCH HÀNG & XE ====================
            $this->command->info('👥 Đang tạo khách hàng và xe...');

            $toyota = VehicleBrand::where('name', 'Toyota')->first();
            $honda = VehicleBrand::where('name', 'Honda')->first();
            $vios = VehicleModel::where('name', 'Vios')->first();
            $camry = VehicleModel::where('name', 'Camry')->first();
            $civic = VehicleModel::where('name', 'Civic')->first();
            $crv = VehicleModel::where('name', 'CR-V')->first();

            $customers = [
                [
                    'name' => 'Nguyễn Văn Khách',
                    'phone' => '0911111111',
                    'email' => 'khach1@email.com',
                    'address' => '123 Đường ABC, Quận 1, TP.HCM',
                    'birth_date' => '1985-05-15',
                    'gender' => 'male',
                    'is_active' => true,
                    'vehicle' => [
                        'brand_id' => $toyota->id,
                        'model_id' => $vios->id,
                        'license_plate' => '51A-12345',
                        'vin' => 'VNVIOS20180001',
                        'year' => 2018,
                        'color' => 'Trắng',
                        'mileage' => 45000,
                    ],
                ],
                [
                    'name' => 'Trần Thị Lan',
                    'phone' => '0922222222',
                    'email' => 'lan@email.com',
                    'address' => '456 Đường XYZ, Quận 3, TP.HCM',
                    'birth_date' => '1990-08-20',
                    'gender' => 'female',
                    'is_active' => true,
                    'vehicle' => [
                        'brand_id' => $toyota->id,
                        'model_id' => $camry->id,
                        'license_plate' => '51B-67890',
                        'vin' => 'VNCAMRY20200001',
                        'year' => 2020,
                        'color' => 'Đen',
                        'mileage' => 28000,
                    ],
                ],
                [
                    'name' => 'Lê Văn Minh',
                    'phone' => '0933333333',
                    'email' => 'minh@email.com',
                    'address' => '789 Đường DEF, Quận 10, TP.HCM',
                    'birth_date' => '1988-12-10',
                    'gender' => 'male',
                    'is_active' => true,
                    'vehicle' => [
                        'brand_id' => $honda->id,
                        'model_id' => $civic->id,
                        'license_plate' => '51C-11111',
                        'vin' => 'VNCIVIC20190001',
                        'year' => 2019,
                        'color' => 'Xám',
                        'mileage' => 35000,
                    ],
                ],
            ];

            $customerModels = [];
            $vehicleModels = [];

            foreach ($customers as $customerData) {
                $vehicleData = $customerData['vehicle'];
                unset($customerData['vehicle']);

                $customer = Customer::create($customerData);
                $customerModels[] = $customer;

                $vehicleData['customer_id'] = $customer->id;
                $vehicle = Vehicle::create($vehicleData);
                $vehicleModels[] = $vehicle;
            }

            $this->command->info('✅ Đã tạo ' . count($customerModels) . ' khách hàng và xe');

            // ==================== WORKFLOW MẪU ====================
            $this->command->info('📋 Đang tạo workflow mẫu...');

            $admin = User::first();
            $maintenanceService = Service::where('code', 'MAINTENANCE')->first();
            $brakeService = Service::where('code', 'BRAKE_REPAIR')->first();
            $garage1 = Provider::where('code', 'GARAGE-001')->first();
            $garage2 = Provider::where('code', 'GARAGE-002')->first();

            // Products
            $oilCastrol = Product::where('code', 'OIL-CASTROL-5W30-TOY')->first();
            $oilFilter = Product::where('code', 'FILTER-OIL-VIOS-18')->first();
            $airFilter = Product::where('code', 'FILTER-AIR-VIOS-18')->first();
            $brakePadFront = Product::where('code', 'BRAKE-PAD-VIOS-F')->first();

            // ==================== CASE 1: Bảo dưỡng định kỳ ====================
            $customer1 = $customerModels[0];
            $vehicle1 = $vehicleModels[0];

            // 1. Khách gửi yêu cầu
            $serviceRequest1 = ServiceRequest::create([
                'code' => 'SR-' . date('Ymd') . '-001',
                'customer_name' => $customer1->name,
                'customer_phone' => $customer1->phone,
                'customer_email' => $customer1->email,
                'customer_id' => $customer1->id,
                'vehicle_brand' => $toyota->name,
                'vehicle_model' => $vios->name,
                'license_plate' => $vehicle1->license_plate,
                'vehicle_year' => $vehicle1->year,
                'description' => 'Xe cần bảo dưỡng định kỳ 45,000km',
                'preferred_date' => now()->addDays(2),
                'status' => 'completed',
                'admin_handler' => $admin->id,
                'selected_provider_id' => $garage1->id,
                'contacted_at' => now(),
                'scheduled_at' => now()->addDays(2),
                'priority' => 'normal',
            ]);

            // Attach services
            $serviceRequest1->services()->attach($maintenanceService->id, [
                'description' => 'Bảo dưỡng 45,000km: thay dầu, lọc',
                'priority' => 'normal',
                'quantity' => 1,
                'estimated_price' => 1500000,
            ]);

            // 2. Tạo order
            $order1 = Order::create([
                'order_number' => 'ORD-' . date('Ymd') . '-001',
                'customer_id' => $customer1->id,
                'vehicle_id' => $vehicle1->id,
                'service_request_id' => $serviceRequest1->id,
                'type' => 'mixed',
                'status' => 'completed',
                'quote_total' => 1800000, // Giá báo khách
                'settlement_total' => 1400000, // Giá quyết toán với gara
                'discount' => 0,
                'tax_amount' => 180000,
                'final_amount' => 1980000,
                'payment_status' => 'paid',
                'payment_method' => 'transfer',
                'paid_amount' => 1980000,
                'salesperson_id' => $admin->id,
                'technician_id' => null,
                'partner_provider_id' => $garage1->id,
                'quote_date' => now(),
                'confirmed_date' => now(),
                'start_date' => now()->addDays(2),
                'completion_date' => now()->addDays(2)->addHours(2),
                'delivery_date' => now()->addDays(2)->addHours(2),
            ]);

            // 3. Order items với giá khác nhau
            // Dịch vụ
            $orderItem1 = OrderItem::create([
                'order_id' => $order1->id,
                'item_type' => 'service',
                'service_id' => $maintenanceService->id,
                'item_name' => $maintenanceService->name,
                'item_code' => $maintenanceService->code,
                'quantity' => 1,
                'unit' => 'lần',
                'quote_unit_price' => 500000, // Giá báo khách
                'quote_total_price' => 500000,
                'settlement_unit_price' => 350000, // Giá quyết toán gara
                'settlement_total_price' => 350000,
                'status' => 'completed',
                'partner_technician_name' => 'Kỹ thuật viên Gara Bình Minh',
                'has_warranty' => true,
                'warranty_months' => 3,
                'warranty_start_date' => now()->addDays(2),
                'warranty_end_date' => now()->addDays(2)->addMonths(3),
            ]);

            // Sản phẩm: Dầu Castrol
            $orderItem2 = OrderItem::create([
                'order_id' => $order1->id,
                'item_type' => 'product',
                'product_id' => $oilCastrol->id,
                'item_name' => $oilCastrol->name,
                'item_code' => $oilCastrol->code,
                'quantity' => 4,
                'unit' => 'lít',
                'quote_unit_price' => 150000, // Giá báo khách
                'quote_total_price' => 600000,
                'settlement_unit_price' => 120000, // Giá từ gara (hoặc cost nếu từ kho)
                'settlement_total_price' => 480000,
                'status' => 'completed',
                'has_warranty' => false,
            ]);

            // Sản phẩm: Lọc dầu
            $orderItem3 = OrderItem::create([
                'order_id' => $order1->id,
                'item_type' => 'product',
                'product_id' => $oilFilter->id,
                'item_name' => $oilFilter->name,
                'item_code' => $oilFilter->code,
                'quantity' => 1,
                'unit' => 'cái',
                'quote_unit_price' => 100000,
                'quote_total_price' => 100000,
                'settlement_unit_price' => 70000,
                'settlement_total_price' => 70000,
                'status' => 'completed',
                'has_warranty' => true,
                'warranty_months' => 6,
                'warranty_start_date' => now()->addDays(2),
                'warranty_end_date' => now()->addDays(2)->addMonths(6),
            ]);

            // Sản phẩm: Lọc gió
            $orderItem4 = OrderItem::create([
                'order_id' => $order1->id,
                'item_type' => 'product',
                'product_id' => $airFilter->id,
                'item_name' => $airFilter->name,
                'item_code' => $airFilter->code,
                'quantity' => 1,
                'unit' => 'cái',
                'quote_unit_price' => 180000,
                'quote_total_price' => 180000,
                'settlement_unit_price' => 130000,
                'settlement_total_price' => 130000,
                'status' => 'completed',
                'has_warranty' => true,
                'warranty_months' => 12,
                'warranty_start_date' => now()->addDays(2),
                'warranty_end_date' => now()->addDays(2)->addMonths(12),
            ]);

            // 4. Lưu lịch sử dịch vụ
            VehicleServiceHistory::create([
                'history_number' => 'VH-' . date('Ymd') . '-001',
                'vehicle_id' => $vehicle1->id,
                'customer_id' => $customer1->id,
                'order_id' => $order1->id,
                'order_item_id' => $orderItem1->id,
                'type' => 'service',
                'service_id' => $maintenanceService->id,
                'item_name' => $maintenanceService->name,
                'item_code' => $maintenanceService->code,
                'description' => 'Bảo dưỡng định kỳ 45,000km',
                'quantity' => 1,
                'unit' => 'lần',
                'quote_unit_price' => 500000,
                'quote_total_price' => 500000,
                'settlement_unit_price' => 350000,
                'settlement_total_price' => 350000,
                'actual_paid' => 500000,
                'provider_id' => $garage1->id,
                'provider_name' => $garage1->name,
                'technician_name' => 'Kỹ thuật viên Gara Bình Minh',
                'mileage_at_service' => 45000,
                'service_date' => now()->addDays(2),
                'has_warranty' => true,
                'warranty_months' => 3,
                'warranty_start_date' => now()->addDays(2),
                'warranty_end_date' => now()->addDays(2)->addMonths(3),
                'warranty_status' => 'active',
                'is_maintenance' => true,
                'next_maintenance_mileage' => 50000,
                'next_maintenance_date' => now()->addDays(2)->addMonths(2),
                'status' => 'completed',
            ]);

            // Lịch sử cho từng sản phẩm
            foreach ([$orderItem2, $orderItem3, $orderItem4] as $item) {
                VehicleServiceHistory::create([
                    'history_number' => 'VH-' . date('Ymd') . '-' . str_pad($item->id, 3, '0', STR_PAD_LEFT),
                    'vehicle_id' => $vehicle1->id,
                    'customer_id' => $customer1->id,
                    'order_id' => $order1->id,
                    'order_item_id' => $item->id,
                    'type' => 'product',
                    'product_id' => $item->product_id,
                    'item_name' => $item->item_name,
                    'item_code' => $item->item_code,
                    'description' => 'Thay ' . $item->item_name,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'quote_unit_price' => $item->quote_unit_price,
                    'quote_total_price' => $item->quote_total_price,
                    'settlement_unit_price' => $item->settlement_unit_price,
                    'settlement_total_price' => $item->settlement_total_price,
                    'actual_paid' => $item->quote_total_price,
                    'provider_id' => $garage1->id,
                    'provider_name' => $garage1->name,
                    'mileage_at_service' => 45000,
                    'service_date' => now()->addDays(2),
                    'has_warranty' => $item->has_warranty,
                    'warranty_months' => $item->warranty_months ?? 0, // Mặc định 0 nếu null
                    'warranty_start_date' => $item->warranty_start_date,
                    'warranty_end_date' => $item->warranty_end_date,
                    'warranty_status' => $item->has_warranty ? 'active' : null,
                    'is_maintenance' => true,
                    'status' => 'completed',
                ]);
            }

            $this->command->info('✅ Đã tạo workflow mẫu 1: Bảo dưỡng định kỳ');

            DB::commit();
            $this->command->info('✅ Hoàn tất tạo dữ liệu test hoàn chỉnh!');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Lỗi: ' . $e->getMessage());
            throw $e;
        }
    }
}

