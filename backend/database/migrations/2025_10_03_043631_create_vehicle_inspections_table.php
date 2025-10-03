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
        Schema::create('vehicle_inspections', function (Blueprint $table) {
            $table->id();
            $table->string('inspection_number')->unique(); // Số phiếu kiểm tra
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');

            // Loại kiểm tra
            $table->enum('type', ['receive', 'return']); // Nhận xe hoặc trả xe

            // Thông tin nhân viên
            $table->foreignId('inspector_id')->constrained('users')->onDelete('cascade'); // Nhân viên kiểm tra
            $table->foreignId('customer_representative_id')->nullable()->constrained('users')->onDelete('set null'); // Đại diện khách hàng (nếu có)

            // Thông tin xe tại thời điểm kiểm tra
            $table->integer('mileage'); // Số km
            $table->decimal('fuel_level', 3, 1)->nullable(); // Mức nhiên liệu (0-100%)

            // Kiểm tra ngoại thất
            $table->json('exterior_condition'); // Tình trạng ngoại thất
            $table->json('exterior_damages')->nullable(); // Hư hỏng ngoại thất

            // Kiểm tra nội thất
            $table->json('interior_condition'); // Tình trạng nội thất
            $table->json('interior_damages')->nullable(); // Hư hỏng nội thất

            // Kiểm tra chức năng
            $table->json('functional_checks'); // Kiểm tra các chức năng
            $table->json('functional_issues')->nullable(); // Vấn đề chức năng

            // Đồ dùng cá nhân trong xe
            $table->json('personal_items')->nullable(); // Đồ dùng cá nhân
            $table->json('vehicle_accessories')->nullable(); // Phụ kiện xe

            // Hình ảnh và video
            $table->json('images')->nullable(); // Hình ảnh kiểm tra
            $table->json('videos')->nullable(); // Video kiểm tra

            // Chữ ký xác nhận
            $table->text('inspector_notes')->nullable(); // Ghi chú của nhân viên kiểm tra
            $table->text('customer_notes')->nullable(); // Ghi chú của khách hàng
            $table->boolean('customer_acknowledged')->default(false); // Khách hàng đã xác nhận
            $table->datetime('customer_acknowledged_at')->nullable();
            $table->string('customer_signature')->nullable(); // Chữ ký điện tử khách hàng
            $table->string('inspector_signature')->nullable(); // Chữ ký nhân viên

            // Trạng thái
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'disputed'])->default('draft');

            $table->datetime('inspection_date'); // Thời gian kiểm tra
            $table->timestamps();

            $table->index(['vehicle_id', 'type']);
            $table->index(['order_id', 'type']);
            $table->index(['inspector_id', 'inspection_date']);
            $table->index(['status', 'customer_acknowledged']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspections');
    }
};
