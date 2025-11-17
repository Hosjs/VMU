<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ImportAllSubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Import tất cả môn học từ API KeHoachDaoTao
     *
     * Cách chạy:
     * php artisan db:seed --class=ImportAllSubjectsSeeder
     */
    public function run(): void
    {
        $this->command->info('🚀 Bắt đầu import môn học từ API...');

        $apiUrl = 'http://203.162.246.113:8088';
        $majors = DB::table('majors')->get();

        $this->command->info("📊 Tìm thấy " . count($majors) . " ngành");
        $this->command->newLine();

        $totalSubjects = 0;
        $totalRelations = 0;
        $totalMajorsWithSubjects = 0;
        $subjectsCache = [];

        DB::beginTransaction();

        try {
            $progressBar = $this->command->getOutput()->createProgressBar(count($majors));
            $progressBar->start();

            foreach ($majors as $major) {
                $maNganh = $major->maNganh;

                // Xác định loại đào tạo
                $loaiDaoTao = 'ThacSy';
                if (str_starts_with($maNganh, '9') || str_starts_with($maNganh, '62')) {
                    $loaiDaoTao = 'TienSy';
                }

                // Thử các năm khác nhau
                $years = [2024, 2023, 2022, 2021, 2020];
                $subjectsFound = false;

                foreach ($years as $year) {
                    try {
                        $response = Http::timeout(30)->get("{$apiUrl}/KeHoachDaoTao/{$loaiDaoTao}", [
                            'NamVao' => $year,
                            'MaNganh' => $maNganh
                        ]);

                        if (!$response->successful() || empty($response->json())) {
                            continue;
                        }

                        $data = $response->json();

                        if (empty($data) || !isset($data[0]['tenMon'])) {
                            continue;
                        }

                        $subjectsFound = true;
                        $subjectCount = 0;

                        foreach ($data as $item) {
                            if (!isset($item['tenMon']) || empty($item['tenMon'])) {
                                continue;
                            }

                            $maMon = trim($item['hocPhanChu'] ?? '');
                            if (empty($maMon)) {
                                $maMon = 'HP' . $item['hocPhanSo'];
                            }

                            $tenMon = trim($item['tenMon']);
                            $soTinChi = $item['soTinChi'] ?? 2;

                            // Tạo mô tả
                            $moTaParts = [];
                            if (isset($item['loaiHocPhan'])) {
                                $loaiMap = [
                                    'CH' => 'Chính trị',
                                    'CN' => 'Chuyên ngành',
                                    'TC' => 'Tự chọn',
                                    'CS' => 'Cơ sở',
                                ];
                                $moTaParts[] = "Loại: " . ($loaiMap[$item['loaiHocPhan']] ?? $item['loaiHocPhan']);
                            }
                            if (isset($item['baiTapLon']) && $item['baiTapLon']) {
                                $moTaParts[] = 'Có bài tập lớn';
                            }
                            if (isset($item['hocPhanSo'])) {
                                $moTaParts[] = "HP số: " . $item['hocPhanSo'];
                            }
                            $moTa = !empty($moTaParts) ? implode(', ', $moTaParts) : null;

                            // Insert môn học
                            if (!isset($subjectsCache[$maMon])) {
                                try {
                                    DB::statement(
                                        "INSERT INTO subjects (maMon, tenMon, soTinChi, moTa, created_at, updated_at)
                                         VALUES (?, ?, ?, ?, NOW(), NOW())
                                         ON DUPLICATE KEY UPDATE
                                         tenMon = VALUES(tenMon),
                                         soTinChi = VALUES(soTinChi),
                                         moTa = VALUES(moTa),
                                         updated_at = NOW()",
                                        [$maMon, $tenMon, $soTinChi, $moTa]
                                    );

                                    $subjectsCache[$maMon] = true;
                                    $totalSubjects++;
                                } catch (\Exception $e) {
                                    // Môn đã tồn tại
                                }
                            }

                            // Link major-subject
                            $subject = DB::table('subjects')->where('maMon', $maMon)->first();
                            if ($subject) {
                                try {
                                    DB::statement(
                                        "INSERT IGNORE INTO major_subjects (major_id, subject_id) VALUES (?, ?)",
                                        [$major->id, $subject->id]
                                    );
                                    $subjectCount++;
                                    $totalRelations++;
                                } catch (\Exception $e) {
                                    // Bỏ qua duplicate
                                }
                            }
                        }

                        if ($subjectCount > 0) {
                            $totalMajorsWithSubjects++;
                        }

                        break;

                    } catch (\Exception $e) {
                        continue;
                    }
                }

                $progressBar->advance();
                usleep(200000); // 0.2s delay
            }

            $progressBar->finish();
            $this->command->newLine(2);

            DB::commit();

            $this->command->info('🎉 HOÀN THÀNH!');
            $this->command->info("📊 Tổng kết:");
            $this->command->line("   - Số ngành có môn học: $totalMajorsWithSubjects");
            $this->command->line("   - Số môn học mới tạo: $totalSubjects");
            $this->command->line("   - Tổng số liên kết: $totalRelations");

            // Top 10 ngành có nhiều môn nhất
            $this->command->newLine();
            $this->command->info('🔝 Top 10 ngành có nhiều môn học nhất:');

            $stats = DB::select("
                SELECT
                    m.maNganh,
                    m.tenNganh,
                    COUNT(ms.id) as so_mon_hoc
                FROM majors m
                LEFT JOIN major_subjects ms ON m.id = ms.major_id
                GROUP BY m.id, m.maNganh, m.tenNganh
                HAVING so_mon_hoc > 0
                ORDER BY so_mon_hoc DESC
                LIMIT 10
            ");

            foreach ($stats as $stat) {
                $this->command->line("   - {$stat->tenNganh} ({$stat->maNganh}): {$stat->so_mon_hoc} môn");
            }

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Lỗi: ' . $e->getMessage());
            throw $e;
        }
    }
}

