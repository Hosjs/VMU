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
        Schema::create('warranties', function (Blueprint $table) {
            $table->id();
            $table->string('warranty_number')->unique();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('order_item_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('vehicle_id')->nullable();

            // Thông tin bảo hành
            $table->enum('type', ['service', 'product']);
            $table->string('item_name');
            $table->string('item_code');

            // Thời hạn bảo hành
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('warranty_months');

            // Điều kiện bảo hành - thay JSON bằng text
            $table->text('warranty_terms')->nullable();
            $table->text('covered_issues')->nullable(); // Danh sách vấn đề được bảo hành, ngăn cách bởi |
            $table->text('excluded_issues')->nullable(); // Danh sách vấn đề không được bảo hành, ngăn cách bởi |

            // Trạng thái
            $table->enum('status', ['active', 'expired', 'used', 'cancelled'])->default('active');

            // Thông tin sử dụng bảo hành
            $table->integer('usage_count')->default(0);
            $table->integer('max_usage')->nullable();

            $table->text('notes')->nullable();
            $table->text('attachment_urls')->nullable(); // URL file đính kèm, ngăn cách bởi |

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['vehicle_id', 'status']);
            $table->index(['end_date', 'status']);
            $table->index('warranty_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};
