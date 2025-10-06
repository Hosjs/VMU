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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // Loại thông báo: service_request, reminder, warranty_expiry, etc.
            $table->string('title'); // Tiêu đề thông báo
            $table->text('message'); // Nội dung thông báo

            // Người nhận và người gửi
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('recipient_roles')->nullable(); // Vai trò người nhận, ngăn cách bởi dấu phẩy: admin,manager
            $table->unsignedBigInteger('sender_id')->nullable();

            // Dữ liệu liên quan
            $table->string('notifiable_type')->nullable(); // Model liên quan
            $table->bigInteger('notifiable_id')->nullable();
            $table->text('additional_data')->nullable(); // Dữ liệu bổ sung dạng key=value|key=value

            // Trạng thái
            $table->boolean('is_read')->default(false);
            $table->datetime('read_at')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            // Thông báo định kỳ
            $table->boolean('is_recurring')->default(false);
            $table->datetime('scheduled_at')->nullable(); // Thời gian gửi thông báo
            $table->datetime('expires_at')->nullable(); // Thời gian hết hạn

            $table->timestamps();

            $table->index(['user_id', 'is_read']);
            $table->index(['type', 'priority']);
            $table->index(['notifiable_type', 'notifiable_id']);
            $table->index('scheduled_at');
            $table->index(['is_read', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
