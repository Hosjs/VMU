import * as XLSX from 'xlsx-js-style';
import type { TeachingScheduleRow } from '~/types/teaching-schedule';

export interface TeachingScheduleImportMetadata {
  majorName?: string;
  courseCode?: string;
  semesterText?: string;
}

export interface TeachingScheduleImportResult {
  rows: TeachingScheduleRow[];
  metadata: TeachingScheduleImportMetadata;
}

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

const normalizeRow = (row: unknown[]): string[] => row.map(normalizeText);

const isBlankRow = (row: string[]): boolean => row.every(cell => cell === '');

const toNumberOrEmpty = (value: string): number | '' => {
  if (!value) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '';
};

const HEADER_CHECKS = ['TT', 'Tên học phần', 'Số tín chỉ', 'Cán bộ giảng dạy'];

const STOP_ROW_PATTERNS = [
  /^ÔN TẬP VÀ THI HỌC KỲ/i,
  /^NGHỈ TẾT NGUYÊN ĐÁN/i,
  /^Thực tập/i,
  /^Đề án tốt nghiệp/i,
  /^Bảo vệ đề án tốt nghiệp/i,
  /^Bế giảng phát bằng/i,
  /^Ghi chú:/i,
  /^NBH:/i,
];

const parseMetadata = (rows: string[][]): TeachingScheduleImportMetadata => {
  const majorLine = rows.find(row => row[0].toLowerCase().includes('chuyên ngành:'))?.[0] || '';
  const semesterLine = rows.find(row => row[0].toUpperCase().includes('HỌC KỲ'))?.[0] || '';

  const majorMatch = majorLine.match(/Chuyên ngành:\s*(.*?);\s*Khóa\s*(.*?)(?:\s*đợt\s*(.*))?$/i);
  const semesterMatch = semesterLine.match(/HỌC KỲ\s*(.+)$/i);

  return {
    majorName: majorMatch?.[1] ? normalizeText(majorMatch[1]) : undefined,
    courseCode: majorMatch?.[2] ? normalizeText(majorMatch[2]) : undefined,
    semesterText: semesterMatch?.[1] ? normalizeText(semesterMatch[1]) : undefined,
  };
};

export const parseTeachingScheduleExcel = async (file: File): Promise<TeachingScheduleImportResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellStyles: true,
    cellFormula: true,
    cellNF: true,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Không tìm thấy sheet nào trong file Excel');
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Không đọc được sheet dữ liệu trong file Excel');
  }

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  }) as unknown[][];

  const normalizedRows = aoa.map(normalizeRow);
  const headerIndex = normalizedRows.findIndex(row =>
    row[0] === HEADER_CHECKS[0] &&
    row[1].toLowerCase().includes(HEADER_CHECKS[1].toLowerCase()) &&
    row[2].toLowerCase().includes(HEADER_CHECKS[2].toLowerCase()) &&
    row[3].toLowerCase().includes(HEADER_CHECKS[3].toLowerCase())
  );

  if (headerIndex < 0) {
    throw new Error('Không tìm thấy dòng tiêu đề bảng kế hoạch giảng dạy trong file Excel');
  }

  const metadata = parseMetadata(normalizedRows.slice(0, headerIndex));
  const rows: TeachingScheduleRow[] = [];

  let lastSubjectRow: { stt: number; ten_hoc_phan: string; so_tin_chi: number | '' } | null = null;
  let lastDisplayedStt = 0;

  for (let index = headerIndex + 1; index < normalizedRows.length; index += 1) {
    const row = normalizedRows[index];
    if (isBlankRow(row)) continue;

    const firstCell = row[0] || '';
    const isStopRow = STOP_ROW_PATTERNS.some(pattern => pattern.test(firstCell));
    if (isStopRow) break;

    const tenHocPhan = row[1] || '';
    const soTinChi = row[2] || '';
    const canBoGiangDay = row[3] || '';
    const tuan = row[4] || '';
    const ngay = row[5] || '';
    const ghiChu = row[6] || '';

    const isBreakRow = !tenHocPhan && !soTinChi && !canBoGiangDay && /nghỉ/i.test(firstCell);
    if (isBreakRow) {
      lastDisplayedStt += 1;
      rows.push({
        id: `import-break-${index}-${rows.length}`,
        stt: lastDisplayedStt,
        ten_hoc_phan: firstCell,
        so_tin_chi: '',
        can_bo_giang_day: '',
        tuan,
        ngay,
        ghi_chu: ghiChu,
        isNew: true,
        isBreak: true,
      });
      lastSubjectRow = null;
      continue;
    }

    const hasOwnSubjectData = Boolean(firstCell || tenHocPhan || soTinChi);
    const hasLecturerOnlyData = !hasOwnSubjectData && Boolean(canBoGiangDay);

    if (hasLecturerOnlyData) {
      if (!lastSubjectRow) continue;

      rows.push({
        id: `import-lecturer-${index}-${rows.length}`,
        stt: lastSubjectRow.stt,
        ten_hoc_phan: lastSubjectRow.ten_hoc_phan,
        so_tin_chi: lastSubjectRow.so_tin_chi,
        can_bo_giang_day: canBoGiangDay,
        tuan,
        ngay,
        ghi_chu: ghiChu,
        isNew: true,
        isAdditionalLecturer: true,
      });
      continue;
    }

    const parsedStt = Number.parseInt(firstCell.replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(parsedStt)) {
      continue;
    }

    const parsedSubject: string = tenHocPhan || (lastSubjectRow ? lastSubjectRow.ten_hoc_phan : '');
    const parsedCredits = toNumberOrEmpty(soTinChi);

    lastDisplayedStt = parsedStt;
    lastSubjectRow = {
      stt: parsedStt,
      ten_hoc_phan: parsedSubject,
      so_tin_chi: parsedCredits,
    };

    rows.push({
      id: `import-${index}-${rows.length}`,
      stt: parsedStt,
      ten_hoc_phan: parsedSubject,
      so_tin_chi: parsedCredits,
      can_bo_giang_day: canBoGiangDay,
      tuan,
      ngay,
      ghi_chu: ghiChu,
      isNew: true,
    });
  }

  return { rows, metadata };
};

