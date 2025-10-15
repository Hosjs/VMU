<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Mã đối tác
            $table->string('name'); // Tên đối tác
            $table->string('business_name')->nullable(); // Tên doanh nghiệp
            $table->string('tax_code')->nullable(); // Mã số thuế

            // Loại đối tác
            $table->enum('provider_type', ['supplier', 'garage', 'both'])->default('supplier');
            // supplier: Nhà cung cấp phụ tùng, garage: Gara liên kết, both: Cả hai

            // Thông tin liên hệ
            $table->string('contact_person')->nullable(); // Người đại diện
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();

            // Thông tin ngân hàng
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->string('bank_branch')->nullable();

            // GARA LIÊN KẾT: Loại dịch vụ cung cấp
            $table->text('service_types')->nullable(); // Các loại dịch vụ: repair,parts,maintenance
            $table->text('specializations')->nullable(); // Chuyên môn: engine,electrical,bodywork

            // Điều khoản hợp tác
            $table->decimal('commission_rate', 5, 2)->default(0); // % hoa hồng
            $table->integer('payment_terms')->default(30); // Thời hạn thanh toán (ngày)
            $table->decimal('credit_limit', 15, 2)->default(0); // Hạn mức công nợ
            $table->enum('payment_method', ['cash', 'transfer', 'check'])->default('transfer');

            // Đánh giá và xếp hạng (chủ yếu cho gara liên kết)
            $table->decimal('rating', 3, 2)->default(0); // Điểm đánh giá 0-10
            $table->integer('completed_orders')->default(0); // Số đơn đã hoàn thành
            $table->decimal('average_completion_time', 8, 2)->default(0); // Thời gian hoàn thành TB (giờ)

            // Trạng thái
            $table->enum('status', ['active', 'inactive', 'suspended', 'blacklisted'])->default('active');
            $table->date('contract_start')->nullable(); // Ngày bắt đầu hợp tác
            $table->date('contract_end')->nullable(); // Ngày kết thúc hợp tác

            // Ghi chú
            $table->text('notes')->nullable();
            $table->text('attachment_urls')->nullable(); // URL hợp đồng, giấy phép, ngăn cách bởi |

            // Người quản lý
            $table->unsignedBigInteger('managed_by')->nullable();

            $table->timestamps();

            $table->index(['provider_type', 'status']);
            $table->index(['code', 'status']);
            $table->index(['status', 'rating']);
            $table->index('tax_code');
            $table->index('managed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
