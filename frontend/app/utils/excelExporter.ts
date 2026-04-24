import * as XLSX from 'xlsx-js-style';

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
    selectedCourseData: { ma_khoa_hoc?: string; dot?: string | number; nam_hoc?: number };
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
    data.push([`NĂM HỌC ${selectedCourseData.nam_hoc || ''} - ĐỢT ${selectedCourseData.dot || ''}`]);

    // 2. HEADER BẢNG (Dòng 4)
    data.push(['TT', 'Tên học phần', 'Số tín chỉ', 'Cán bộ giảng dạy', 'Tuần', 'Ngày', 'Ghi chú']);
    const headerRowIndex = 3;

    // 3. DANH SÁCH HỌC PHẦN
    const dataStartRow = data.length;
    const mergeRanges: any[] = [];
    const firstLecturerRows: number[] = []; // Track row indices of first lecturers (for bold formatting)
    const breakRowIndices: number[] = []; // Track break row indices in data array

    // Group consecutive rows with same STT and subject
    let i = 0;
    while (i < rows.length) {
        const currentRow = rows[i];

        // Kiểm tra xem có phải dòng NGHỈ không (check cả isBreak flag và text)
        const isBreak = currentRow.isBreak ||
            (currentRow.ten_hoc_phan && currentRow.ten_hoc_phan.toUpperCase().includes('NGHỈ'));

        if (isBreak) {
            // DÒNG NGHỈ - Push dữ liệu vào cột A (viết HOA) và để trống các cột B, C, D
            const breakRowData = [
                currentRow.ten_hoc_phan?.toUpperCase() || '', // Viết HOA
                '', // Cột B trống
                '', // Cột C trống
                '', // Cột D trống
                currentRow.tuan || '',
                currentRow.ngay || '',
                currentRow.ghi_chu || ''
            ];
            data.push(breakRowData);
            // Lưu index để merge A→D và format bold sau
            breakRowIndices.push(data.length - 1);

            i++;
            continue;
        }

        // XỬ LÝ DÒNG BÌNH THƯỜNG (như cũ)
        const groupStartRow = data.length;
        const sameSubjectRows: TeachingScheduleRow[] = [currentRow];

        const currentSTT = String(currentRow.stt || '').trim();
        const currentSubject = String(currentRow.ten_hoc_phan || '').trim();

        let j = i + 1;
        while (j < rows.length) {
            const nextRow = rows[j];
            const nextIsBreak = nextRow.isBreak ||
                (nextRow.ten_hoc_phan && nextRow.ten_hoc_phan.toUpperCase().includes('NGHỈ'));

            if (nextIsBreak) break;

            const nextSTT = String(nextRow.stt || '').trim();
            const nextSubject = String(nextRow.ten_hoc_phan || '').trim();

            if (nextSTT === currentSTT && nextSubject === currentSubject) {
                sameSubjectRows.push(nextRow);
                j++;
            } else {
                break;
            }
        }

        sameSubjectRows.forEach((row, index) => {
            data.push([
                index === 0 ? (row.stt || '') : '',
                index === 0 ? (row.ten_hoc_phan || '') : '',
                index === 0 ? (row.so_tin_chi || '') : '',
                row.can_bo_giang_day || '',
                row.tuan ?? '',
                row.ngay || '',
                row.ghi_chu || ''
            ]);

            if (index === 0 && sameSubjectRows.length > 1) {
                firstLecturerRows.push(data.length - 1);
            }
        });

        if (sameSubjectRows.length > 1) {
            const groupEndRow = data.length - 1;
            mergeRanges.push(
                { s: { r: groupStartRow, c: 0 }, e: { r: groupEndRow, c: 0 } },
                { s: { r: groupStartRow, c: 1 }, e: { r: groupEndRow, c: 1 } },
                { s: { r: groupStartRow, c: 2 }, e: { r: groupEndRow, c: 2 } }
            );
        }

        i = j;
    }

    // MERGE A→D cho các dòng NGHỈ
    const breakRowMerges: any[] = [];
    breakRowIndices.forEach(rowIndex => {
        const merge = {
            s: { r: rowIndex, c: 0 },
            e: { r: rowIndex, c: 3 }
        };
        breakRowMerges.push(merge);
        mergeRanges.push(merge);
    });

    // 4. CÁC DÒNG KẾ HOẠCH CUỐI (NẰM TRONG BẢNG - VIẾT LIỀN NHAU)
    const specialStartRow = data.length;

    // Chú ý: Các dòng này push liên tiếp, không xen kẽ dòng trống
    data.push([`ÔN TẬP VÀ THI NĂM HỌC ${selectedCourseData.nam_hoc || ''} - ĐỢT ${selectedCourseData.dot || ''}`, '', '', '', '', '', '']);
    data.push(['NGHỈ TẾT NGUYÊN ĐÁN', '', '', '', '', '', '']);
    data.push(['Thực tập', '', '7', '', '', '', '']);
    data.push(['Đề án tốt nghiệp', '', '9', '', '', '', '']);
    data.push(['Bảo vệ đề án tốt nghiệp', '', '', '', '', '', '']);
    data.push(['Bế giảng phát bằng', '', '', '', '', '', '']);

    const tableEndRow = data.length - 1; // Đây là dòng cuối cùng của bảng

    // 5. PHẦN DƯỚI BẢNG (Ghi chú & Footer)
    data.push([]); // Dòng trống cách bảng
    data.push(['Ghi chú: Một tín chỉ được quy định bằng 15 giờ học lý thuyết; 30 giờ thực hành (TH), thí nghiệm (TN) hoặc thảo luận (TL); 45 giờ thực tập tại cơ sở, làm tiểu luận, bài tập lớn (BTL) hoặc đề án tốt nghiệp (ĐATN). Một giờ tín chỉ được tính bằng 50 phút học tập.']);
    const noteRow = data.length - 1;

    data.push([]);
    data.push(['NBH: 055/25-RE.V: 01', '', '', '', '', '', 'BM.01-QT.SDH.03']);
    const footerRow = data.length - 1;

    const ws = XLSX.utils.aoa_to_sheet(data);

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
            console.warn(`⚠️  Duplicate merge detected at index ${index}:`, merge);
            return;
        }

        // Check for overlaps with existing validated merges
        let hasOverlap = false;
        for (const existing of validatedMerges) {
            if (isOverlapping(merge, existing)) {
                console.warn(`⚠️  Overlapping merge detected:`, merge, 'overlaps with', existing);
                hasOverlap = true;
                break;
            }
        }

        if (!hasOverlap) {
            mergeKeys.add(key);
            validatedMerges.push(merge);
        } else {
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

            // BOLD cho dòng NGHỈ do user tạo (merge A→D)
            if (breakRowIndices.includes(R) && C <= 3) {
                ws[addr].s.font.bold = true;
                ws[addr].s.alignment.horizontal = 'center';
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

    // Use Blob + anchor download for reliable cross-environment support
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ke_hoach_giang_day.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

    // Use Blob + anchor download for reliable cross-environment support
    const filename = `Ke_hoach_giang_day_tuan_${selectedWeekData.week_number || ''}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// --- WEEKLY SCHEDULE PDF EXPORT (html2canvas - hỗ trợ tiếng Việt) ---

export const exportWeeklyScheduleToPDF = async ({
    rows,
    selectedCourseData,
    selectedWeekData,
}: ExportWeeklyScheduleParams): Promise<void> => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF: JsPDF } = await import('jspdf');

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

    // Build HTML table
    const tableRows = rows.map((row, i) => {
        const classNames = Array.isArray(row.class_names)
            ? row.class_names.join('<br/>')
            : (row.class_names || '');
        return `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'}">
            <td style="text-align:center;padding:5px 4px;border:1px solid #ccc">${row.stt || i + 1}</td>
            <td style="text-align:center;padding:5px 4px;border:1px solid #ccc">${classNames}</td>
            <td style="padding:5px 4px;border:1px solid #ccc">${row.subject_name || ''}</td>
            <td style="padding:5px 4px;border:1px solid #ccc">${row.lecturer_name || ''}</td>
            <td style="text-align:center;padding:5px 4px;border:1px solid #ccc">${row.time_slot || ''}</td>
            <td style="text-align:center;padding:5px 4px;border:1px solid #ccc">${row.room || ''}</td>
            <td style="text-align:center;padding:5px 4px;border:1px solid #ccc">${row.ghi_chu || ''}</td>
        </tr>`;
    }).join('');

    const html = `
    <div id="pdf-content" style="font-family:'Times New Roman',Times,serif;font-size:11pt;width:1050px;padding:20px 30px;background:#fff;color:#000">
        <table style="width:100%;margin-bottom:10px;border:none"><tr>
            <td style="width:50%;vertical-align:top;border:none">
                <div style="font-size:12pt;font-weight:bold">TRƯỜNG ĐẠI HỌC HÀNG HẢI VIỆT NAM</div>
                <div style="font-size:11pt;font-weight:bold">VIỆN ĐÀO TẠO SAU ĐẠI HỌC</div>
            </td>
            <td style="width:50%;vertical-align:top;text-align:right;border:none">
                <div style="font-size:12pt;font-weight:bold">KẾ HOẠCH GIẢNG DẠY VÀ HỌC TẬP</div>
                <div style="font-size:10pt">Từ ngày: ${startDate} đến ngày ${endDate} năm ${year} (${weekLabel})</div>
            </td>
        </tr></table>

        <table style="width:100%;border-collapse:collapse;font-size:10pt">
            <thead>
                <tr style="background:#e8eaf6">
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:4%">TT</th>
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:13%">Lớp học</th>
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:23%">Học phần</th>
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:16%">Giảng viên</th>
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:14%">Thời gian</th>
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:10%">Phòng học</th>
                    <th style="padding:6px 4px;border:1px solid #999;text-align:center;width:11%">Kết quả<br/>theo dõi</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
                <tr>
                    <td colspan="7" style="padding:5px 6px;border:1px solid #ccc;font-style:italic;font-size:9pt">
                        Đề nghị các học viên cao học khóa 2024 đợt 1, 2 và 2025 đợt 1, 2 điểm danh bằng máy nhận diện khuôn mặt.
                        Cùng với kết quả theo dõi học tập trên lớp của học viên, kết quả điểm danh này là cơ sở để xác định điều kiện dự thi kết thúc học phần.
                        Thời gian học sáng bắt đầu từ 08h00, chiều bắt đầu từ 14h00. Mọi thắc mắc xin gửi về E-mail: sdh@vimaru.edu.vn hoặc gặp trực tiếp chuyên viên trực tại phòng 203 A6.
                    </td>
                </tr>
                <tr>
                    <td colspan="7" style="padding:5px 6px;border:1px solid #ccc;font-style:italic;font-size:9pt">
                        Phòng Khảo thí và ĐBCL triển khai kiểm tra công tác Giảng dạy và học tập theo kế hoạch.
                    </td>
                </tr>
            </tfoot>
        </table>

        <div style="margin-top:8px;font-size:10pt">
            <div>Lịch trực lãnh đạo: Lại Huy Thiện - T7, Nguyễn Kim Phương - CN</div>
            <div>Lịch trực chuyên viên: Đỗ Tất Mạnh - T7; Lê Thanh Lữ - CN</div>
        </div>

        <table style="width:100%;margin-top:14px;border:none;font-size:10pt"><tr>
            <td style="width:50%;text-align:center;border:none">
                <div style="font-weight:bold">Viện trưởng Viện ĐTSDH</div>
                <div style="font-style:italic">(Đã ký)</div>
                <div style="margin-top:18px;font-weight:bold">PGS.TS. Nguyễn Kim Phương</div>
            </td>
            <td style="width:50%;text-align:center;border:none">
                <div style="font-weight:bold">Cán bộ phụ trách</div>
                <div style="font-style:italic">(Đã ký)</div>
                <div style="margin-top:18px;font-weight:bold">Trần Minh Tuấn</div>
            </td>
        </tr></table>

        <div style="margin-top:10px;font-size:8pt;display:flex;justify-content:space-between">
            <span>NBH: 05/5/25-REV:1</span>
            <span>BM.04-QT.SDH.03</span>
        </div>
    </div>`;

    // Render into hidden DOM element
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1';
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
        const element = container.querySelector('#pdf-content') as HTMLElement;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgW = canvas.width;
        const imgH = canvas.height;

        // A4 landscape: 297 x 210 mm
        const pdfW = 297;
        const pdfH = 210;
        const ratio = pdfW / (imgW / 2); // divide by scale
        const renderedH = (imgH / 2) * ratio;

        const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        if (renderedH <= pdfH) {
            doc.addImage(imgData, 'JPEG', 0, 0, pdfW, renderedH);
        } else {
            // Multi-page
            const pageH = pdfH;
            const totalPages = Math.ceil(renderedH / pageH);
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) doc.addPage();
                doc.addImage(imgData, 'JPEG', 0, -(page * pageH), pdfW, renderedH);
            }
        }

        doc.save(`Ke_hoach_giang_day_tuan_${selectedWeekData.week_number || ''}.pdf`);
    } finally {
        document.body.removeChild(container);
    }
};

