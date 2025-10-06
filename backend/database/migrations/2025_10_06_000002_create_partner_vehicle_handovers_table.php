<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Bảng quản lý việc bàn giao xe đến gara liên kết để sửa chữa
     */
    public function up(): void
    {
        Schema::create('partner_vehicle_handovers', function (Blueprint $table) {
            $table->id();
            $table->string('handover_number')->unique(); // Số biên bản bàn giao: BG-YYYYMMDD-001

            $table->unsignedBigInteger('order_id'); // Đơn hàng liên quan
            $table->unsignedBigInteger('vehicle_id'); // Xe được bàn giao
            $table->unsignedBigInteger('provider_id'); // Gara liên kết nhận xe

            // Loại bàn giao
            $table->enum('handover_type', ['delivery', 'return']);
            // delivery: Bàn giao xe cho gara để sửa, return: Nhận lại xe đã sửa xong

            // Người bàn giao (từ phía Thắng Trường)
            $table->unsignedBigInteger('delivered_by')->nullable(); // Nhân viên Thắng Trường giao xe
            $table->string('delivered_by_name')->nullable(); // Tên người giao (backup)
            $table->string('delivered_by_phone')->nullable(); // SĐT người giao

            // Người nhận (từ phía gara liên kết)
            $table->unsignedBigInteger('received_by_technician')->nullable(); // Kỹ thuật viên gara nhận xe (nếu đã tạo user)
            $table->string('received_by_name'); // Tên kỹ thuật viên nhận xe
            $table->string('received_by_phone'); // SĐT kỹ thuật viên
            $table->string('received_by_position')->nullable(); // Chức vụ: technician, foreman, manager
            $table->string('technician_license_number')->nullable(); // Số chứng chỉ kỹ thuật viên

            // Thông tin xe tại thời điểm bàn giao
            $table->integer('mileage'); // Số km
            $table->decimal('fuel_level', 3, 1)->nullable(); // Mức nhiên liệu (0-100%)
            $table->text('vehicle_condition')->nullable(); // Tình trạng xe: good|fair|poor

            // Tài sản kèm theo
            $table->text('included_items')->nullable(); // Đồ dùng kèm theo, ngăn cách bởi |
            $table->text('vehicle_documents')->nullable(); // Giấy tờ xe: registration|insurance, ngăn cách bởi |

            // Công việc cần thực hiện
            $table->text('work_description'); // Mô tả công việc cần làm
            $table->text('special_instructions')->nullable(); // Yêu cầu đặc biệt
            $table->datetime('expected_completion')->nullable(); // Thời gian hoàn thành dự kiến

            // Hình ảnh minh chứng
            $table->text('handover_image_urls')->nullable(); // URL ảnh xe khi bàn giao, ngăn cách bởi |
            $table->text('damage_image_urls')->nullable(); // URL ảnh hư hỏng hiện tại, ngăn cách bởi |

            // Chữ ký xác nhận
            $table->string('delivered_by_signature')->nullable(); // Chữ ký người giao
            $table->string('received_by_signature')->nullable(); // Chữ ký người nhận
            $table->boolean('is_acknowledged')->default(false); // Đã xác nhận bàn giao
            $table->datetime('acknowledged_at')->nullable(); // Thời gian xác nhận

            // Ghi chú
            $table->text('delivery_notes')->nullable(); // Ghi chú của người giao
            $table->text('receive_notes')->nullable(); // Ghi chú của người nhận
            $table->text('admin_notes')->nullable(); // Ghi chú nội bộ (chỉ admin)

            // Trạng thái
            $table->enum('status', ['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'disputed'])
                ->default('draft');

            // Thời gian
            $table->datetime('handover_date'); // Thời gian bàn giao thực tế
            $table->datetime('planned_return_date')->nullable(); // Ngày dự kiến trả xe

            $table->timestamps();

            $table->index(['order_id', 'handover_type']);
            $table->index(['provider_id', 'status']);
            $table->index(['vehicle_id', 'handover_date']);
            $table->index(['delivered_by', 'handover_date']);
            $table->index(['received_by_technician', 'status']);
            $table->index(['handover_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_vehicle_handovers');
    }
};

