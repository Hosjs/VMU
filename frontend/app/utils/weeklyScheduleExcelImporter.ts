import * as XLSX from 'xlsx-js-style';
import type { WeeklyScheduleRow } from '~/types/weekly-schedule';

const normalizeText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
};

const normalizeMultilineText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\r\n/g, '\n').trim();
};

const isHeaderRow = (row: string[]): boolean => {
  const c0 = row[0]?.toLowerCase() || '';
  const c1 = row[1]?.toLowerCase() || '';
  const c2 = row[2]?.toLowerCase() || '';
  const c3 = row[3]?.toLowerCase() || '';
  const c4 = row[4]?.toLowerCase() || '';
  const c5 = row[5]?.toLowerCase() || '';

  return (
    c0 === 'tt' &&
    c1.includes('lớp học') &&
    c2.includes('học phần') &&
    c3.includes('giảng viên') &&
    c4.includes('thời gian') &&
    c5.includes('phòng học')
  );
};

const isStopRow = (firstCell: string): boolean => {
  if (!firstCell) return false;
  return (
    /^Lịch trực/i.test(firstCell) ||
    /^Viện trưởng/i.test(firstCell) ||
    /^NBH:/i.test(firstCell) ||
    /^\(Đã ký\)/i.test(firstCell) ||
    /^PGS\./i.test(firstCell)
  );
};

const splitClassNames = (value: string): string[] => {
  if (!value) return [];

  return value
    .split(/[\n,;]/)
    .map(part => normalizeText(part))
    .filter(Boolean)
    .filter((item, index, arr) => arr.findIndex(v => v.toLowerCase() === item.toLowerCase()) === index);
};

const toStt = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ''), 10);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallback;
};

export const parseWeeklyScheduleExcel = async (file: File): Promise<WeeklyScheduleRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellStyles: true,
    cellFormula: true,
    cellNF: true,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Không tìm thấy sheet trong file Excel');
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Không đọc được sheet dữ liệu');
  }

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    blankrows: true,
  }) as unknown[][];

  const normalizedRows = aoa.map(row => row.map(normalizeText));
  const headerIndex = normalizedRows.findIndex(isHeaderRow);

  if (headerIndex < 0) {
    throw new Error('Không tìm thấy dòng tiêu đề bảng lịch tuần trong file Excel');
  }

  const rows: WeeklyScheduleRow[] = [];

  for (let i = headerIndex + 1; i < aoa.length; i += 1) {
    const sourceRow = aoa[i] || [];
    const row = normalizedRows[i] || [];

    const firstCell = row[0] || '';
    if (isStopRow(firstCell)) break;

    // Skip instruction / text rows that are not actual schedule rows.
    const hasAnyTableValue = [row[0], row[1], row[2], row[3], row[4], row[5], row[6]].some(Boolean);
    if (!hasAnyTableValue) continue;

    const isInstructionLike = !/^\d+$/.test((row[0] || '').replace(/[^\d]/g, '')) &&
      (!row[1] || row[1].length > 60) &&
      !row[2] &&
      !row[3] &&
      !row[4] &&
      !row[5];

    if (isInstructionLike) continue;

    const classNamesRaw = normalizeMultilineText(sourceRow[1] ?? row[1] ?? '');
    const classNames = splitClassNames(classNamesRaw);

    const subjectName = normalizeText(row[2] || '');
    const lecturerName = normalizeText(row[3] || '');
    const timeSlot = normalizeText(row[4] || '');
    const room = normalizeText(row[5] || '');
    const note = normalizeText(row[6] || '');

    // Ignore fully empty rows in data area.
    if (!classNames.length && !subjectName && !lecturerName && !timeSlot && !room && !note && !row[0]) {
      continue;
    }

    const stt = toStt(row[0] || '', rows.length + 1);

    rows.push({
      id: `import-${Date.now()}-${rows.length}`,
      stt,
      class_names: classNames,
      subject_name: subjectName,
      lecturer_name: lecturerName,
      time_slot: timeSlot,
      room,
      ghi_chu: note,
      isNew: true,
    });
  }

  if (!rows.length) {
    throw new Error('File Excel không có dữ liệu lịch học tuần hợp lệ để nhập');
  }

  return rows.map((row, index) => ({
    ...row,
    stt: index + 1,
  }));
};


