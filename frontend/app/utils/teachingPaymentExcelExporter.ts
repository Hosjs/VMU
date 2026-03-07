import * as XLSX from 'xlsx-js-style';
import type { TeachingPaymentRow } from '~/types/teaching-payment';


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
 * Convert value to number or empty string
 */
const toNumber = (value: any): number | '' => {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    return isNaN(num) ? '' : num;
};

/**
 * Map TeachingPaymentRow to Excel column structure
 */
const mapRowToExcelData = (row: TeachingPaymentRow, index: number) => {
    // Format the Lớp field - replace <br> with line breaks for proper display
    const lopValue = row.lop || '';
    // First replace <br> tags with newlines, then trim extra spaces on each line
    const lopFormatted = lopValue
        .replace(/<br\s*\/?>/gi, '\n')  // Replace <br> with newlines
        .split('\n')                     // Split by newlines
        .map(line => line.trim())        // Trim each line
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n');                     // Join back with newlines

    return {
        stt: index + 1,
        chuc_danh: row.chuc_danh_giang_vien || '',
        ho_ten: row.ho_ten_giang_vien || row.can_bo_giang_day || '',
        don_vi: row.don_vi || '',
        ma_so_thue: row.ma_so_thue_tncn || '',
        so_tai_khoan: row.so_tai_khoan || '',
        ngan_hang: row.tai_ngan_hang || '',
        lop: lopFormatted, // Use formatted version with line breaks
        chuyen_nganh: row.chuyen_nganh || '',
        hoc_phan: row.ten_hoc_phan || '',
        so_tin_chi: toNumber(row.so_tin_chi),
        tu_ngay: formatDateForExcel(row.tu_ngay),
        den_ngay: formatDateForExcel(row.den_ngay),
        ngay_thi: formatDateForExcel(row.ngay_thi),
        don_gia_lt: toNumber(row.don_gia_ly_thuyet),
        don_gia_th: toNumber(row.don_gia_thuc_hanh),
        so_tiet_lt: toNumber(row.so_tiet_ly_thuyet),
        so_tiet_th: toNumber(row.so_tiet_thao_luan),
        so_tiet_bt: toNumber(row.so_tiet_bai_tap_lon),
        bt_lon: toNumber(row.so_luong_bai_tap),
        hoc_vien: toNumber(row.si_so),
        bai_thi: toNumber(row.so_luong_bai_thi),
        he_so: toNumber(row.he_so_ra_de_cham_thi || row.he_so || 1),
        thanh_tien: toNumber(row.thanh_tien_chua_thue),
        thue: toNumber(row.thue_thu_nhap),
        thuc_nhan: toNumber(row.thuc_nhan),
        ghi_chu: '',
    };
};

/**
 * Export teaching payment data to Excel using template
 *
 * SPECIFICATIONS:
 * - Template: template_ai.xlsx
 * - Sheet: "Bảng kê  (SĐH)-đủ"
 * - Header rows (1-13): NEVER MODIFY
 * - Template row (14): Duplicate for each data entry
 * - Data region (14-49): Insert data rows (max 36 rows)
 * - Protected region (50+): NEVER MODIFY
 */
export const exportTeachingPaymentToExcel = async (options: ExportTeachingPaymentOptions): Promise<void> => {
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
            cellHTML: false,
            cellNF: true,
            sheetStubs: false,
            bookVBA: false,
        });

        // Debug: List all sheets
        console.log('📋 Available sheets:', workbook.SheetNames);

        // Get the sheet "Bảng kê  (SĐH)-đủ"
        const sheetName = 'Bảng kê  (SĐH)-đủ';
        let worksheet = workbook.Sheets[sheetName];

        // Try alternative sheet names if not found
        if (!worksheet) {
            console.warn(`⚠️ Sheet "${sheetName}" not found, trying alternatives...`);
            // Try first sheet
            if (workbook.SheetNames.length > 0) {
                const firstSheet = workbook.SheetNames[0];
                console.log(`📋 Using first sheet: "${firstSheet}"`);
                worksheet = workbook.Sheets[firstSheet];
            }
        }

        if (!worksheet) {
            throw new Error(`No worksheet found in template. Available sheets: ${workbook.SheetNames.join(', ')}`);
        }

        // Debug: Check worksheet range
        console.log('📋 Worksheet range:', worksheet['!ref']);

        // ========================================
        // FORMAT HEADER ROWS (1-13)
        // ========================================

        // Get all columns
        const allColumns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const extendedCols = [...allColumns, ...allColumns.map(l => 'A' + l)];

        // Rows 1-10: Remove all formatting (white background, no bold, no underline)
        for (let row = 1; row <= 10; row++) {
            extendedCols.forEach(col => {
                const cellAddr = `${col}${row}`;
                if (worksheet[cellAddr]) {
                    if (!worksheet[cellAddr].s) worksheet[cellAddr].s = {};

                    // Remove all styling - keep only font
                    worksheet[cellAddr].s = {
                        font: {
                            name: 'Times New Roman',
                            sz: 11,
                            bold: false,
                            underline: false,
                        },
                        fill: {
                            fgColor: { rgb: 'FFFFFF' }, // White background
                            patternType: 'solid',
                        },
                        border: undefined, // No borders
                    };

                    // Rows 1-5: Center alignment
                    if (row >= 1 && row <= 5) {
                        worksheet[cellAddr].s.alignment = {
                            horizontal: 'center',
                            vertical: 'center',
                        };
                    }
                    // Rows 6-10: Left alignment (no center)
                    else if (row >= 6 && row <= 10) {
                        worksheet[cellAddr].s.alignment = {
                            horizontal: 'left',
                            vertical: 'center',
                        };
                    }
                }
            });
        }

        // Row 2: UPPERCASE, BOLD, UNDERLINE (override the above)
        extendedCols.forEach(col => {
            const cellAddr = `${col}2`;
            if (worksheet[cellAddr]) {
                if (!worksheet[cellAddr].s) worksheet[cellAddr].s = {};
                worksheet[cellAddr].s = {
                    font: {
                        name: 'Times New Roman',
                        sz: 11,
                        bold: true, // ✅ BOLD
                        underline: true, // ✅ UNDERLINE
                    },
                    fill: {
                        fgColor: { rgb: 'FFFFFF' },
                        patternType: 'solid',
                    },
                    alignment: {
                        horizontal: 'center',
                        vertical: 'center',
                    },
                    border: undefined,
                };
                // Convert value to uppercase
                if (worksheet[cellAddr].v && typeof worksheet[cellAddr].v === 'string') {
                    worksheet[cellAddr].v = worksheet[cellAddr].v.toUpperCase();
                }
            }
        });

        // Safely add merge cells for rows 3 and 4 if needed
        // Only add if template doesn't already have conflicting merges
        const addSafeMerge = (startRow: number, endRow: number, startCol: number, endCol: number) => {
            if (!worksheet['!merges']) {
                worksheet['!merges'] = [];
            }

            // Check for conflicts with existing merges
            const hasConflict = worksheet['!merges'].some(merge => {
                return !(
                    endRow < merge.s.r ||
                    startRow > merge.e.r ||
                    endCol < merge.s.c ||
                    startCol > merge.e.c
                );
            });

            if (!hasConflict) {
                worksheet['!merges'].push({
                    s: { r: startRow, c: startCol },
                    e: { r: endRow, c: endCol }
                });
                return true;
            }
            return false;
        };

        // Try to merge row 3 (A3:X3) - avoid going too far to prevent conflicts
        const merged3 = addSafeMerge(2, 2, 0, 23); // A3 to X3 (column 23, safer range)
        if (!merged3) {
            console.warn('⚠️ Could not merge row 3 - conflict detected');
        }

        // Try to merge row 4 (A4:X4)
        const merged4 = addSafeMerge(3, 3, 0, 23); // A4 to X4 (column 23, safer range)
        if (!merged4) {
            console.warn('⚠️ Could not merge row 4 - conflict detected');
        }

        // Try to merge row 5 (A5:X5)
        const merged5 = addSafeMerge(4, 4, 0, 23); // A5 to X5 (column 23, safer range)
        if (!merged5) {
            console.warn('⚠️ Could not merge row 5 - conflict detected');
        }

        // Row 10: Add white background with borders
        extendedCols.forEach(col => {
            const cellAddr = `${col}10`;
            if (worksheet[cellAddr]) {
                if (!worksheet[cellAddr].s) worksheet[cellAddr].s = {};
                worksheet[cellAddr].s = {
                    font: {
                        name: 'Times New Roman',
                        sz: 11,
                        bold: false,
                    },
                    fill: {
                        fgColor: { rgb: 'FFFFFF' },
                        patternType: 'solid',
                    },
                    alignment: {
                        horizontal: 'left',
                        vertical: 'center',
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: '000000' } },
                        bottom: { style: 'thin', color: { rgb: '000000' } },
                        left: { style: 'thin', color: { rgb: '000000' } },
                        right: { style: 'thin', color: { rgb: '000000' } },
                    },
                };
            }
        });

        // Rows 11-13: Add borders AND backgrounds
        for (let row = 11; row <= 13; row++) {
            extendedCols.forEach(col => {
                const cellAddr = `${col}${row}`;
                if (worksheet[cellAddr]) {
                    if (!worksheet[cellAddr].s) worksheet[cellAddr].s = {};

                    // Set background color based on row
                    let bgColor = 'FFFFFF'; // White default
                    if (row === 11 || row === 12) {
                        bgColor = 'D3D3D3'; // Light gray for rows 11-12
                    } else if (row === 13) {
                        bgColor = 'FFFF00'; // Yellow for row 13
                    }

                    worksheet[cellAddr].s = {
                        font: {
                            name: 'Times New Roman',
                            sz: 11,
                            bold: false,
                        },
                        fill: {
                            fgColor: { rgb: bgColor },
                            patternType: 'solid',
                        },
                        alignment: {
                            horizontal: 'center',
                            vertical: 'center',
                            wrapText: true,
                        },
                        border: {
                            top: { style: 'thin', color: { rgb: '000000' } },
                            bottom: { style: 'thin', color: { rgb: '000000' } },
                            left: { style: 'thin', color: { rgb: '000000' } },
                            right: { style: 'thin', color: { rgb: '000000' } },
                        },
                    };
                }
            });
        }

        // Constants from specification
        const DATA_START_ROW = 14;
        const DATA_MAX_ROW = 49;
        const MAX_DATA_ROWS = DATA_MAX_ROW - DATA_START_ROW + 1; // 36 rows

        // Limit data to max rows
        const limitedData = data.slice(0, MAX_DATA_ROWS);

        // Store template row 14 style and formulas
        const templateRow: { [key: string]: XLSX.CellObject } = {};
        const columnLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const extendedColumns = [...columnLetters, ...columnLetters.map(l => 'A' + l)];

        const TEMPLATE_ROW = 14;

        // Read template row (row 14) - store original cells
        for (let colIdx = 0; colIdx < extendedColumns.length; colIdx++) {
            const col = extendedColumns[colIdx];
            const cellAddress = `${col}${TEMPLATE_ROW}`;
            const cell = worksheet[cellAddress];
            if (cell) {
                // Store reference to template cell (will copy later)
                templateRow[col] = cell;
            }
        }

        // Debug: Log first template cell to check if it has borders
        if (templateRow['A']) {
            console.log('📋 Template cell A14 keys:', Object.keys(templateRow['A']));
            console.log('📋 Template cell A14 style:', templateRow['A'].s);
        }

        // Column mapping based on excel_layout.json
        const columnMapping: { [key: string]: string } = {
            A: 'stt',
            B: 'chuc_danh',
            C: 'ho_ten',
            D: 'don_vi',
            E: 'ma_so_thue',
            F: 'so_tai_khoan',
            G: 'ngan_hang',
            H: 'lop',
            I: 'chuyen_nganh',
            J: 'hoc_phan',
            K: 'so_tin_chi',
            L: 'tu_ngay',
            M: 'den_ngay',
            N: 'ngay_thi',
            O: 'don_gia_lt',
            P: 'don_gia_th',
            Q: 'so_tiet_lt',
            R: 'so_tiet_th',
            S: 'so_tiet_bt',
            T: 'bt_lon',
            U: 'hoc_vien',
            V: 'bai_thi',
            W: 'he_so',
            X: 'thanh_tien', // Formula
            Y: 'thue',       // Formula
            Z: 'thuc_nhan',  // Formula
            AA: 'ghi_chu',
        };

        // Formula patterns from excel_layout.json
        const formulaPatterns = {
            thanh_tien: (row: number) => `O${row}*Q${row}+P${row}*R${row}+P${row}*S${row}+P${row}*T${row}+P${row}*V${row}*W${row}`,
            thue: (row: number) => `X${row}*0.1`,
            thuc_nhan: (row: number) => `X${row}-Y${row}`,
        };

        // Insert data rows
        limitedData.forEach((row, idx) => {
            const excelRow = mapRowToExcelData(row, idx);
            const rowNumber = DATA_START_ROW + idx;

            // Write data to each column
            Object.entries(columnMapping).forEach(([col, key]) => {
                const cellAddress = `${col}${rowNumber}`;

                // Determine if this column should wrap text
                const wrapTextColumns = ['lop', 'chuyen_nganh', 'hoc_phan']; // Lớp, Chuyên ngành, Học phần
                const shouldWrapText = wrapTextColumns.includes(key);

                // Create new cell with explicit border style
                const newCell: XLSX.CellObject = {
                    t: 's',
                    v: '',
                    s: {
                        border: {
                            top: { style: 'thin', color: { rgb: '000000' } },
                            bottom: { style: 'thin', color: { rgb: '000000' } },
                            left: { style: 'thin', color: { rgb: '000000' } },
                            right: { style: 'thin', color: { rgb: '000000' } },
                        },
                        font: {
                            name: 'Times New Roman',
                            sz: 11,
                            bold: false, // ✅ NO BOLD in data rows
                            underline: false, // ✅ NO UNDERLINE in data rows
                        },
                        alignment: {
                            vertical: 'center',
                            horizontal: 'center', // ✅ ALL TEXT CENTER
                            wrapText: shouldWrapText, // ✅ Wrap text for Lớp, Chuyên ngành
                        },
                    },
                };

                // Copy additional styles from template if exists
                const templateCell = templateRow[col];
                if (templateCell && templateCell.s) {
                    // Merge template styles but keep our alignment and wrapText
                    const templateStyle = { ...templateCell.s };
                    newCell.s = {
                        ...newCell.s,
                        ...templateStyle,
                        // Override alignment to always center
                        alignment: {
                            ...templateStyle.alignment,
                            vertical: 'center',
                            horizontal: 'center',
                            wrapText: shouldWrapText,
                        },
                    };
                }

                // Set value based on column type
                if (key === 'thanh_tien' || key === 'thue' || key === 'thuc_nhan') {
                    // These are formula cells
                    if (key === 'thanh_tien') {
                        newCell.f = formulaPatterns.thanh_tien(rowNumber);
                    } else if (key === 'thue') {
                        newCell.f = formulaPatterns.thue(rowNumber);
                    } else if (key === 'thuc_nhan') {
                        newCell.f = formulaPatterns.thuc_nhan(rowNumber);
                    }
                    newCell.t = 'n';
                    delete newCell.v;
                    delete newCell.w;
                } else {
                    const value = excelRow[key as keyof typeof excelRow];

                    if (typeof value === 'number') {
                        newCell.t = 'n';
                        newCell.v = value;
                        delete newCell.f;
                        delete newCell.w;
                    } else if (value === '') {
                        const numericColumns = ['so_tin_chi', 'don_gia_lt', 'don_gia_th',
                                               'so_tiet_lt', 'so_tiet_th', 'so_tiet_bt',
                                               'bt_lon', 'hoc_vien', 'bai_thi', 'he_so'];
                        if (numericColumns.includes(key)) {
                            newCell.t = 'n';
                            newCell.v = 0;
                        } else {
                            newCell.t = 's';
                            newCell.v = '';
                        }
                        delete newCell.f;
                        delete newCell.w;
                    } else {
                        newCell.t = 's';
                        newCell.v = String(value);
                        delete newCell.f;
                        delete newCell.w;
                    }
                }

                worksheet[cellAddress] = newCell;
            });
        });

        // Update worksheet range if needed
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        // Ensure range covers at least to row 14 + data length
        range.e.r = Math.max(range.e.r, DATA_START_ROW + limitedData.length - 1);
        worksheet['!ref'] = XLSX.utils.encode_range(range);

        // Set row heights for data rows (to accommodate wrapped text)
        if (!worksheet['!rows']) {
            worksheet['!rows'] = [];
        }

        // Set row height for data rows (rows 14+)
        for (let i = 0; i < limitedData.length; i++) {
            const rowIdx = DATA_START_ROW + i - 1; // 0-indexed
            if (!worksheet['!rows'][rowIdx]) {
                worksheet['!rows'][rowIdx] = {};
            }
            worksheet['!rows'][rowIdx].hpt = 30; // Height in points (taller for wrapped text)
            worksheet['!rows'][rowIdx].hpx = 40; // Height in pixels
        }

        // Preserve column widths from template (if exists)
        if (!worksheet['!cols']) {
            worksheet['!cols'] = [];
        }

        // Set specific column widths for better readability
        const columnWidths = [
            { wch: 5 },   // A - STT
            { wch: 10 },  // B - Chức danh
            { wch: 20 },  // C - Họ tên
            { wch: 15 },  // D - Đơn vị
            { wch: 12 },  // E - MST
            { wch: 15 },  // F - Số TK
            { wch: 15 },  // G - Ngân hàng
            { wch: 15 },  // H - Lớp (wider for wrapped text)
            { wch: 20 },  // I - Chuyên ngành (wider for wrapped text)
            { wch: 25 },  // J - Học phần (wider for wrapped text)
            { wch: 8 },   // K - Số TC
            { wch: 10 },  // L - Từ ngày
            { wch: 10 },  // M - Đến ngày
            { wch: 10 },  // N - Ngày thi
            { wch: 12 },  // O - Đơn giá LT
            { wch: 12 },  // P - Đơn giá TH
            { wch: 8 },   // Q - Số tiết LT
            { wch: 8 },   // R - Số tiết TH
            { wch: 8 },   // S - Số tiết BT
            { wch: 8 },   // T - BT lớn
            { wch: 8 },   // U - HV
            { wch: 8 },   // V - Bài thi
            { wch: 8 },   // W - Hệ số
            { wch: 15 },  // X - Thành tiền
            { wch: 12 },  // Y - Thuế
            { wch: 15 },  // Z - Thực nhận
            { wch: 20 },  // AA - Ghi chú
        ];

        columnWidths.forEach((width, idx) => {
            if (worksheet['!cols']) {
                if (!worksheet['!cols'][idx]) {
                    worksheet['!cols'][idx] = {};
                }
                worksheet['!cols'][idx] = width;
            }
        });

        console.log('🔧 Processing all sheets to add borders...');

        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
            // Skip the main sheet we already processed
            if (sheetName === 'Bảng kê  (SĐH)-đủ' || sheetIndex === 0) {
                return;
            }

            console.log(`📋 Processing sheet: "${sheetName}"`);
            const otherSheet = workbook.Sheets[sheetName];

            if (!otherSheet || !otherSheet['!ref']) {
                console.warn(`⚠️ Sheet "${sheetName}" is empty or invalid`);
                return;
            }

            // Get the range of the sheet
            const range = XLSX.utils.decode_range(otherSheet['!ref']);

            // Apply borders to all cells with data
            for (let row = range.s.r; row <= range.e.r; row++) {
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
                    const cell = otherSheet[cellAddr];

                    if (cell && cell.t !== 'z') { // Skip empty cells
                        if (!cell.s) cell.s = {};

                        // Add borders to the cell
                        if (!cell.s.border) {
                            cell.s.border = {
                                top: { style: 'thin', color: { rgb: '000000' } },
                                bottom: { style: 'thin', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } },
                            };
                        }

                        // Ensure font exists
                        if (!cell.s.font) {
                            cell.s.font = {
                                name: 'Times New Roman',
                                sz: 11,
                            };
                        }

                        // Ensure alignment exists
                        if (!cell.s.alignment) {
                            cell.s.alignment = {
                                vertical: 'center',
                                horizontal: 'center',
                            };
                        }
                    }
                }
            }

            console.log(`✅ Added borders to sheet: "${sheetName}"`);
        });

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `BangKe_GiangDay_${timestamp}.xlsx`;

        // Write workbook with all style options enabled
        const wbout = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true,
            bookSST: false,
            compression: false,
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

    } catch (error) {
        console.error('❌ Error exporting Excel:', error);
        throw error;
    }
};





