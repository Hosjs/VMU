import * as XLSX from 'xlsx-js-style';

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