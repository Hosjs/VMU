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

    // Group consecutive rows with same STT and subject
    let i = 0;
    while (i < rows.length) {
        const currentRow = rows[i];
        const groupStartRow = data.length;
        const sameSubjectRows: TeachingScheduleRow[] = [currentRow];

        // Find consecutive rows with same STT and subject name
        let j = i + 1;
        while (j < rows.length &&
               rows[j].stt === currentRow.stt &&
               rows[j].ten_hoc_phan === currentRow.ten_hoc_phan) {
            sameSubjectRows.push(rows[j]);
            j++;
        }

        sameSubjectRows.forEach((row, index) => {
            const isNghi = (row.ten_hoc_phan || '').trim().toUpperCase() === 'NGHỈ';

            if (isNghi) {
                // Dòng NGHỈ
                data.push([
                    row.ten_hoc_phan || '',
                    '',
                    '',
                    '',
                    row.tuan || '',
                    row.ngay || '',
                    row.ghi_chu || ''
                ]);
            } else {
                // Dòng bình thường
                data.push([
                    index === 0 ? (row.stt || '') : '',
                    index === 0 ? (row.ten_hoc_phan || '') : '',
                    row.so_tin_chi || '',
                    row.can_bo_giang_day || '',
                    row.tuan ?? '',
                    row.ngay || '',
                    row.ghi_chu || ''
                ]);
            }
        });


        if ((currentRow.ten_hoc_phan || '').trim().toUpperCase() === 'NGHỈ') {
            mergeRanges.push({
                s: { r: groupStartRow, c: 0 },
                e: { r: groupStartRow, c: 3 }
            });
        }

        // If multiple rows for same subject, merge STT and subject name vertically
        if (sameSubjectRows.length > 1) {
            const groupEndRow = data.length - 1;
            mergeRanges.push(
                { s: { r: groupStartRow, c: 0 }, e: { r: groupEndRow, c: 0 } }, // Merge STT
                { s: { r: groupStartRow, c: 1 }, e: { r: groupEndRow, c: 1 } }  // Merge subject name
            );
        }

        i = j; // Move to next subject group
    }

    // 4. CÁC DÒNG KẾ HOẠCH CUỐI (NẰM TRONG BẢNG - VIẾT LIỀN NHAU)
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

    // --- THIẾT LẬP MERGE ---
    ws['!merges'] = [
        // Headers
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Header 1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Header 2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Header 3
         ...mergeRanges,
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
            ws[addr].s = { font: { name: 'Times New Roman', sz: 11 }, alignment: { vertical: 'center', wrapText: true } };

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
                ws[addr].s.fill = { fgColor: { rgb: 'F2F2F2' } };
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

    XLSX.utils.book_append_sheet(wb, ws, 'QLCA');
    XLSX.writeFile(wb, `Ke_hoach_giang_day.xlsx`);
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

    // Calculate week number string (format: Tuần XX năm YYYY)
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
        format: 'a4'
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
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Left header
    doc.text('TRƯỜNG ĐẠI HỌC HÀNG HẢI VIỆT NAM', 15, currentY);
    doc.text('VIỆN ĐÀO TẠO SAU ĐẠI HỌC', 15, currentY + 6);

    // Right header
    const rightText1 = 'KẾ HOẠCH GIẢNG DẠY VÀ HỌC TẬP';
    const rightText2 = `Từ ngày: ${startDate} đến ngày ${endDate} năm ${year} (${weekLabel})`;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(rightText1, pageWidth - 15, currentY, { align: 'right' });
    doc.setFontSize(10);
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
            content: 'Đề nghị các học viên cao học khóa 2024 đợt 1, 2 và 2025 đợt 1, 2 điểm danh bằng máy nhận diện khuôn mặt. Cùng với kết quả theo dõi học tập trên lớp của học viên, kết quả điểm danh này là cơ sở để xác định điều kiện dự thi kết thúc học phần. Thời gian học sáng bắt đầu từ 08h00, chiều bắt đầu từ 14h00. Mọi thắc mắc xin gửi về E-mail: sdh@vimaru.edu.vn hoặc gặp trực tiếp chuyên viên trực tại phòng 203 A6.',
            colSpan: 7,
            styles: { fontStyle: 'italic', fontSize: 9, halign: 'left', cellPadding: 2 }
        }
    ]);
    (tableData as any[]).push([
        {
            content: 'Phòng Khảo thi và ĐBCL triển khai kiểm tra công tác Giảng dạy và học tập theo kế hoạch.',
            colSpan: 7,
            styles: { fontStyle: 'italic', fontSize: 9, halign: 'left', cellPadding: 2 }
        }
    ]);

    // Create table
    autoTable(doc, {
        startY: currentY,
        head: [['TT', 'Lớp học', 'Học phần', 'Giảng viên', 'Thời gian', 'Phòng học', 'Kết quả\ntheo dõi']],
        body: tableData,
        styles: {
            font: 'helvetica',
            fontSize: 9,
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
            doc.setFont('helvetica', 'normal');
            doc.text('NBH: 05/5/25-REV:1', 15, doc.internal.pageSize.getHeight() - 10);
            doc.text('BM.04-QT.SDH.03', pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
    });

    // Get Y position after table
    let finalY = (doc as any).lastAutoTable.finalY + 5;

    // Add schedule section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Lịch trực lãnh đạo: Lại Huy Thiện - T7, Nguyễn Kim Phương - CN', 15, finalY);
    doc.text('Lịch trực chuyên viên: Đỗ Tất Mạnh - T7; Lê Thành Lự - CN', 15, finalY + 5);

    finalY += 15;

    // Add signature section
    doc.setFont('helvetica', 'bold');
    doc.text('Viện trưởng Viện ĐTSDH', 50, finalY, { align: 'center' });
    doc.text('Cán bộ phụ trách', pageWidth - 50, finalY, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('(Đã ký)', 50, finalY + 5, { align: 'center' });
    doc.text('(Đã ký)', pageWidth - 50, finalY + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PGS.TS. Nguyễn Kim Phương', 50, finalY + 15, { align: 'center' });
    doc.text('Trần Minh Tuấn', pageWidth - 50, finalY + 15, { align: 'center' });

    // Save PDF
    doc.save(`Ke_hoach_giang_day_tuan_${selectedWeekData.week_number || ''}.pdf`);
};

