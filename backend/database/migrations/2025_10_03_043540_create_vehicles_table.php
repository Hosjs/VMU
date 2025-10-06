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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('brand_id');
            $table->unsignedBigInteger('model_id');

            $table->string('license_plate')->unique(); // Biển số xe
            $table->string('vin')->nullable()->unique(); // Số khung
            $table->string('engine_number')->nullable(); // Số máy
            $table->integer('year')->nullable(); // Năm sản xuất
            $table->string('color')->nullable(); // Màu xe
            $table->integer('mileage')->default(0); // Số km đã đi

            // Thông tin bảo hiểm xe
            $table->string('insurance_company')->nullable();
            $table->string('insurance_number')->nullable();
            $table->date('insurance_expiry')->nullable();

            // Thông tin đăng kiểm
            $table->string('registration_number')->nullable(); // Số đăng ký
            $table->date('registration_expiry')->nullable(); // Hạn đăng kiểm

            // Lịch bảo dưỡng
            $table->date('last_maintenance')->nullable(); // Lần bảo dưỡng cuối
            $table->date('next_maintenance')->nullable(); // Lần bảo dưỡng tiếp theo
            $table->integer('maintenance_interval')->default(10000); // Chu kỳ bảo dưỡng (km)

            $table->text('image_urls')->nullable(); // Thay JSON bằng text
            $table->text('notes')->nullable(); // Ghi chú về xe
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['customer_id', 'is_active']);
            $table->index(['brand_id', 'model_id']);
            $table->index('license_plate');
            $table->index('insurance_expiry'); // Để nhắc nhở
            $table->index('registration_expiry'); // Để nhắc nhở
            $table->index('next_maintenance'); // Để nhắc nhở
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
