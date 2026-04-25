import * as XLSX from 'xlsx';
import type { WeeklyScheduleRow } from '~/types/weekly-schedule';

export interface ImportedScheduleRow extends WeeklyScheduleRow {
  /** Original row number in the spreadsheet (1-based, after the header). */
  __sheetRow?: number;
}

/**
 * Header aliases — accept several Vietnamese spellings since the user-supplied
 * Excel templates rarely match exactly. Keys are the canonical row fields.
 */
const HEADER_ALIASES: Record<keyof WeeklyScheduleRow, string[]> = {
  id: [],
  stt: ['stt', 'số tt', 'tt', 'no.'],
  class_names: ['lớp', 'lop', 'class', 'lớp học'],
  subject_name: ['môn', 'mon', 'môn học', 'tên môn', 'subject'],
  lecturer_name: ['giảng viên', 'gv', 'gv giảng dạy', 'lecturer', 'cán bộ giảng dạy'],
  time_slot: ['thời gian', 'giờ', 'time', 'time slot', 'tiết'],
  room: ['phòng', 'room', 'phòng học'],
  ghi_chu: ['ghi chú', 'ghi chu', 'note'],
  isNew: [],
};

function normalize(s: string): string {
  return s.normalize('NFC').toLowerCase().trim();
}

function buildHeaderMap(rawHeaders: string[]): Partial<Record<keyof WeeklyScheduleRow, number>> {
  const map: Partial<Record<keyof WeeklyScheduleRow, number>> = {};
  rawHeaders.forEach((h, idx) => {
    if (!h) return;
    const norm = normalize(String(h));
    (Object.entries(HEADER_ALIASES) as [keyof WeeklyScheduleRow, string[]][]).forEach(([field, aliases]) => {
      if (map[field] !== undefined) return;
      if (aliases.some((a) => norm === a || norm.includes(a))) {
        map[field] = idx;
      }
    });
  });
  return map;
}

export interface ParseExcelResult {
  rows: ImportedScheduleRow[];
  warnings: string[];
}

/**
 * Parse an Excel file into WeeklyScheduleRow[] suitable for the DataGrid.
 * Lớp column may contain comma/semicolon separated names.
 */
export async function parseWeeklyScheduleExcel(file: File): Promise<ParseExcelResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) {
    return { rows: [], warnings: ['File không có sheet nào'] };
  }
  const matrix = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1, blankrows: false, defval: '' });
  if (matrix.length < 2) {
    return { rows: [], warnings: ['File không có dữ liệu (cần ít nhất 1 dòng tiêu đề + 1 dòng dữ liệu)'] };
  }

  const headerMap = buildHeaderMap(matrix[0].map((c) => String(c ?? '')));
  const warnings: string[] = [];
  const requiredFields: (keyof WeeklyScheduleRow)[] = ['class_names', 'subject_name'];
  const missing = requiredFields.filter((f) => headerMap[f] === undefined);
  if (missing.length) {
    warnings.push(`Không tìm thấy cột bắt buộc: ${missing.join(', ')}. Hỗ trợ tiêu đề: ${missing.map((m) => HEADER_ALIASES[m].join('/')).join(' | ')}`);
  }

  const rows: ImportedScheduleRow[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const raw = matrix[i];
    const get = (field: keyof WeeklyScheduleRow): string => {
      const idx = headerMap[field];
      if (idx === undefined) return '';
      return String(raw[idx] ?? '').trim();
    };

    const classRaw = get('class_names');
    const classNames = classRaw
      ? classRaw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : [];

    const subject = get('subject_name');
    const lecturer = get('lecturer_name');
    if (!classNames.length && !subject && !lecturer) {
      // Fully blank row — skip silently.
      continue;
    }

    rows.push({
      id: `import-${i}`,
      stt: rows.length + 1,
      class_names: classNames,
      subject_name: subject,
      lecturer_name: lecturer,
      time_slot: get('time_slot'),
      room: get('room'),
      ghi_chu: get('ghi_chu'),
      isNew: true,
      __sheetRow: i + 1,
    });
  }

  if (!rows.length) {
    warnings.push('Không tìm thấy dòng dữ liệu hợp lệ nào');
  }
  return { rows, warnings };
}
