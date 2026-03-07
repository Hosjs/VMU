import * as XLSX from 'xlsx-js-style';
import type { TeachingPaymentRow } from '~/types/teaching-payment';

/**
 * Teaching Payment Excel Export Utility - ALTERNATIVE APPROACH
 * Using row insertion instead of cell overwriting
 */

interface ExportTeachingPaymentOptions {
    data: TeachingPaymentRow[];
    templatePath: string;
}

/**
 * Format date from ISO string to DD/MM/YYYY
 */
const formatDateForExcel = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return '';
    }
};

/**
 * Convert value to number or 0
 */
const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

/**
 * Export teaching payment data to Excel using template - ALTERNATIVE METHOD
 * This approach uses XLSX utils to insert rows properly
 */
export const exportTeachingPaymentToExcelV2 = async (options: ExportTeachingPaymentOptions): Promise<void> => {
    const { data, templatePath } = options;

    try {
        // Load template file
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Failed to load template: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, {
            type: 'array',
            cellStyles: true,
            cellFormula: true,
            cellNF: true,
        });

        console.log('📋 Available sheets:', workbook.SheetNames);

        // Get first sheet (should be the teaching payment sheet)
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            throw new Error('No worksheet found in template');
        }

        console.log('📋 Using sheet:', sheetName);
        console.log('📋 Worksheet range:', worksheet['!ref']);

        // Constants
        const DATA_START_ROW = 14;
        const MAX_DATA_ROWS = 36;
        const limitedData = data.slice(0, MAX_DATA_ROWS);

        // Prepare data array to insert
        const dataToInsert: any[][] = [];

        limitedData.forEach((row, idx) => {
            const rowData = [
                idx + 1, // A - STT
                row.chuc_danh_giang_vien || '', // B - Chức danh
                row.ho_ten_giang_vien || row.can_bo_giang_day || '', // C - Họ tên
                row.don_vi || '', // D - Đơn vị
                row.ma_so_thue_tncn || '', // E - Mã số thuế
                row.so_tai_khoan || '', // F - Số TK
                row.tai_ngan_hang || '', // G - Ngân hàng
                row.lop || '', // H - Lớp
                row.chuyen_nganh || '', // I - Chuyên ngành
                row.ten_hoc_phan || '', // J - Học phần
                toNumber(row.so_tin_chi), // K - Số tín chỉ
                formatDateForExcel(row.tu_ngay), // L - Từ ngày
                formatDateForExcel(row.den_ngay), // M - Đến ngày
                formatDateForExcel(row.ngay_thi), // N - Ngày thi
                toNumber(row.don_gia_ly_thuyet), // O - Đơn giá LT
                toNumber(row.don_gia_thuc_hanh), // P - Đơn giá TH
                toNumber(row.so_tiet_ly_thuyet), // Q - Số tiết LT
                toNumber(row.so_tiet_thao_luan), // R - Số tiết TH
                toNumber(row.so_tiet_bai_tap_lon), // S - Số tiết BT
                toNumber(row.so_luong_bai_tap), // T - BT lớn
                toNumber(row.si_so), // U - Học viên
                toNumber(row.so_luong_bai_thi), // V - Bài thi
                toNumber(row.he_so_ra_de_cham_thi || row.he_so || 1), // W - Hệ số
                // X, Y, Z sẽ là formulas
                '', // AA - Ghi chú
            ];

            dataToInsert.push(rowData);
        });

        // Insert data starting from row 14 (0-indexed = 13)
        const startRow = DATA_START_ROW - 1; // 0-indexed

        // Write data
        dataToInsert.forEach((rowData, idx) => {
            const excelRow = startRow + idx;

            rowData.forEach((cellValue, colIdx) => {
                const col = XLSX.utils.encode_col(colIdx);
                const cellAddress = `${col}${excelRow + 1}`;

                // Create cell
                const cell: XLSX.CellObject = {
                    t: typeof cellValue === 'number' ? 'n' : 's',
                    v: cellValue,
                };

                worksheet[cellAddress] = cell;
            });

            // Add formulas for X, Y, Z
            const rowNum = excelRow + 1;

            // X - Thành tiền
            worksheet[`X${rowNum}`] = {
                t: 'n',
                f: `O${rowNum}*Q${rowNum}+P${rowNum}*R${rowNum}+P${rowNum}*S${rowNum}+P${rowNum}*T${rowNum}+P${rowNum}*V${rowNum}*W${rowNum}`,
            };

            // Y - Thuế
            worksheet[`Y${rowNum}`] = {
                t: 'n',
                f: `X${rowNum}*0.1`,
            };

            // Z - Thực nhận
            worksheet[`Z${rowNum}`] = {
                t: 'n',
                f: `X${rowNum}-Y${rowNum}`,
            };
        });

        // Update range
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        range.e.r = Math.max(range.e.r, DATA_START_ROW + limitedData.length - 1);
        range.e.c = Math.max(range.e.c, 26); // AA column
        worksheet['!ref'] = XLSX.utils.encode_range(range);

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `BangKe_GiangDay_${timestamp}.xlsx`;

        // Write workbook
        const wbout = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true,
        });

        // Download file
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('✅ Excel exported successfully');

    } catch (error) {
        console.error('❌ Error exporting Excel:', error);
        throw error;
    }
};

// Keep original export for backward compatibility
export { exportTeachingPaymentToExcelV2 as exportTeachingPaymentToExcel };

