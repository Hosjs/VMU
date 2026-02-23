import * as XLSX from 'xlsx-js-style';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Add font support for Vietnamese characters
// Note: You may need to add a Vietnamese font file for proper character rendering

// --- INTERFACES ---
interface TeachingScheduleRow {
    stt?: string | number;
    ten_hoc_phan?: string;
    so_tin_chi?: string | number;
    can_bo_giang_day?: string;
    tuan?: string;
    ngay?: string;
    ghi_chu?: string;
    isBreak?: boolean;
}

interface ExportToExcelParams {
    rows: readonly TeachingScheduleRow[];
    selectedCourseData: { ma_khoa_hoc?: string; dot?: string | number; hoc_ky?: number };
    selectedMajorData: { tenNganh?: string; maNganh?: string };
}

export const exportTeachingScheduleToExcel = ({
                                                  rows,
                                                  selectedCourseData,
                                                  selectedMajorData,
                                              }: ExportToExcelParams): void => {
    const wb = XLSX.utils.book_new();
    const data: any[][] = [];

    // 1. TIÊU ĐỀ (Ngoài bảng)
    data.push(['KẾ HOẠCH VÀ PHÂN CÔNG GIẢNG VIÊN GIẢNG DẠY']);
    data.push([`Chuyên ngành: ${selectedMajorData.tenNganh || ''}; Khóa ${selectedCourseData.ma_khoa_hoc || ''} đợt ${selectedCourseData.dot || ''}`]);
    data.push([`HỌC KỲ ${(selectedCourseData.hoc_ky || 1) === 1 ? 'I' : (selectedCourseData.hoc_ky || 1) === 2 ? 'II' : 'III'}`]);

    // 2. HEADER BẢNG (Dòng 4)
    data.push(['TT', 'Tên học phần', 'Số tín chỉ', 'Cán bộ giảng dạy', 'Tuần', 'Ngày', 'Ghi chú']);
    const headerRowIndex = 3;

    // 3. DANH SÁCH HỌC PHẦN
    // Group rows by STT and subject name to handle multiple lecturers for same subject
    const dataStartRow = data.length;
    const mergeRanges: any[] = [];
    const firstLecturerRows: number[] = []; // Track row indices of first lecturers (for bold formatting)
    const breakRowIndices: number[] = []; // Track break row indices in data array

    // Group consecutive rows with same STT and subject
    let i = 0;
    while (i < rows.length) {
        const currentRow = rows[i];
        const groupStartRow = data.length;
        const sameSubjectRows: TeachingScheduleRow[] = [currentRow];

        // Find consecutive rows with same STT and subject name
        const currentSTT = String(currentRow.stt || '').trim();
        const currentSubject = String(currentRow.ten_hoc_phan || '').trim();

        let j = i + 1;
        while (j < rows.length) {
            const nextSTT = String(rows[j].stt || '').trim();
            const nextSubject = String(rows[j].ten_hoc_phan || '').trim();

            if (nextSTT === currentSTT && nextSubject === currentSubject) {
                sameSubjectRows.push(rows[j]);
                j++;
            } else {
                break;
            }
        }

        sameSubjectRows.forEach((row, index) => {
            const isBreak = row.isBreak || (row.ten_hoc_phan && (
                row.ten_hoc_phan.includes('NGHỈ') ||
                row.ten_hoc_phan.includes('nghỉ') ||
                row.ten_hoc_phan.includes('Nghỉ') ||
                row.ten_hoc_phan.includes('Lịch nghỉ') ||
                row.ten_hoc_phan.toLowerCase().includes('nghỉ')
            ));

            if (isBreak) {
                breakRowIndices.push(data.length - 1);
            } else {
                // Dòng bình thường
                data.push([
                    index === 0 ? (row.stt || '') : '',
                    index === 0 ? (row.ten_hoc_phan || '') : '',
                    index === 0 ? (row.so_tin_chi || '') : '',  // Only show credits in first row (will be merged)
                    row.can_bo_giang_day || '',
                    row.tuan ?? '',
                    row.ngay || '',
                    row.ghi_chu || ''
                ]);

                // Mark first lecturer row for bold formatting
                if (index === 0 && sameSubjectRows.length > 1) {
                    firstLecturerRows.push(data.length - 1);
                }
            }
        });


        // Check if this is a break row (for multi-lecturer logic only)
        const isBreakRow = currentRow.isBreak || (currentRow.ten_hoc_phan && (
            currentRow.ten_hoc_phan.includes('NGHỈ') ||
            currentRow.ten_hoc_phan.includes('nghỉ') ||
            currentRow.ten_hoc_phan.includes('Nghỉ') ||
            currentRow.ten_hoc_phan.includes('Lịch nghỉ') ||
            currentRow.ten_hoc_phan.toLowerCase().includes('nghỉ')
        ));

        // Merge STT, subject name, credits for multi-lecturer rows (not break rows)
        if (sameSubjectRows.length > 1 && !isBreakRow) {
            const groupEndRow = data.length - 1;
            mergeRanges.push(
                { s: { r: groupStartRow, c: 0 }, e: { r: groupEndRow, c: 0 } }, // Merge STT
                { s: { r: groupStartRow, c: 1 }, e: { r: groupEndRow, c: 1 } }, // Merge subject name
                { s: { r: groupStartRow, c: 2 }, e: { r: groupEndRow, c: 2 } }  // Merge credits (Số tín chỉ)
            );
        }

        i = j; // Move to next subject group
    }

    const specialStartRow = data.length;
    const semesterText = (selectedCourseData.hoc_ky || 1) === 1 ? 'I' : (selectedCourseData.hoc_ky || 1) === 2 ? 'II' : 'III';

    // Chú ý: Các dòng này push liên tiếp, không xen kẽ dòng trống
    data.push([`ÔN TẬP VÀ THI HỌC KỲ ${semesterText}`, '', '', '', 'Tuần 01, 12, 03/2027', 'Ngày 04/01 đến ngày 24/01/2027', '']);
    data.push(['NGHỈ TẾT NGUYÊN ĐÁN', '', '', '', 'Tuần 04, 05, 06, 07/2027', 'Từ 25/01 đến ngày 22/02/2027', '']);
    data.push(['Thực tập', '', '7', '', '', 'Tháng 03, 04, 05/2027', '']);
    data.push(['Đề án tốt nghiệp', '', '9', '', '', 'Tháng 06, 07, 08/2027', '']);
    data.push(['Bảo vệ đề án tốt nghiệp', '', '', '', '', 'Tháng 09, 10/2027', '']);
    data.push(['Bế giảng phát bằng', '', '', '', '', 'Tháng 12/2027', '']);

    const tableEndRow = data.length - 1; // Đây là dòng cuối cùng của bảng

    // 5. PHẦN DƯỚI BẢNG (Ghi chú & Footer)
    data.push([]); // Dòng trống cách bảng
    data.push(['Ghi chú: Một tín chỉ được quy định bằng 15 giờ học lý thuyết; 30 giờ thực hành (TH), thí nghiệm (TN) hoặc thảo luận (TL); 45 giờ thực tập tại cơ sở, làm tiểu luận, bài tập lớn (BTL) hoặc đề án tốt nghiệp (ĐATN). Một giờ tín chỉ được tính bằng 50 phút học tập.']);
    const noteRow = data.length - 1;

    data.push([]);
    data.push(['NBH: 055/25-RE.V: 01', '', '', '', '', '', 'BM.01-QT.SDH.03']);
    const footerRow = data.length - 1;

    const ws = XLSX.utils.aoa_to_sheet(data);
    data.forEach((row, rowIndex) => {
        // Skip header rows (0, 1, 2)
        if (rowIndex <= 2) {
            return;
        }

        // Skip special rows (from "ÔN TẬP" to "Bế giảng")
        if (rowIndex >= specialStartRow && rowIndex <= tableEndRow) {
            return;
        }

        // Skip note row and footer rows
        if (rowIndex >= noteRow) {
            return;
        }

        const colD = row[3]; // Cột D (Cán bộ giảng dạy)
        const colE = row[4]; // Cột E (Tuần)
        const colF = row[5]; // Cột F (Ngày)
        const colA = row[0]; // Cột A (TT hoặc Tên HP cho break rows)

        // Chỉ merge nếu: có nội dung ở cột A VÀ cả 3 cột D, E, F đều rỗng
        if (colA && !colD && !colE && !colF) {
            mergeRanges.push({
                s: { r: rowIndex, c: 3 },
                e: { r: rowIndex, c: 5 }
            });
        }
    });
    // --- VALIDATE & REMOVE DUPLICATE/OVERLAPPING MERGES ---
    const validatedMerges: any[] = [];
    const mergeKeys = new Set<string>();

    // Helper function to check if two merge ranges overlap
    const isOverlapping = (m1: any, m2: any): boolean => {
        // Check if cells overlap
        const rowOverlap = !(m1.e.r < m2.s.r || m1.s.r > m2.e.r);
        const colOverlap = !(m1.e.c < m2.s.c || m1.s.c > m2.e.c);
        return rowOverlap && colOverlap;
    };

    mergeRanges.forEach((merge, index) => {
        // Create unique key for this merge range
        const key = `${merge.s.r},${merge.s.c}-${merge.e.r},${merge.e.c}`;

        // Check for duplicates
        if (mergeKeys.has(key)) {
            return;
        }

        // Check for overlaps with existing validated merges
        let hasOverlap = false;
        for (const existing of validatedMerges) {
            if (isOverlapping(merge, existing)) {
                hasOverlap = true;
                break;
            }
        }

        if (!hasOverlap) {
            mergeKeys.add(key);
            validatedMerges.push(merge);
        }
    });

    // --- THIẾT LẬP MERGE ---
    ws['!merges'] = [
        // Headers
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Header 1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Header 2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Header 3
         ...validatedMerges,
        { s: { r: specialStartRow, c: 0 }, e: { r: specialStartRow, c: 3 } },     // Ôn tập & thi
        { s: { r: specialStartRow + 1, c: 0 }, e: { r: specialStartRow + 1, c: 3 } }, // Nghỉ Tết
        { s: { r: specialStartRow + 2, c: 0 }, e: { r: specialStartRow + 2, c: 1 } }, // Thực tập
        { s: { r: specialStartRow + 3, c: 0 }, e: { r: specialStartRow + 3, c: 1 } }, // Đề án
        { s: { r: specialStartRow + 4, c: 0 }, e: { r: specialStartRow + 4, c: 1 } }, // Bảo vệ
        { s: { r: specialStartRow + 5, c: 0 }, e: { r: specialStartRow + 5, c: 1 } }, // Bế giảng

        { s: { r: noteRow, c: 0 }, e: { r: noteRow, c: 6 } },
        { s: { r: footerRow, c: 0 }, e: { r: footerRow, c: 2 } },
        { s: { r: footerRow, c: 4 }, e: { r: footerRow, c: 6 } },
    ];

    // --- ĐỊNH DẠNG STYLE ---
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[addr]) continue;

            // Font mặc định: Times New Roman
            ws[addr].s = { font: { name: 'Times New Roman', sz: 14 }, alignment: { vertical: 'center', wrapText: true } };

            // KẺ BẢNG (BORDER): Áp dụng cho TOÀN BỘ dòng từ Header đến hết Bế giảng
            if (R >= headerRowIndex && R <= tableEndRow) {
                ws[addr].s.border = {
                    top: { style: 'thin' }, bottom: { style: 'thin' },
                    left: { style: 'thin' }, right: { style: 'thin' }
                };
                // Căn lề: Cột Tên HP lề trái, còn lại căn giữa
                ws[addr].s.alignment.horizontal = (C === 1) ? 'left' : 'center';
            }

            // Header bảng: Bold + Nền xám
            if (R === headerRowIndex) {
                ws[addr].s.font.bold = true;
            }

            // Bold first lecturer name (column C = 3) when there are multiple lecturers
            if (C === 3 && firstLecturerRows.includes(R)) {
                ws[addr].s.font.bold = true;
            }

            // Bold break rows (user-created break rows with merge A→D)
            if (breakRowIndices.includes(R)) {
                ws[addr].s.font.bold = true;
            }

            // Style dòng "Ôn tập" đến "Bế giảng"
            if (R >= specialStartRow && R <= tableEndRow) {
                ws[addr].s.font.bold = true;
                // Dòng Nghỉ Tết (Chữ đỏ)
                if (R === specialStartRow + 1) ws[addr].s.font.color = { rgb: 'FF0000' };
            }

            // Tiêu đề trang
            if (R < headerRowIndex) {
                ws[addr].s.font.bold = true;
                ws[addr].s.alignment.horizontal = 'center';
                if (R === 0) ws[addr].s.font.sz = 14;
            }
        }
    }

    // Độ rộng cột chuẩn
    ws['!cols'] = [{ wch: 6 }, { wch: 45 }, { wch: 10 }, { wch: 25 }, { wch: 18 }, { wch: 30 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Ke hoach giang day');

    // Use writeFile with bookType option for browser compatibility
    XLSX.writeFile(wb, `Ke_hoach_giang_day.xlsx`, { bookType: 'xlsx', type: 'binary' });
};

// --- WEEKLY SCHEDULE EXPORT ---

interface WeeklyScheduleRow {
    stt: number;
    class_names: string[];
    subject_name?: string;
    lecturer_name?: string;
    time_slot?: string;
    room?: string;
    ghi_chu?: string;
}

interface ExportWeeklyScheduleParams {
    rows: readonly WeeklyScheduleRow[];
    selectedCourseData: {
        ma_khoa_hoc?: string;
        dot?: string | number;
        hoc_ky?: number;
        nam_hoc?: number;
    };
    selectedWeekData: {
        week_number?: number;
        week_label?: string;
        start_date?: string;
        end_date?: string;
        display_label?: string;
    };
}

export const exportWeeklyScheduleToExcel = ({
    rows,
    selectedCourseData,
    selectedWeekData,
}: ExportWeeklyScheduleParams): void => {
    const wb = XLSX.utils.book_new();
    const data: any[][] = [];

    // Format dates from week data
    const startDate = selectedWeekData.start_date
        ? new Date(selectedWeekData.start_date).toLocaleDateString('vi-VN').replace(/\//g, '/')
        : '';
    const endDate = selectedWeekData.end_date
        ? new Date(selectedWeekData.end_date).toLocaleDateString('vi-VN').replace(/\//g, '/')
        : '';
    const year = selectedWeekData.start_date
        ? new Date(selectedWeekData.start_date).getFullYear()
        : new Date().getFullYear();

    const weekLabel = selectedWeekData.week_label || `Tuần ${selectedWeekData.week_number || ''}`;

    // 1. HEADER - Row 0: School name (left, cols 0-2) & Title (right, cols 4-6)
    data.push(['TRƯỜNG ĐẠI HỌC HÀNG HẢI VIỆT NAM', '', '', '', 'KẾ HOẠCH GIẢNG DẠY VÀ HỌC TẬP', '', '']);

    // 2. HEADER - Row 1: Department (left, cols 0-2) & Date range (right, cols 4-6)
    data.push(['VIỆN ĐÀO TẠO SAU ĐẠI HỌC', '', '', '', `Từ ngày: ${startDate} đến ngày ${endDate} năm ${year} (${weekLabel})`, '', '']);

    // 3. Empty row for spacing
    data.push([]);

    // 4. TABLE HEADER
    const headerRowIndex = data.length;
    data.push(['TT', 'Lớp học', 'Học phần', 'Giảng viên', 'Thời gian', 'Phòng học', 'Kết quả\ntheo dõi']);

    const instructionRowIndex1 = data.length;
    data.push(['Đề nghị các học viên cao học khóa 2024 đợt 1, 2 và 2025 đợt 1, 2 điểm danh bằng máy nhận diện khuôn mặt. Cùng với kết quả theo dõi học tập trên lớp của học viên, kết quả điểm danh này là cơ sở để xác định điều kiện dự thi kết thúc học phần. Thời gian học sáng bắt đầu từ 08h00, chiều bắt đầu từ 14h00. Mọi thắc mắc xin gửi về E-mail: sdh@vimaru.edu.vn hoặc gặp trực tiếp chuyên viên trực tại phòng 203 A6.']);

    const instructionRowIndex2 = data.length;
    data.push(['Phòng Khảo thi và ĐBCL triển khai kiểm tra công tác Giảng dạy và học tập theo kế hoạch.']);

    // 6. TABLE DATA
    rows.forEach((row) => {
        const classNames = Array.isArray(row.class_names)
            ? row.class_names.join('\n')
            : row.class_names || '';

        data.push([
            row.stt || '',
            classNames,
            row.subject_name || '',
            row.lecturer_name || '',
            row.time_slot || '',
            row.room || '',
            row.ghi_chu || ''
        ]);
    });


    const tableEndRow = data.length - 1;

    // 7. FOOTER - Lịch trực (OUTSIDE TABLE)
    data.push([]); // Empty row
    const scheduleRow1 = data.length;
    data.push(['Lịch trực lãnh đạo: Lại Huy Thiện - T7, Nguyễn Kim Phương - CN']);
    const scheduleRow2 = data.length;
    data.push(['Lịch trực chuyên viên: Đỗ Tất Mạnh - T7; Lê Thành Lự - CN']);

    // 8. Signature section (Left: cols 0-2, Right: cols 4-6)
    data.push([]); // Empty row
    const signatureRow1 = data.length;
    data.push(['Viện trưởng Viện ĐTSDH', '', '', '', 'Cán bộ phụ trách', '', '']);
    const signatureRow2 = data.length;
    data.push(['(Đã ký)', '', '', '', '(Đã ký)', '', '']);
    data.push([]); // Empty row for spacing
    const signatureRow3 = data.length;
    data.push(['PGS.TS. Nguyễn Kim Phương', '', '', '', 'Trần Minh Tuấn', '', '']);

    // 9. Document code footer (Left: cols 0-2, Right: cols 4-6)
    data.push([]);
    const footerRow = data.length;
    data.push(['NBH: 05/5/25-REV:1', '', '', '', 'BM.04-QT.SDH.03', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Ensure header cells exist and have values (fix for missing headers)
    // Left side (column A = 0)
    if (!ws['A1']) ws['A1'] = { t: 's', v: 'TRƯỜNG ĐẠI HỌC HÀNG HẢI VIỆT NAM' };
    if (!ws['A2']) ws['A2'] = { t: 's', v: 'VIỆN ĐÀO TẠO SAU ĐẠI HỌC' };

    // Right side (column E = 4)
    if (!ws['E1']) ws['E1'] = { t: 's', v: 'KẾ HOẠCH GIẢNG DẠY VÀ HỌC TẬP' };
    if (!ws['E2']) ws['E2'] = { t: 's', v: `Từ ngày: ${startDate} đến ngày ${endDate} năm ${year} (${weekLabel})` };

    // Signature right side (column E = 4)
    const sigRow1 = signatureRow1 + 1; // +1 because Excel is 1-based
    const sigRow2 = signatureRow2 + 1;
    const sigRow3 = signatureRow3 + 1;
    if (!ws[`E${sigRow1}`]) ws[`E${sigRow1}`] = { t: 's', v: 'Cán bộ phụ trách' };
    if (!ws[`E${sigRow2}`]) ws[`E${sigRow2}`] = { t: 's', v: '(Đã ký)' };
    if (!ws[`E${sigRow3}`]) ws[`E${sigRow3}`] = { t: 's', v: 'Trần Minh Tuấn' };

    // Footer right side (column E = 4)
    const footerRowExcel = footerRow + 1;
    if (!ws[`E${footerRowExcel}`]) ws[`E${footerRowExcel}`] = { t: 's', v: 'BM.04-QT.SDH.03' };

    // --- MERGES ---
    ws['!merges'] = [
        // Header row 0: Left (cols 0-2) and Right (cols 4-6)
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },

        // Header row 1: Left (cols 0-2) and Right (cols 4-6)
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        { s: { r: 1, c: 4 }, e: { r: 1, c: 6 } },

        // Instruction text rows (merge across all 7 columns of table)
        { s: { r: instructionRowIndex1, c: 0 }, e: { r: instructionRowIndex1, c: 6 } },
        { s: { r: instructionRowIndex2, c: 0 }, e: { r: instructionRowIndex2, c: 6 } },

        // Schedule rows (merge all 7 columns)
        { s: { r: scheduleRow1, c: 0 }, e: { r: scheduleRow1, c: 6 } },
        { s: { r: scheduleRow2, c: 0 }, e: { r: scheduleRow2, c: 6 } },

        // Signature rows - Left and Right
        { s: { r: signatureRow1, c: 0 }, e: { r: signatureRow1, c: 2 } }, // Left title
        { s: { r: signatureRow1, c: 4 }, e: { r: signatureRow1, c: 6 } }, // Right title
        { s: { r: signatureRow2, c: 0 }, e: { r: signatureRow2, c: 2 } }, // Left (Đã ký)
        { s: { r: signatureRow2, c: 4 }, e: { r: signatureRow2, c: 6 } }, // Right (Đã ký)
        { s: { r: signatureRow3, c: 0 }, e: { r: signatureRow3, c: 2 } }, // Left name
        { s: { r: signatureRow3, c: 4 }, e: { r: signatureRow3, c: 6 } }, // Right name

        // Footer - Document code
        { s: { r: footerRow, c: 0 }, e: { r: footerRow, c: 2 } },
        { s: { r: footerRow, c: 4 }, e: { r: footerRow, c: 6 } },
    ];

    // --- STYLING ---
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });

            // Create cell if it doesn't exist
            if (!ws[addr]) {
                ws[addr] = { t: 's', v: '' };
            }

            // Default font: Arial (better Vietnamese support than Times New Roman)
            if (!ws[addr].s) {
                ws[addr].s = {};
            }
            ws[addr].s.font = { name: 'Arial', sz: 11 };
            ws[addr].s.alignment = { vertical: 'center', wrapText: true };

            // School headers (rows 0-1) - Make text BOLD and visible
            if (R <= 1) {
                ws[addr].s.font.bold = true;
                ws[addr].s.font.sz = 13;
                ws[addr].s.alignment.horizontal = 'center';
                ws[addr].s.alignment.vertical = 'center';
            }

            // Table borders (from header to end of table - ALL INSIDE TABLE)
            if (R >= headerRowIndex && R <= tableEndRow) {
                ws[addr].s.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Alignment for data rows (between header and instruction text)
                if (R > headerRowIndex && R < instructionRowIndex1) {
                    // Data rows: Subject and Lecturer left-aligned, others center
                    ws[addr].s.alignment.horizontal = (C === 2 || C === 3) ? 'left' : 'center';
                }
            }

            // Table header styling
            if (R === headerRowIndex) {
                ws[addr].s.font.bold = true;
                ws[addr].s.fill = { fgColor: { rgb: 'F2F2F2' } };
                ws[addr].s.alignment.horizontal = 'center';
            }

            // Instruction text rows (italic, left-aligned, smaller font)
            if (R === instructionRowIndex1 || R === instructionRowIndex2) {
                ws[addr].s.font.italic = true;
                ws[addr].s.font.sz = 10;
                ws[addr].s.alignment.horizontal = 'left';
                ws[addr].s.alignment.vertical = 'top';
            }

            // Schedule rows (lịch trực)
            if (R === scheduleRow1 || R === scheduleRow2) {
                ws[addr].s.font.sz = 11;
                ws[addr].s.alignment.horizontal = 'left';
            }

            // Signature section
            if (R === signatureRow1 || R === signatureRow3) {
                ws[addr].s.font.bold = true;
                ws[addr].s.font.sz = 11;
                ws[addr].s.alignment.horizontal = 'center';
            }

            if (R === signatureRow2) {
                ws[addr].s.font.italic = true;
                ws[addr].s.font.sz = 10;
                ws[addr].s.alignment.horizontal = 'center';
            }

            // Footer row (document code)
            const lastRow = data.length - 1;
            if (R === lastRow) {
                ws[addr].s.font.sz = 10;
                ws[addr].s.alignment.horizontal = C <= 2 ? 'left' : 'right';
            }
        }
    }

    // Row heights for instruction text (make them taller)
    if (!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][instructionRowIndex1] = { hpt: 45, hpx: 45 }; // Height in points
    ws['!rows'][instructionRowIndex2] = { hpt: 30, hpx: 30 };

    // Column widths
    ws['!cols'] = [
        { wch: 5 },   // TT
        { wch: 20 },  // Lớp học
        { wch: 35 },  // Học phần
        { wch: 20 },  // Giảng viên
        { wch: 18 },  // Thời gian
        { wch: 15 },  // Phòng học
        { wch: 18 }   // Kết quả theo dõi
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Lịch học tuần');
    XLSX.writeFile(wb, `Ke_hoach_giang_day_tuan_${selectedWeekData.week_number || ''}.xlsx`);
};

// --- WEEKLY SCHEDULE PDF EXPORT ---

export const exportWeeklyScheduleToPDF = ({
    rows,
    selectedCourseData,
    selectedWeekData,
}: ExportWeeklyScheduleParams): void => {
    // Create PDF in A4 landscape format
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    // Format dates
    const startDate = selectedWeekData.start_date
        ? new Date(selectedWeekData.start_date).toLocaleDateString('vi-VN')
        : '';
    const endDate = selectedWeekData.end_date
        ? new Date(selectedWeekData.end_date).toLocaleDateString('vi-VN')
        : '';
    const year = selectedWeekData.start_date
        ? new Date(selectedWeekData.start_date).getFullYear()
        : new Date().getFullYear();
    const weekLabel = selectedWeekData.week_label || `Tuần ${selectedWeekData.week_number || ''}`;

    let currentY = 15;

    // Header - Left and Right
    // Note: Standard jsPDF fonts have limited Vietnamese support
    // For best results, consider adding a custom font
    doc.setFontSize(13);
    doc.setFont('times', 'bold');

    // Left header
    doc.text('TRUONG DAI HOC HANG HAI VIET NAM', 15, currentY);
    doc.text('VIEN DAO TAO SAU DAI HOC', 15, currentY + 6);

    // Right header
    const rightText1 = 'KE HOACH GIANG DAY VA HOC TAP';
    const rightText2 = `Tu ngay: ${startDate} den ngay ${endDate} nam ${year} (${weekLabel})`;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(rightText1, pageWidth - 15, currentY, { align: 'right' });
    doc.setFontSize(11);
    doc.text(rightText2, pageWidth - 15, currentY + 6, { align: 'right' });

    currentY += 15;


    // Prepare table data
    const tableData = rows.map((row) => {
        const classNames = Array.isArray(row.class_names)
            ? row.class_names.join('\n')
            : row.class_names || '';

        return [
            row.stt || '',
            classNames,
            row.subject_name || '',
            row.lecturer_name || '',
            row.time_slot || '',
            row.room || '',
            row.ghi_chu || ''
        ];
    });

    // Add instruction text rows at the END of table data
    (tableData as any[]).push([
        {
            content: 'De nghi cac hoc vien cao hoc khoa 2024 dot 1, 2 va 2025 dot 1, 2 diem danh bang may nhan dien khuon mat. Cung voi ket qua theo doi hoc tap tren lop cua hoc vien, ket qua diem danh nay la co so de xac dinh dieu kien du thi ket thuc hoc phan. Thoi gian hoc sang bat dau tu 08h00, chieu bat dau tu 14h00. Moi thac mac xin gui ve E-mail: sdh@vimaru.edu.vn hoac gap truc tiep chuyen vien truc tai phong 203 A6.',
            colSpan: 7,
            styles: { fontStyle: 'italic', fontSize: 9, halign: 'left', cellPadding: 2 }
        }
    ]);
    (tableData as any[]).push([
        {
            content: 'Phong Khao thi va DBCL trien khai kiem tra cong tac Giang day va hoc tap theo ke hoach.',
            colSpan: 7,
            styles: { fontStyle: 'italic', fontSize: 9, halign: 'left', cellPadding: 2 }
        }
    ]);

    // Create table
    autoTable(doc, {
        startY: currentY,
        head: [['TT', 'Lop hoc', 'Hoc phan', 'Giang vien', 'Thoi gian', 'Phong hoc', 'Ket qua\ntheo doi']],
        body: tableData,
        styles: {
            font: 'times',  // Changed from helvetica to times for better support
            fontSize: 10,
            cellPadding: 2,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [242, 242, 242],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            fontSize: 11,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },  // TT
            1: { halign: 'center', cellWidth: 35 },  // Lớp học
            2: { halign: 'left', cellWidth: 60 },    // Học phần
            3: { halign: 'left', cellWidth: 40 },    // Giảng viên
            4: { halign: 'center', cellWidth: 35 },  // Thời gian
            5: { halign: 'center', cellWidth: 25 },  // Phòng học
            6: { halign: 'center', cellWidth: 30 },  // Kết quả
        },
        margin: { left: 15, right: 15 },
        didDrawPage: () => {
            // Footer on every page
            doc.setFontSize(9);
            doc.setFont('times', 'normal');
            doc.text('NBH: 05/5/25-REV:1', 15, doc.internal.pageSize.getHeight() - 10);
            doc.text('BM.04-QT.SDH.03', pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
    });

    // Get Y position after table
    let finalY = (doc as any).lastAutoTable.finalY + 5;

    // Add schedule section
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.text('Lich truc lanh dao: Lai Huy Thien - T7, Nguyen Kim Phuong - CN', 15, finalY);
    doc.text('Lich truc chuyen vien: Do Tat Manh - T7; Le Thanh Lu - CN', 15, finalY + 5);

    finalY += 15;

    // Add signature section
    doc.setFont('times', 'bold');
    doc.text('Vien truong Vien DTSDH', 50, finalY, { align: 'center' });
    doc.text('Can bo phu trach', pageWidth - 50, finalY, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.text('(Da ky)', 50, finalY + 5, { align: 'center' });
    doc.text('(Da ky)', pageWidth - 50, finalY + 5, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('PGS.TS. Nguyen Kim Phuong', 50, finalY + 15, { align: 'center' });
    doc.text('Tran Minh Tuan', pageWidth - 50, finalY + 15, { align: 'center' });

    // Save PDF
    doc.save(`Ke_hoach_giang_day_tuan_${selectedWeekData.week_number || ''}.pdf`);
};

