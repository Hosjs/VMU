<?php

namespace App\Services;

use App\Models\HocVien;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * D4 — Đồng bộ học viên từ API hệ thống ngoài.
 *
 * Endpoint cấu hình trong `config/services.php` ('external_student').
 * Mỗi lần sync trả về thống kê: created / updated / skipped / failed.
 *
 * Mapping field nguồn → bảng `students`:
 *   external id        → external_id (UNIQUE cùng external_source)
 *   mã HV (school)     → maHV (PK nội bộ)
 *   ho dem / ten       → hoDem / ten
 *   gioi tinh          → gioiTinh
 *   ngay sinh          → ngaySinh
 *   maNganh            → maNganh
 *   namVaoTruong       → namVaoTruong
 *
 * Nếu hệ thống nguồn dùng tên field khác, sửa map trong `mapPayload()`.
 */
class ExternalStudentSync
{
    public function sync(array $params = []): array
    {
        $cfg = config('services.external_student');
        if (empty($cfg['base_url'])) {
            return [
                'ok' => false,
                'message' => 'EXTERNAL_STUDENT_API_URL chưa được cấu hình',
            ];
        }

        $url = rtrim($cfg['base_url'], '/') . '/students';

        try {
            $request = Http::timeout($cfg['timeout'] ?? 30);
            if (!empty($cfg['token'])) {
                $request = $request->withToken($cfg['token']);
            }

            $response = $request->get($url, $params);

            if (!$response->successful()) {
                return [
                    'ok' => false,
                    'message' => "API trả về HTTP {$response->status()}",
                    'body'    => mb_substr($response->body(), 0, 500),
                ];
            }

            $payload = $response->json();
            $rows = $payload['data'] ?? (is_array($payload) ? $payload : []);

            $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'failed' => 0];
            $errors = [];

            foreach ($rows as $i => $row) {
                try {
                    $mapped = $this->mapPayload($row);
                    if (empty($mapped['external_id']) || empty($mapped['maHV'])) {
                        $stats['skipped']++;
                        continue;
                    }

                    $existing = HocVien::where('external_source', $cfg['source'])
                        ->where('external_id', $mapped['external_id'])
                        ->first();

                    if ($existing) {
                        $existing->fill($mapped);
                        $existing->synced_at = Carbon::now();
                        $existing->save();
                        $stats['updated']++;
                    } else {
                        $mapped['external_source'] = $cfg['source'];
                        $mapped['synced_at'] = Carbon::now();
                        HocVien::create($mapped);
                        $stats['created']++;
                    }
                } catch (\Throwable $e) {
                    $stats['failed']++;
                    $errors[] = ['index' => $i, 'message' => $e->getMessage()];
                    Log::warning('ExternalStudentSync row failed', [
                        'index' => $i,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return [
                'ok'       => true,
                'source'   => $cfg['source'],
                'count'    => count($rows),
                'stats'    => $stats,
                'errors'   => array_slice($errors, 0, 20),
            ];
        } catch (\Throwable $e) {
            Log::error('ExternalStudentSync HTTP failed', ['error' => $e->getMessage()]);
            return [
                'ok'      => false,
                'message' => 'Lỗi gọi API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Convert payload từ API ngoài → fillable của bảng `students`.
     * Tách riêng để dễ chỉnh khi cấu trúc API thay đổi.
     */
    protected function mapPayload(array $row): array
    {
        return array_filter([
            'external_id'      => $row['id']           ?? $row['ExternalId']  ?? null,
            'maHV'             => $row['code']         ?? $row['MaHV']        ?? null,
            'hoDem'            => $row['family_name']  ?? $row['HoDem']       ?? null,
            'ten'              => $row['first_name']   ?? $row['Ten']         ?? null,
            'gioiTinh'         => $row['gender']       ?? $row['GioiTinh']    ?? null,
            'ngaySinh'         => $row['dob']          ?? $row['NgaySinh']    ?? null,
            'email'            => $row['email']        ?? null,
            'dienThoai'        => $row['phone']        ?? $row['DienThoai']   ?? null,
            'maNganh'          => $row['major_code']   ?? $row['MaNganh']     ?? null,
            'maTrinhDoDaoTao'  => $row['level_code']   ?? $row['MaTrinhDoDaoTao'] ?? null,
            'namVaoTruong'     => $row['enroll_year']  ?? $row['NamVao']      ?? null,
            'trangThai'        => $row['status']       ?? 'DangHoc',
        ], static fn ($v) => $v !== null && $v !== '');
    }
}
