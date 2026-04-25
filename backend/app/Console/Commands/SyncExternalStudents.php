<?php

namespace App\Console\Commands;

use App\Services\ExternalStudentSync;
use Illuminate\Console\Command;

class SyncExternalStudents extends Command
{
    protected $signature = 'students:sync-external
                            {--major= : Mã ngành cần đồng bộ}
                            {--year=  : Năm vào trường}';

    protected $description = 'Đồng bộ học viên từ API hệ thống ngoài (D4)';

    public function handle(ExternalStudentSync $sync): int
    {
        $params = array_filter([
            'major' => $this->option('major'),
            'year'  => $this->option('year'),
        ]);

        $this->info('→ Bắt đầu đồng bộ học viên...');
        $result = $sync->sync($params);

        if (!($result['ok'] ?? false)) {
            $this->error('✗ ' . ($result['message'] ?? 'Sync thất bại'));
            return self::FAILURE;
        }

        $stats = $result['stats'] ?? [];
        $this->info("✓ Source: {$result['source']} · Tổng nhận: {$result['count']}");
        $this->table(
            ['Created', 'Updated', 'Skipped', 'Failed'],
            [[$stats['created'] ?? 0, $stats['updated'] ?? 0, $stats['skipped'] ?? 0, $stats['failed'] ?? 0]],
        );

        if (!empty($result['errors'])) {
            $this->warn('Một số lỗi đầu tiên:');
            foreach ($result['errors'] as $e) {
                $this->line("  · row #{$e['index']}: {$e['message']}");
            }
        }

        return self::SUCCESS;
    }
}
