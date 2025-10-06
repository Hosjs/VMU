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
            $table->string('inspection_number')->unique();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('customer_id');

            // Loại kiểm tra
            $table->enum('type', ['receive', 'return']); // Nhận xe hoặc trả xe

            // Thông tin nhân viên
            $table->unsignedBigInteger('inspector_id');
            $table->unsignedBigInteger('customer_representative_id')->nullable();

            // Thông tin xe tại thời điểm kiểm tra
            $table->integer('mileage');
            $table->decimal('fuel_level', 3, 1)->nullable();

            // Kiểm tra ngoại thất - thay JSON bằng text đơn giản
            $table->text('exterior_condition')->nullable(); // Format: part:condition|part:condition
            $table->text('exterior_damages')->nullable(); // Format: part:damage_type:severity|...

            // Kiểm tra nội thất
            $table->text('interior_condition')->nullable(); // Format: part:condition|part:condition
            $table->text('interior_damages')->nullable(); // Format: part:damage_type:severity|...

            // Kiểm tra chức năng
            $table->text('functional_checks')->nullable(); // Format: function:status|function:status
            $table->text('functional_issues')->nullable(); // Format: function:issue:severity|...

            // Đồ dùng cá nhân trong xe
            $table->text('personal_items')->nullable(); // Danh sách đồ vật, ngăn cách bởi |
            $table->text('vehicle_accessories')->nullable(); // Danh sách phụ kiện:status, ngăn cách bởi |

            // Hình ảnh và video
            $table->text('image_urls')->nullable(); // URL hình ảnh, ngăn cách bởi |
            $table->text('video_urls')->nullable(); // URL video, ngăn cách bởi |

            // Chữ ký xác nhận
            $table->text('inspector_notes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->boolean('customer_acknowledged')->default(false);
            $table->datetime('customer_acknowledged_at')->nullable();
            $table->string('customer_signature')->nullable();
            $table->string('inspector_signature')->nullable();

            // Trạng thái
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'disputed'])->default('draft');

            $table->datetime('inspection_date');
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
