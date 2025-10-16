#!/usr/bin/env php
<?php

/**
 * =====================================================
 * DATABASE MIGRATION HELPER
 * =====================================================
 * Script helper để migrate database sang cấu trúc mới
 *
 * Usage:
 *   php database/migrations/migrate_database.php
 *
 * =====================================================
 */

require __DIR__ . '/../../vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "\n";
echo "=====================================================\n";
echo "DATABASE MIGRATION - ROLE & PERMISSION SYSTEM\n";
echo "=====================================================\n";
echo "\n";

// Kiểm tra môi trường
if (app()->environment('production')) {
    echo "⚠️  WARNING: Đang chạy trên PRODUCTION environment!\n";
    echo "Bạn có chắc chắn muốn tiếp tục? (yes/no): ";
    $confirm = trim(fgets(STDIN));
    if (strtolower($confirm) !== 'yes') {
        echo "Migration đã bị hủy.\n";
        exit(0);
    }
}

// BƯỚC 1: Backup database
echo "BƯỚC 1: Backup database...\n";
$backupFile = storage_path("backups/db_backup_" . date('Y-m-d_H-i-s') . ".sql");
$backupDir = dirname($backupFile);

if (!file_exists($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$dbHost = env('DB_HOST', '127.0.0.1');
$dbName = env('DB_DATABASE', 'gara');
$dbUser = env('DB_USERNAME', 'root');
$dbPass = env('DB_PASSWORD', '');

$command = sprintf(
    'mysqldump -h %s -u %s %s %s > %s',
    escapeshellarg($dbHost),
    escapeshellarg($dbUser),
    $dbPass ? '-p' . escapeshellarg($dbPass) : '',
    escapeshellarg($dbName),
    escapeshellarg($backupFile)
);

exec($command, $output, $returnCode);

if ($returnCode === 0) {
    echo "✅ Backup thành công: $backupFile\n";
} else {
    echo "❌ Backup thất bại! Migration bị hủy.\n";
    exit(1);
}

echo "\n";

// BƯỚC 2: Kiểm tra cấu trúc hiện tại
echo "BƯỚC 2: Kiểm tra cấu trúc hiện tại...\n";

$stats = DB::table('users')
    ->selectRaw('
        COUNT(*) as total,
        SUM(CASE WHEN role_id IS NOT NULL THEN 1 ELSE 0 END) as with_role_id,
        SUM(CASE WHEN custom_permissions IS NOT NULL THEN 1 ELSE 0 END) as with_custom_permissions
    ')
    ->first();

echo "- Tổng users: {$stats->total}\n";
echo "- Users có role_id: {$stats->with_role_id}\n";
echo "- Users có custom_permissions: {$stats->with_custom_permissions}\n";

echo "\n";

// BƯỚC 3: Kiểm tra columns cần thiết
echo "BƯỚC 3: Kiểm tra columns...\n";

$hasRoleId = Schema::hasColumn('users', 'role_id');
$hasCustomPermissions = Schema::hasColumn('users', 'custom_permissions');
$hasDeletedAt = Schema::hasColumn('users', 'deleted_at');

echo "- Column role_id: " . ($hasRoleId ? "✅" : "❌") . "\n";
echo "- Column custom_permissions: " . ($hasCustomPermissions ? "✅" : "❌") . "\n";
echo "- Column deleted_at: " . ($hasDeletedAt ? "✅" : "❌") . "\n";

if (!$hasRoleId || !$hasCustomPermissions || !$hasDeletedAt) {
    echo "\n⚠️  Cần chạy migrations Laravel trước:\n";
    echo "   php artisan migrate\n";
    exit(1);
}

echo "\n";

// BƯỚC 4: Migrate dữ liệu từ user_roles sang users.role_id
echo "BƯỚC 4: Migrate dữ liệu user_roles → users.role_id...\n";

$usersNeedMigration = User::whereNull('role_id')->count();
echo "- Users cần migrate: $usersNeedMigration\n";

if ($usersNeedMigration > 0) {
    DB::transaction(function () use ($usersNeedMigration) {
        DB::statement("
            UPDATE users u
            INNER JOIN user_roles ur ON u.id = ur.user_id
            SET u.role_id = ur.role_id
            WHERE u.role_id IS NULL
            AND ur.is_active = 1
        ");
    });

    echo "✅ Đã migrate $usersNeedMigration users\n";
} else {
    echo "✅ Không có users cần migrate\n";
}

echo "\n";

// BƯỚC 5: Xử lý users không có role
echo "BƯỚC 5: Xử lý users không có role...\n";

$usersWithoutRole = User::whereNull('role_id')->where('is_active', true)->count();
echo "- Users không có role: $usersWithoutRole\n";

if ($usersWithoutRole > 0) {
    $defaultRole = Role::where('name', 'employee')->first();

    if ($defaultRole) {
        User::whereNull('role_id')
            ->where('is_active', true)
            ->update(['role_id' => $defaultRole->id]);

        echo "✅ Đã gán role 'employee' mặc định cho $usersWithoutRole users\n";
    } else {
        echo "❌ Không tìm thấy role 'employee'! Cần chạy RoleSeeder.\n";
        exit(1);
    }
} else {
    echo "✅ Tất cả users đã có role\n";
}

echo "\n";

// BƯỚC 6: Sync user_roles.is_active
echo "BƯỚC 6: Sync user_roles.is_active...\n";

DB::transaction(function () {
    // Disable các role không còn active
    DB::statement("
        UPDATE user_roles ur
        INNER JOIN users u ON ur.user_id = u.id
        SET ur.is_active = 0
        WHERE ur.role_id != u.role_id
    ");

    // Enable role hiện tại
    DB::statement("
        UPDATE user_roles ur
        INNER JOIN users u ON ur.user_id = u.id
        SET ur.is_active = 1
        WHERE ur.role_id = u.role_id
    ");
});

echo "✅ Đã sync user_roles\n";

echo "\n";

// BƯỚC 7: Verify dữ liệu
echo "BƯỚC 7: Verify dữ liệu...\n";

$verification = [
    'total_users' => User::count(),
    'users_with_role' => User::whereNotNull('role_id')->count(),
    'users_without_role' => User::whereNull('role_id')->count(),
    'invalid_role_refs' => User::whereNotNull('role_id')
        ->whereNotIn('role_id', Role::pluck('id'))
        ->count(),
];

echo "- Tổng users: {$verification['total_users']}\n";
echo "- Users có role: {$verification['users_with_role']}\n";
echo "- Users không có role: {$verification['users_without_role']}\n";
echo "- References không hợp lệ: {$verification['invalid_role_refs']}\n";

if ($verification['invalid_role_refs'] > 0) {
    echo "\n❌ Có {$verification['invalid_role_refs']} users với role_id không hợp lệ!\n";
    echo "Cần kiểm tra và sửa thủ công.\n";
    exit(1);
}

echo "\n";

// BƯỚC 8: Hiển thị mẫu dữ liệu
echo "BƯỚC 8: Hiển thị mẫu dữ liệu...\n";

$sampleUsers = User::with('role')
    ->where('is_active', true)
    ->limit(5)
    ->get();

foreach ($sampleUsers as $user) {
    echo sprintf(
        "- #%d: %s (%s) - Role: %s\n",
        $user->id,
        $user->name,
        $user->email,
        $user->role ? $user->role->display_name : 'NO ROLE'
    );
}

echo "\n";
echo "=====================================================\n";
echo "✅ MIGRATION HOÀN TẤT!\n";
echo "=====================================================\n";
echo "\n";
echo "📊 Thống kê:\n";
echo "- Backup: $backupFile\n";
echo "- Tổng users: {$verification['total_users']}\n";
echo "- Users có role: {$verification['users_with_role']}\n";
echo "\n";
echo "🔄 Bước tiếp theo:\n";
echo "1. Test permission checking\n";
echo "2. Kiểm tra frontend/backend hoạt động đúng\n";
echo "3. Deploy lên production\n";
echo "\n";
-- =====================================================
-- MIGRATION SCRIPT: DATABASE RESTRUCTURE
-- Role-based + Permission-based System
-- =====================================================
-- Date: 2025-10-16
-- Purpose: Migrate từ cấu trúc cũ sang cấu trúc mới
-- =====================================================

-- BƯỚC 1: Backup trước khi chạy
-- mysqldump -u root -p gara > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

-- BƯỚC 2: Kiểm tra cấu trúc hiện tại
SELECT
    'users' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN role_id IS NOT NULL THEN 1 ELSE 0 END) as with_role_id,
    SUM(CASE WHEN custom_permissions IS NOT NULL THEN 1 ELSE 0 END) as with_custom_permissions
FROM users;

-- BƯỚC 3: Thêm columns mới nếu chưa có (ALTER TABLE)
-- Lưu ý: Chạy migration Laravel thì không cần bước này

ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id BIGINT UNSIGNED NULL AFTER salary;
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_permissions JSON NULL AFTER role_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- BƯỚC 4: Thêm foreign key constraint
-- Chỉ chạy nếu chưa có constraint
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'gara'
    AND TABLE_NAME = 'users'
    AND CONSTRAINT_NAME = 'users_role_id_foreign'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT users_role_id_foreign
     FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- BƯỚC 5: Migrate dữ liệu từ user_roles sang users.role_id
-- Chỉ migrate những user chưa có role_id
UPDATE users u
INNER JOIN user_roles ur ON u.id = ur.user_id
SET u.role_id = ur.role_id
WHERE u.role_id IS NULL
AND ur.is_active = 1;

-- BƯỚC 6: Kiểm tra kết quả migration
SELECT
    'After Migration' as status,
    COUNT(*) as total_users,
    SUM(CASE WHEN role_id IS NOT NULL THEN 1 ELSE 0 END) as users_with_role,
    SUM(CASE WHEN role_id IS NULL THEN 1 ELSE 0 END) as users_without_role
FROM users;

-- BƯỚC 7: Xử lý users không có role (nếu có)
-- Gán role mặc định 'employee' cho những user không có role
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'employee' LIMIT 1)
WHERE role_id IS NULL AND is_active = 1;

-- BƯỚC 8: Tạo role history từ user_roles (Optional - để audit trail)
-- Đảm bảo tất cả records trong user_roles đều có assigned_at
UPDATE user_roles
SET assigned_at = created_at
WHERE assigned_at IS NULL;

-- BƯỚC 9: Sync user_roles.is_active với users.role_id
-- Đánh dấu is_active = false cho các role không còn active
UPDATE user_roles ur
INNER JOIN users u ON ur.user_id = u.id
SET ur.is_active = 0
WHERE ur.role_id != u.role_id;

-- Đánh dấu is_active = true cho role hiện tại
UPDATE user_roles ur
INNER JOIN users u ON ur.user_id = u.id
SET ur.is_active = 1
WHERE ur.role_id = u.role_id;

-- BƯỚC 10: Verify dữ liệu
-- Kiểm tra users có role trong roles table
SELECT
    u.id,
    u.name,
    u.email,
    r.name as role_name,
    r.display_name,
    u.custom_permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.is_active = 1
ORDER BY u.id
LIMIT 20;

-- BƯỚC 11: Kiểm tra integrity
-- Users phải có role
SELECT COUNT(*) as users_without_role
FROM users
WHERE role_id IS NULL AND is_active = 1;

-- Role_id phải tồn tại trong roles
SELECT COUNT(*) as invalid_role_references
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.role_id IS NOT NULL AND r.id IS NULL;

-- BƯỚC 12: Create indexes nếu chưa có
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_is_active ON user_roles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_at ON user_roles(assigned_at);

-- =====================================================
-- ROLLBACK PLAN (Nếu cần)
-- =====================================================
/*
-- Xóa foreign key
ALTER TABLE users DROP FOREIGN KEY users_role_id_foreign;

-- Xóa columns mới
ALTER TABLE users DROP COLUMN role_id;
ALTER TABLE users DROP COLUMN custom_permissions;
ALTER TABLE users DROP COLUMN deleted_at;

-- Restore từ backup
-- mysql -u root -p gara < backup_before_migration_YYYYMMDD_HHMMSS.sql
*/

-- =====================================================
-- COMPLETED
-- =====================================================
SELECT 'Migration completed successfully!' as message;

