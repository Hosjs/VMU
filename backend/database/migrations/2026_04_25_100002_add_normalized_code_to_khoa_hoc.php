<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * D3 — Chuẩn hoá mã khoá học `YYYY.N.X` → `YYYY.N`.
 *
 * Cột `ma_khoa_hoc` hiện tại là UNIQUE và đang chứa dạng `2026.1.1`.
 * Đổi tại chỗ sang `2026.1` sẽ va UNIQUE nếu tồn tại nhiều dot khác nhau
 * (`2026.1.1` + `2026.1.2`).
 *
 * Cách tiếp cận an toàn:
 *   1. Thêm cột `ma_khoa_hoc_short` (nullable, KHÔNG unique).
 *   2. Backfill = `YYYY.N` từ dữ liệu hiện tại; nhiều bản ghi cùng `YYYY.N`
 *      được phép trùng (vẫn phân biệt nhau bằng `dot`).
 *   3. UI chuyển dần sang dùng `ma_khoa_hoc_short` cho hiển thị; backend
 *      tiếp tục lưu `ma_khoa_hoc` legacy cho join cũ.
 *   4. (tuỳ chọn) Khi UI hết dùng `ma_khoa_hoc`, drop nó trong migration sau.
 *
 * Xem `db_changes/D3_ma_khoa_hoc_short.md` để biết kế hoạch chuyển đổi.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('khoa_hoc', function (Blueprint $table) {
            if (!Schema::hasColumn('khoa_hoc', 'ma_khoa_hoc_short')) {
                $table->string('ma_khoa_hoc_short', 16)->nullable()->after('ma_khoa_hoc')->index();
            }
        });

        // Backfill: lấy YYYY.N từ ma_khoa_hoc hiện tại (cắt phần thứ 3 nếu có).
        $rows = DB::table('khoa_hoc')->select('id', 'ma_khoa_hoc', 'nam_hoc', 'hoc_ky')->get();
        foreach ($rows as $r) {
            $short = null;
            if (!empty($r->ma_khoa_hoc)) {
                $parts = explode('.', $r->ma_khoa_hoc);
                $short = isset($parts[0], $parts[1]) ? "{$parts[0]}.{$parts[1]}" : $r->ma_khoa_hoc;
            }
            // Fallback từ nam_hoc/hoc_ky nếu ma_khoa_hoc rỗng/lạ.
            if ($short === null && $r->nam_hoc && $r->hoc_ky) {
                $short = "{$r->nam_hoc}.{$r->hoc_ky}";
            }
            DB::table('khoa_hoc')->where('id', $r->id)->update(['ma_khoa_hoc_short' => $short]);
        }
    }

    public function down(): void
    {
        Schema::table('khoa_hoc', function (Blueprint $table) {
            $table->dropIndex(['ma_khoa_hoc_short']);
            $table->dropColumn('ma_khoa_hoc_short');
        });
    }
};
