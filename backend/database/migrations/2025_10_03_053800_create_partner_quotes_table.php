<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Bảng quản lý báo giá từ gara liên kết
     * Quy trình: Khách gửi yêu cầu -> Admin liên lạc đối tác -> Đối tác báo giá -> Admin báo giá cho khách với giá chênh lệch
     */
    public function up(): void
    {
        Schema::create('partner_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique(); // Mã báo giá: PQ-YYYYMMDD-001

            // Liên kết
            $table->unsignedBigInteger('service_request_id'); // Yêu cầu dịch vụ từ khách hàng
            $table->unsignedBigInteger('order_id')->nullable(); // Đơn hàng (nếu đã tạo)
            $table->unsignedBigInteger('provider_id'); // Gara liên kết báo giá
            $table->unsignedBigInteger('vehicle_id')->nullable(); // Xe cần sửa

            // Thông tin gara liên kết (snapshot)
            $table->string('provider_name');
            $table->string('provider_code')->nullable();
            $table->string('provider_contact_person')->nullable();
            $table->string('provider_phone')->nullable();
            $table->string('provider_email')->nullable();

            // Thông tin người xử lý
            $table->unsignedBigInteger('requested_by'); // Admin yêu cầu báo giá
            $table->unsignedBigInteger('quoted_by_partner')->nullable(); // Người báo giá từ phía đối tác
            $table->string('quoted_by_partner_name')->nullable(); // Tên người báo giá

            // Thời gian
            $table->datetime('request_date'); // Ngày yêu cầu báo giá
            $table->datetime('quote_date')->nullable(); // Ngày đối tác gửi báo giá
            $table->datetime('quote_valid_until')->nullable(); // Báo giá có hiệu lực đến
            $table->datetime('customer_quote_date')->nullable(); // Ngày báo giá cho khách hàng

            // Mô tả công việc
            $table->text('work_description'); // Mô tả chi tiết công việc cần làm
            $table->text('special_requirements')->nullable(); // Yêu cầu đặc biệt
            $table->integer('estimated_duration_hours')->nullable(); // Thời gian ước tính (giờ)

            // Trạng thái
            $table->enum('status', [
                'pending',           // Chờ đối tác báo giá
                'quoted',            // Đối tác đã báo giá
                'customer_quoted',   // Đã báo giá cho khách hàng
                'accepted',          // Khách hàng chấp nhận
                'rejected',          // Khách hàng từ chối
                'expired',           // Hết hạn
                'cancelled'          // Hủy bỏ
            ])->default('pending');

            // Ưu tiên
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            $table->timestamps();

            // Indexes
            $table->index(['service_request_id', 'status']);
            $table->index(['provider_id', 'status']);
            $table->index(['order_id', 'status']);
            $table->index(['status', 'quote_valid_until']);
            $table->index(['requested_by', 'quote_date']);
            $table->index('quote_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_quotes');
    }
};

