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
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Mã kho: VN (Việt Nga), GT1, GT2, etc.
            $table->string('name'); // Tên kho
            $table->enum('type', ['main', 'partner']); // main: Việt Nga, partner: các gara nhận dịch vụ

            // Thông tin địa chỉ
            $table->text('address');
            $table->string('ward')->nullable();
            $table->string('district');
            $table->string('province');
            $table->string('postal_code')->nullable();

            // Thông tin liên hệ
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            // Liên kết với provider (nếu là kho của đối tác)
            $table->unsignedBigInteger('provider_id')->nullable();

            // Cấu hình kho
            $table->boolean('is_main_warehouse')->default(false); // Việt Nga = true
            $table->boolean('can_receive_transfers')->default(true);
            $table->boolean('can_send_transfers')->default(true);
            $table->integer('priority_order')->default(1);

            // Thông tin thuế
            $table->boolean('tax_exempt_transfers')->default(true);
            $table->string('tax_registration')->nullable();

            // Trạng thái
            $table->boolean('is_active')->default(true);
            $table->datetime('last_inventory_date')->nullable();

            // Người quản lý
            $table->unsignedBigInteger('manager_id')->nullable();

            $table->text('notes')->nullable();
            $table->text('operating_hours')->nullable(); // Format: Mon:08:00-17:00|Tue:08:00-17:00

            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index(['is_main_warehouse', 'is_active']);
            $table->index('provider_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
