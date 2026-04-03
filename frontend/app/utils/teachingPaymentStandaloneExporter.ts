import * as XLSX from 'xlsx-js-style';
import type { TeachingPaymentRow } from '~/types/teaching-payment';

const formatDate = (v: string | null | undefined): string => {
    if (!v) return '';
    try {
        const d = new Date(v);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return ''; }
};

const n = (v: any): number => {
    const x = Number(v);
    return isNaN(x) ? 0 : x;
};

// Shared cell styles
const headerStyle = {
    font: { bold: true, sz: 10, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
    },
    fill: { fgColor: { rgb: 'D9E1F2' }, patternType: 'solid' },
};

const cellStyle = (bold = false, align: string = 'center') => ({
    font: { sz: 9, name: 'Times New Roman', bold },
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border: {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
    },
});

const titleStyle = {
    font: { bold: true, sz: 13, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'center' },
};

const subTitleStyle = {
    font: { bold: true, sz: 10, name: 'Times New Roman' },
    alignment: { horizontal: 'center', vertical: 'center' },
};

export const exportTeachingPaymentStandalone = (data: TeachingPaymentRow[]): void => {
    const wb = XLSX.utils.book_new();
    const ws: any = {};

    const cols = [
        { header: 'TT', key: 'stt', w: 5 },
        { header: 'Chức danh', key: 'chuc_danh', w: 10 },
        { header: 'Họ và tên GV', key: 'ho_ten', w: 22 },
        { header: 'Đơn vị', key: 'don_vi', w: 18 },
        { header: 'MST TNCN', key: 'mst', w: 12 },
        { header: 'Số TK', key: 'so_tk', w: 14 },
        { header: 'Ngân hàng', key: 'ngan_hang', w: 16 },
        { header: 'Lớp', key: 'lop', w: 18 },
        { header: 'Chuyên ngành', key: 'chuyen_nganh', w: 20 },
        { header: 'Học phần', key: 'hoc_phan', w: 22 },
        { header: 'Số TC', key: 'so_tc', w: 6 },
        { header: 'Từ ngày', key: 'tu_ngay', w: 11 },
        { header: 'Đến ngày', key: 'den_ngay', w: 11 },
        { header: 'Ngày thi', key: 'ngay_thi', w: 11 },
        { header: 'ĐG LT', key: 'dg_lt', w: 9 },
        { header: 'ĐG TH', key: 'dg_th', w: 9 },
        { header: 'Tiết LT', key: 'tiet_lt', w: 7 },
        { header: 'Tiết TH', key: 'tiet_th', w: 7 },
        { header: 'Tiết BT', key: 'tiet_bt', w: 7 },
        { header: 'SL BT', key: 'sl_bt', w: 7 },
        { header: 'Sĩ số', key: 'si_so', w: 7 },
        { header: 'Bài thi', key: 'bai_thi', w: 7 },
        { header: 'Hệ số', key: 'he_so', w: 7 },
        { header: 'Thành tiền\n(chưa thuế)', key: 'thanh_tien', w: 14 },
        { header: 'Thuế TNCN', key: 'thue', w: 11 },
        { header: 'Thực nhận', key: 'thuc_nhan', w: 12 },
        { header: 'Ghi chú', key: 'ghi_chu', w: 16 },
    ];

    const numCols = cols.length;
    const TITLE_ROW = 0;
    const SUBTITLE_ROW = 1;
    const HEADER_ROW = 2;
    const DATA_START = 3;

    // --- TITLE ---
    ws[XLSX.utils.encode_cell({ r: TITLE_ROW, c: 0 })] = {
        v: 'BẢNG THANH TOÁN THÙ LAO GIẢNG DẠY',
        t: 's', s: titleStyle,
    };
    ws[XLSX.utils.encode_cell({ r: SUBTITLE_ROW, c: 0 })] = {
        v: `Tổng số: ${data.length} giảng viên | Ngày xuất: ${formatDate(new Date().toISOString())}`,
        t: 's', s: subTitleStyle,
    };

    // --- HEADERS ---
    cols.forEach((col, ci) => {
        ws[XLSX.utils.encode_cell({ r: HEADER_ROW, c: ci })] = {
            v: col.header, t: 's', s: headerStyle,
        };
    });

    // --- DATA ---
    data.forEach((row, ri) => {
        const r = DATA_START + ri;
        const vals = [
            ri + 1,
            row.chuc_danh_giang_vien || '',
            row.ho_ten_giang_vien || row.can_bo_giang_day || '',
            row.don_vi || '',
            row.ma_so_thue_tncn || '',
            row.so_tai_khoan || '',
            row.tai_ngan_hang || '',
            (row.lop || '').replace(/<br\s*\/?>/gi, '\n'),
            row.chuyen_nganh || '',
            row.ten_hoc_phan || row.hoc_phan || '',
            n(row.so_tin_chi),
            formatDate(row.tu_ngay),
            formatDate(row.den_ngay),
            formatDate(row.ngay_thi),
            n(row.don_gia_ly_thuyet),
            n(row.don_gia_thuc_hanh),
            n(row.so_tiet_ly_thuyet),
            n(row.so_tiet_thao_luan),
            n(row.so_tiet_bai_tap_lon),
            n(row.so_luong_bai_tap),
            n(row.si_so),
            n(row.so_luong_bai_thi),
            n(row.he_so_ra_de_cham_thi ?? row.he_so),
            n(row.thanh_tien_chua_thue),
            n(row.thue_thu_nhap),
            n(row.thuc_nhan),
            row.ghi_chu || '',
        ];

        vals.forEach((val, ci) => {
            const isNum = typeof val === 'number';
            const isName = ci === 2;
            const isText = ci >= 3 && !isNum;
            ws[XLSX.utils.encode_cell({ r, c: ci })] = {
                v: val,
                t: isNum ? 'n' : 's',
                s: cellStyle(isName, isNum ? 'right' : (ci <= 1 ? 'center' : 'left')),
            };
        });
    });

    // --- SUMMARY ROW ---
    const summaryRow = DATA_START + data.length;
    ws[XLSX.utils.encode_cell({ r: summaryRow, c: 0 })] = {
        v: 'TỔNG CỘNG', t: 's',
        s: { ...cellStyle(true, 'center'), fill: { fgColor: { rgb: 'FFF2CC' }, patternType: 'solid' } },
    };
    // Merge first few cols for "TỔNG CỘNG" label
    const totalThanhtien = data.reduce((s, r) => s + n(r.thanh_tien_chua_thue), 0);
    const totalThue = data.reduce((s, r) => s + n(r.thue_thu_nhap), 0);
    const totalThucNhan = data.reduce((s, r) => s + n(r.thuc_nhan), 0);

    [[23, totalThanhtien], [24, totalThue], [25, totalThucNhan]].forEach(([ci, val]) => {
        ws[XLSX.utils.encode_cell({ r: summaryRow, c: ci as number })] = {
            v: val, t: 'n',
            s: { ...cellStyle(true, 'right'), fill: { fgColor: { rgb: 'FFF2CC' }, patternType: 'solid' } },
        };
    });

    // --- SHEET REF ---
    const lastRow = summaryRow;
    ws['!ref'] = XLSX.utils.encode_range({ r: TITLE_ROW, c: 0 }, { r: lastRow, c: numCols - 1 });

    // --- MERGES (title rows) ---
    ws['!merges'] = [
        { s: { r: TITLE_ROW, c: 0 }, e: { r: TITLE_ROW, c: numCols - 1 } },
        { s: { r: SUBTITLE_ROW, c: 0 }, e: { r: SUBTITLE_ROW, c: numCols - 1 } },
        { s: { r: summaryRow, c: 0 }, e: { r: summaryRow, c: 22 } },
    ];

    // --- COL WIDTHS ---
    ws['!cols'] = cols.map(c => ({ wch: c.w }));

    // --- ROW HEIGHTS ---
    const rows: any[] = [{ hpt: 28 }, { hpt: 18 }, { hpt: 40 }];
    data.forEach(() => rows.push({ hpt: 30 }));
    rows.push({ hpt: 22 });
    ws['!rows'] = rows;

    XLSX.utils.book_append_sheet(wb, ws, 'Thanh toán giảng dạy');

    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Bang_thanh_toan_giang_day_${ts}.xlsx`);
};

